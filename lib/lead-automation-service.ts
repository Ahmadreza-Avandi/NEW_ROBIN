/**
 * Lead Automation Service
 * 
 * This service handles automated processes for the sales pipeline including:
 * - Follow-up alert generation
 * - Automatic task creation on stage changes
 * - Lead to customer conversion logic
 * - Activity logging for stage changes
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */

import { getTenantConnection } from './tenant-database';
import { logActivity } from './activity-logger';
import { Lead, FollowUpAlert, PipelineStageType } from './sales-pipeline-types';
import { alertService } from './alert-service';

export class LeadAutomationService {
  
  /**
   * Generate follow-up alerts for overdue leads
   * Requirement 9.1: Generate alert when lead has not been followed up for more than 3 days
   */
  async generateFollowUpAlerts(tenantKey: string): Promise<FollowUpAlert[]> {
    let connection;
    const alerts: FollowUpAlert[] = [];

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      // Find leads that haven't been followed up for more than 3 days
      const [overdueLeads] = await connection.query(`
        SELECT c.*, u.name as sales_owner_name,
               DATEDIFF(NOW(), COALESCE(c.last_followup_date, c.created_at)) as days_overdue
        FROM customers c
        LEFT JOIN users u ON c.sales_owner = u.id AND c.tenant_key = u.tenant_key
        WHERE c.tenant_key = ? 
          AND c.type = 'lead'
          AND c.current_pipeline_stage NOT IN ('closed_won', 'closed_lost')
          AND DATEDIFF(NOW(), COALESCE(c.last_followup_date, c.created_at)) > 3
        ORDER BY days_overdue DESC
      `, [tenantKey]) as any[];

      for (const lead of overdueLeads) {
        const priority = this.calculateAlertPriority(lead);
        
        alerts.push({
          id: `alert_${lead.id}_${Date.now()}`,
          type: priority === 'high' ? 'urgent' : 'warning',
          title: 'سرنخ نیاز به پیگیری دارد',
          message: `${lead.name} بیش از ${lead.days_overdue} روز پیگیری نشده است`,
          lead_id: lead.id,
          lead_name: lead.name,
          priority: priority,
          created_at: new Date().toISOString(),
          is_read: false,
          days_overdue: lead.days_overdue
        });
      }

      return alerts;

    } catch (error) {
      console.error('❌ خطا در تولید هشدارهای پیگیری:', error);
      return [];
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Create automatic follow-up task when stage changes
   * Requirement 9.2: Automatically create follow-up task when lead stage is changed
   */
  async createStageChangeTask(
    tenantKey: string,
    leadId: string,
    newStage: PipelineStageType,
    changedBy: string
  ): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      // Get lead information
      const [leads] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND tenant_key = ?',
        [leadId, tenantKey]
      ) as any[];

      if (leads.length === 0) {
        throw new Error('Lead not found');
      }

      const lead = leads[0];

      // Don't create tasks for closed stages
      if (newStage === 'closed_won' || newStage === 'closed_lost') {
        return;
      }

      const taskTitle = this.getFollowUpTaskTitle(newStage);
      const taskDescription = this.getFollowUpTaskDescription(newStage, lead.name);
      const dueDate = this.calculateTaskDueDate(newStage);
      const priority = this.calculateTaskPriority(newStage, lead.lead_temperature);

