/**
 * Sales Pipeline Background Jobs
 * 
 * This service handles background jobs for the sales pipeline system including:
 * - Periodic follow-up alert generation
 * - Temperature updates
 * - Automation rule processing
 */

import { leadAutomationService } from './lead-automation-service';
import { leadTemperatureService } from './lead-temperature-service';
import { getTenantConnection } from './tenant-database';

export class SalesPipelineJobService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start background jobs
   */
  start(intervalMinutes: number = 60): void {
    if (this.isRunning) {
      console.log('⚠️ وظایف پس‌زمینه قبلاً شروع شده‌اند');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 شروع وظایف پس‌زمینه sales pipeline (هر ${intervalMinutes} دقیقه)`);

    // Run immediately
    this.runJobs();

    // Schedule periodic runs
    this.intervalId = setInterval(() => {
      this.runJobs();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop background jobs
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('⏹️ وظایف پس‌زمینه sales pipeline متوقف شدند');
  }

  /**
   * Run all background jobs
   */
  private async runJobs(): Promise<void> {
    try {
      console.log('🔄 اجرای وظایف پس‌زمینه sales pipeline...');

      // Get all active tenants
      const tenants = await this.getActiveTenants();

      for (const tenant of tenants) {
        try {
          await this.runJobsForTenant(tenant.tenant_key);
        } catch (error) {
          console.error(`❌ خطا در اجرای وظایف برای tenant ${tenant.tenant_key}:`, error);
        }
      }

      console.log('✅ وظایف پس‌زمینه sales pipeline تکمیل شدند');

    } catch (error) {
      console.error('❌ خطا در اجرای وظایف پس‌زمینه:', error);
    }
  }

  /**
   * Run jobs for a specific tenant
   */
  private async runJobsForTenant(tenantKey: string): Promise<void> {
    console.log(`🔄 پردازش وظایف برای tenant: ${tenantKey}`);

    // 1. Process automation rules (generate alerts)
    await leadAutomationService.processAutomationRules(tenantKey);

    // 2. Update lead temperatures
    await this.updateLeadTemperatures(tenantKey);

    // 3. Clean up old alerts (optional)
    await this.cleanupOldAlerts(tenantKey);

    console.log(`✅ وظایف برای tenant ${tenantKey} تکمیل شدند`);
  }

  /**
   * Update lead temperatures for all leads in a tenant
   */
  private async updateLeadTemperatures(tenantKey: string): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      // Get all active leads
      const [leads] = await connection.query(`
        SELECT * FROM customers 
        WHERE tenant_key = ? 
          AND type = 'lead'
          AND current_pipeline_stage NOT IN ('closed_won', 'closed_lost')
      `, [tenantKey]) as any[];

      let updatedCount = 0;

      for (const lead of leads) {
        const newTemperature = leadTemperatureService.calculateLeadTemperature(lead);
        
        if (lead.lead_temperature !== newTemperature) {
          await connection.query(
            'UPDATE customers SET lead_temperature = ?, updated_at = NOW() WHERE id = ? AND tenant_key = ?',
            [newTemperature, lead.id, tenantKey]
          );
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`🌡️ ${updatedCount} سرنخ در tenant ${tenantKey} دمای به‌روزرسانی شده`);
      }

    } catch (error) {
      console.error(`❌ خطا در به‌روزرسانی دمای سرنخ‌ها برای tenant ${tenantKey}:`, error);
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Clean up old alerts (older than 30 days)
   */
  private async cleanupOldAlerts(tenantKey: string): Promise<void> {
    // This would clean up old alerts from database
    // For now, just log that it would be done
    console.log(`🧹 پاک‌سازی هشدارهای قدیمی برای tenant ${tenantKey}`);
  }

  /**
   * Get all active tenants
   */
  private async getActiveTenants(): Promise<{ tenant_key: string }[]> {
    // This would typically query a master database for active tenants
    // For now, return a default tenant
    return [{ tenant_key: 'rabin' }];
  }

  /**
   * Get job status
   */
  getStatus(): { isRunning: boolean; intervalId: number | null } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? Number(this.intervalId) : null
    };
  }
}

/**
 * Singleton instance
 */
export const salesPipelineJobService = new SalesPipelineJobService();

/**
 * Utility functions for manual job execution
 */
export const JobUtils = {
  /**
   * Manually run jobs for a specific tenant
   */
  async runForTenant(tenantKey: string): Promise<void> {
    const jobService = new SalesPipelineJobService();
    await jobService['runJobsForTenant'](tenantKey);
  },

  /**
   * Generate alerts for a specific tenant
   */
  async generateAlertsForTenant(tenantKey: string): Promise<void> {
    await leadAutomationService.processAutomationRules(tenantKey);
  },

  /**
   * Update temperatures for a specific tenant
   */
  async updateTemperaturesForTenant(tenantKey: string): Promise<void> {
    const jobService = new SalesPipelineJobService();
    await jobService['updateLeadTemperatures'](tenantKey);
  }
};