      // Create the task
      await connection.query(`
        INSERT INTO tasks (
          tenant_key, title, description, assigned_to, customer_id,
          due_date, priority, status, assigned_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        tenantKey,
        taskTitle,
        taskDescription,
        lead.sales_owner || changedBy,
        leadId,
        dueDate,
        priority,
        'pending',
        changedBy
      ]);

      console.log(`✅ وظیفه پیگیری برای سرنخ ${lead.name} در مرحله ${newStage} ایجاد شد`);

    } catch (error) {
      console.error('❌ خطا در ایجاد وظیفه پیگیری:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Automatically convert lead to customer when marked as closed_won
   * Requirement 9.3: Automatically change customer type from 'lead' to 'customer' when marked as 'closed_won'
   */
  async convertLeadToCustomer(
    tenantKey: string,
    leadId: string,
    changedBy: string,
    saleAmount?: number
  ): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      // Start transaction
      await connection.beginTransaction();

      // Get lead information
      const [leads] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND tenant_key = ?',
        [leadId, tenantKey]
      ) as any[];

      if (leads.length === 0) {
        await connection.rollback();
        throw new Error('Lead not found');
      }

      const lead = leads[0];

      // Convert lead to customer
      await connection.query(`
        UPDATE customers SET 
          type = 'customer',
          updated_at = NOW()
        WHERE id = ? AND tenant_key = ?
      `, [leadId, tenantKey]);

      // Create sale record if amount provided
      if (saleAmount && saleAmount > 0) {
        await connection.query(`
          INSERT INTO sales (
            tenant_key, customer_id, customer_name, total_amount, sale_date,
            payment_status, notes, sales_person_id, sales_person_name, created_at, updated_at
          ) VALUES (?, ?, ?, ?, NOW(), 'paid', ?, ?, ?, NOW(), NOW())
        `, [
          tenantKey,
          leadId,
          lead.name,
          saleAmount,
          'فروش ناشی از تبدیل خودکار سرنخ',
          lead.sales_owner || changedBy,
          lead.assigned_user_name || 'سیستم'
        ]);
      }

      // Create post-conversion follow-up task
      await connection.query(`
        INSERT INTO tasks (
          tenant_key, title, description, assigned_to, customer_id,
          due_date, priority, status, assigned_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, ?, NOW(), NOW())
      `, [
        tenantKey,
        `پیگیری مشتری جدید: ${lead.name}`,
        `پیگیری و ارائه خدمات پس از فروش به مشتری ${lead.name}`,
        lead.sales_owner || changedBy,
        leadId,
        'high',
        'pending',
        changedBy
      ]);

      // Commit transaction
      await connection.commit();

      console.log(`✅ سرنخ ${lead.name} با موفقیت به مشتری تبدیل شد`);

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('❌ خطا در تبدیل سرنخ به مشتری:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Log stage changes as activities
   * Requirement 9.5: Log all stage changes as activities in the Activities_Module
   */
  async logStageChangeActivity(
    tenantKey: string,
    leadId: string,
    leadName: string,
    fromStage: PipelineStageType,
    toStage: PipelineStageType,
    changedBy: string,
    changedByName: string,
    reason?: string
  ): Promise<void> {
    try {
      const fromStageDisplay = this.getStageDisplayName(fromStage);
      const toStageDisplay = this.getStageDisplayName(toStage);

      await logActivity({
        tenantKey,
        userId: changedBy,
        userName: changedByName,
        type: 'lead',
        title: `تغییر مرحله سرنخ: ${leadName}`,
        description: `مرحله سرنخ ${leadName} از "${fromStageDisplay}" به "${toStageDisplay}" تغییر کرد${reason ? ` - دلیل: ${reason}` : ''}`,
        customerId: leadId,
        customerName: leadName
      });

      console.log(`✅ فعالیت تغییر مرحله برای سرنخ ${leadName} ثبت شد`);

    } catch (error) {
      console.error('❌ خطا در ثبت فعالیت تغییر مرحله:', error);
      throw error;
    }
  }

  /**
   * Check and process all automation rules for a tenant
   */
  async processAutomationRules(tenantKey: string): Promise<void> {
    try {
      // Generate follow-up alerts
      const alerts = await this.generateFollowUpAlerts(tenantKey);
      
      if (alerts.length > 0) {
        console.log(`✅ ${alerts.length} هشدار پیگیری تولید شد`);
        // Store alerts in database
        await alertService.storeFollowUpAlerts(tenantKey, alerts);
      }

      // Additional automation rules can be processed here
      
    } catch (error) {
      console.error('❌ خطا در پردازش قوانین اتوماسیون:', error);
    }
  }

  /**
   * Schedule automation jobs (to be called by a cron job or scheduler)
   */
  async scheduleAutomationJobs(): Promise<void> {
    try {
      // This would typically be implemented with a job scheduler
      // For now, just log that it would be scheduled
      console.log('🔄 وظایف اتوماسیون زمان‌بندی شدند');
      
      // Example: Run automation every hour
      // setInterval(() => {
      //   this.processAutomationRules(tenantKey);
      // }, 60 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ خطا در زمان‌بندی وظایف اتوماسیون:', error);
    }
  }

  /**
   * Private helper methods
   */

  private calculateAlertPriority(lead: any): 'high' | 'medium' | 'low' {
    if (lead.lead_temperature === 'hot' || lead.days_overdue > 7) {
      return 'high';
    } else if (lead.lead_temperature === 'warm' || lead.days_overdue > 5) {
      return 'medium';
    }
    return 'low';
  }

  private getFollowUpTaskTitle(stage: PipelineStageType): string {
    const taskTitles: Record<PipelineStageType, string> = {
      'new_lead': 'تماس اولیه با سرنخ جدید',
      'contacted': 'نیازسنجی و بررسی نیازهای مشتری',
      'needs_analysis': 'آماده‌سازی و ارسال پیشنهاد',
      'proposal_sent': 'پیگیری پیشنهاد و شروع مذاکره',
      'negotiation': 'نهایی‌سازی مذاکرات و بستن قرارداد',
      'closed_won': 'پیگیری مشتری جدید',
      'closed_lost': 'بررسی دلایل عدم موفقیت'
    };
    return taskTitles[stage] || 'پیگیری سرنخ';
  }

  private getFollowUpTaskDescription(stage: PipelineStageType, leadName: string): string {
    const descriptions: Record<PipelineStageType, string> = {
      'new_lead': `برقراری تماس اولیه با سرنخ جدید ${leadName} و معرفی خدمات`,
      'contacted': `انجام نیازسنجی دقیق و شناسایی نیازهای ${leadName}`,
      'needs_analysis': `آماده‌سازی پیشنهاد مناسب بر اساس نیازهای شناسایی شده ${leadName}`,
      'proposal_sent': `پیگیری پیشنهاد ارسالی و پاسخ به سوالات ${leadName}`,
      'negotiation': `ادامه مذاکرات و نهایی‌سازی شرایط قرارداد با ${leadName}`,
      'closed_won': `پیگیری و ارائه خدمات پس از فروش به مشتری ${leadName}`,
      'closed_lost': `بررسی دلایل عدم موفقیت و یادگیری از تجربه ${leadName}`
    };
    return descriptions[stage] || `پیگیری سرنخ ${leadName}`;
  }

  private calculateTaskDueDate(stage: PipelineStageType): string {
    const daysToAdd: Record<PipelineStageType, number> = {
      'new_lead': 1,      // 1 day for initial contact
      'contacted': 3,     // 3 days for needs analysis
      'needs_analysis': 5, // 5 days to prepare proposal
      'proposal_sent': 3,  // 3 days to follow up on proposal
      'negotiation': 7,    // 7 days for negotiation
      'closed_won': 7,     // 7 days for post-sale follow-up
      'closed_lost': 30    // 30 days for lessons learned review
    };

    const days = daysToAdd[stage] || 3;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    
    return dueDate.toISOString().split('T')[0];
  }

  private calculateTaskPriority(stage: PipelineStageType, temperature: string): 'high' | 'medium' | 'low' {
    if (temperature === 'hot') {
      return 'high';
    } else if (stage === 'negotiation' || stage === 'proposal_sent') {
      return 'high';
    } else if (temperature === 'warm') {
      return 'medium';
    }
    return 'low';
  }

  private getStageDisplayName(stage: PipelineStageType): string {
    const stageNames = {
      'new_lead': 'سرنخ جدید',
      'contacted': 'تماس اولیه',
      'needs_analysis': 'نیازسنجی',
      'proposal_sent': 'ارسال پیشنهاد',
      'negotiation': 'مذاکره',
      'closed_won': 'برنده شده',
      'closed_lost': 'از دست رفته'
    };
    return stageNames[stage] || stage;
  }
}

/**
 * Singleton instance for global use
 */
export const leadAutomationService = new LeadAutomationService();

/**
 * Utility functions for automation
 */
export const AutomationUtils = {
  /**
   * Check if a lead needs follow-up
   */
  needsFollowUp(lead: Lead, daysThreshold: number = 3): boolean {
    if (!lead.last_followup_date) {
      return true;
    }

    const lastFollowup = new Date(lead.last_followup_date);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - lastFollowup.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays > daysThreshold;
  },

  /**
   * Get overdue leads for a tenant
   */
  async getOverdueLeads(tenantKey: string, daysThreshold: number = 3): Promise<Lead[]> {
    let connection;
    
    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [leads] = await connection.query(`
        SELECT * FROM customers 
        WHERE tenant_key = ? 
          AND type = 'lead'
          AND current_pipeline_stage NOT IN ('closed_won', 'closed_lost')
          AND DATEDIFF(NOW(), COALESCE(last_followup_date, created_at)) > ?
        ORDER BY last_followup_date ASC
      `, [tenantKey, daysThreshold]) as any[];

      return leads;

    } catch (error) {
      console.error('❌ خطا در دریافت سرنخ‌های عقب‌افتاده:', error);
      return [];
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Get leads by temperature
   */
  async getLeadsByTemperature(tenantKey: string, temperature: 'hot' | 'warm' | 'cold'): Promise<Lead[]> {
    let connection;
    
    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [leads] = await connection.query(`
        SELECT * FROM customers 
        WHERE tenant_key = ? 
          AND type = 'lead'
          AND lead_temperature = ?
        ORDER BY updated_at DESC
      `, [tenantKey, temperature]) as any[];

      return leads;

    } catch (error) {
      console.error('❌ خطا در دریافت سرنخ‌ها بر اساس دما:', error);
      return [];
    } finally {
      if (connection) connection.release();
    }
  }
};