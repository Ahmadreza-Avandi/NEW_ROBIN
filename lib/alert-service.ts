/**
 * Alert Service
 * 
 * This service manages alerts for the sales pipeline system including:
 * - Creating and storing alerts in database
 * - Retrieving alerts for display
 * - Managing alert status (read/unread, dismissed)
 * - Cleanup of old alerts
 * 
 * Requirements: 9.1 - Follow-up alert system
 */

import { getTenantConnection } from './tenant-database';
import { FollowUpAlert } from './sales-pipeline-types';

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  user_id?: string;
  customer_id?: string;
  deal_id?: string;
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export class AlertService {
  
  /**
   * Create and store an alert in the database
   */
  async createAlert(tenantKey: string, alertData: Omit<Alert, 'id' | 'created_at' | 'is_read'>): Promise<string> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [result] = await connection.query(`
        INSERT INTO alerts (
          type, title, message, priority, user_id, customer_id,
          deal_id, is_read, is_dismissed, action_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        alertData.type,
        alertData.title,
        alertData.message,
        alertData.priority,
        alertData.user_id || null,
        alertData.customer_id || null,
        alertData.deal_id || null,
        false,
        false,
        alertData.action_url || null
      ]) as any[];

      const alertId = result.insertId;
      console.log(`✅ هشدار جدید ایجاد شد: ${alertData.title}`);
      
      return alertId;

    } catch (error) {
      console.error('❌ خطا در ایجاد هشدار:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Get all alerts for a tenant
   */
  async getAlerts(tenantKey: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    priority?: 'high' | 'medium' | 'low';
  } = {}): Promise<Alert[]> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      let whereClause = 'WHERE is_dismissed = FALSE';
      const params: any[] = [];

      if (options.unreadOnly) {
        whereClause += ' AND is_read = FALSE';
      }

      if (options.priority) {
        whereClause += ' AND priority = ?';
        params.push(options.priority);
      }

      let limitClause = '';
      if (options.limit) {
        limitClause = ` LIMIT ${options.limit}`;
        if (options.offset) {
          limitClause += ` OFFSET ${options.offset}`;
        }
      }

      const [alerts] = await connection.query(`
        SELECT * FROM alerts 
        ${whereClause}
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          created_at DESC
        ${limitClause}
      `, params) as any[];

      return alerts;

    } catch (error) {
      console.error('❌ خطا در دریافت هشدارها:', error);
      return [];
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Get unread alerts count
   */
  async getUnreadCount(tenantKey: string): Promise<number> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [result] = await connection.query(`
        SELECT COUNT(*) as count FROM alerts 
        WHERE is_read = FALSE AND is_dismissed = FALSE
      `) as any[];

      return result[0].count;

    } catch (error) {
      console.error('❌ خطا در شمارش هشدارهای خوانده نشده:', error);
      return 0;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(tenantKey: string, alertId: string): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      await connection.query(`
        UPDATE alerts 
        SET is_read = TRUE, read_at = NOW() 
        WHERE id = ?
      `, [alertId]);

      console.log(`✅ هشدار ${alertId} به عنوان خوانده شده علامت‌گذاری شد`);

    } catch (error) {
      console.error('❌ خطا در علامت‌گذاری هشدار:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(tenantKey: string): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      await connection.query(`
        UPDATE alerts 
        SET is_read = TRUE, read_at = NOW() 
        WHERE is_read = FALSE
      `);

      console.log(`✅ همه هشدارها به عنوان خوانده شده علامت‌گذاری شدند`);

    } catch (error) {
      console.error('❌ خطا در علامت‌گذاری همه هشدارها:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Dismiss alert (soft delete)
   */
  async dismissAlert(tenantKey: string, alertId: string): Promise<void> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      await connection.query(`
        UPDATE alerts 
        SET is_dismissed = TRUE 
        WHERE id = ?
      `, [alertId]);

      console.log(`✅ هشدار ${alertId} رد شد`);

    } catch (error) {
      console.error('❌ خطا در رد کردن هشدار:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Clean up old alerts (older than specified days)
   */
  async cleanupOldAlerts(tenantKey: string, daysOld: number = 30): Promise<number> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [result] = await connection.query(`
        DELETE FROM alerts 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
          AND (is_read = TRUE OR is_dismissed = TRUE)
      `, [daysOld]) as any[];

      const deletedCount = result.affectedRows;
      
      if (deletedCount > 0) {
        console.log(`🧹 ${deletedCount} هشدار قدیمی پاک شد`);
      }

      return deletedCount;

    } catch (error) {
      console.error('❌ خطا در پاک‌سازی هشدارهای قدیمی:', error);
      return 0;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Convert FollowUpAlert to Alert format and store in database
   */
  async storeFollowUpAlerts(tenantKey: string, followUpAlerts: FollowUpAlert[]): Promise<void> {
    if (followUpAlerts.length === 0) {
      return;
    }

    try {
      for (const followUpAlert of followUpAlerts) {
        // Check if similar alert already exists (to avoid duplicates)
        const existingAlert = await this.findSimilarAlert(tenantKey, followUpAlert);
        
        if (!existingAlert) {
          await this.createAlert(tenantKey, {
            type: followUpAlert.type === 'urgent' ? 'error' : 'warning',
            title: followUpAlert.title,
            message: `${followUpAlert.message}${followUpAlert.days_overdue ? ` (${followUpAlert.days_overdue} روز عقب‌افتاده)` : ''}`,
            customer_id: followUpAlert.lead_id,
            priority: followUpAlert.priority,
            is_dismissed: false
          });
        }
      }

      console.log(`✅ ${followUpAlerts.length} هشدار پیگیری در دیتابیس ذخیره شد`);

    } catch (error) {
      console.error('❌ خطا در ذخیره هشدارهای پیگیری:', error);
      throw error;
    }
  }

  /**
   * Find similar alert to avoid duplicates
   */
  private async findSimilarAlert(tenantKey: string, followUpAlert: FollowUpAlert): Promise<Alert | null> {
    let connection;

    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      const [alerts] = await connection.query(`
        SELECT * FROM alerts 
        WHERE customer_id = ? 
          AND type = ?
          AND is_read = FALSE
          AND is_dismissed = FALSE
          AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
      `, [followUpAlert.lead_id, followUpAlert.type === 'urgent' ? 'error' : 'warning']) as any[];

      return alerts.length > 0 ? alerts[0] : null;

    } catch (error) {
      console.error('❌ خطا در جستجوی هشدار مشابه:', error);
      return null;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Get alerts for dashboard display
   */
  async getDashboardAlerts(tenantKey: string): Promise<Alert[]> {
    return this.getAlerts(tenantKey, {
      limit: 5,
      unreadOnly: false
    });
  }

  /**
   * Get high priority alerts
   */
  async getHighPriorityAlerts(tenantKey: string): Promise<Alert[]> {
    return this.getAlerts(tenantKey, {
      priority: 'high',
      unreadOnly: true,
      limit: 10
    });
  }
}

/**
 * Singleton instance
 */
export const alertService = new AlertService();

/**
 * Utility functions
 */
export const AlertUtils = {
  /**
   * Format alert message for display
   */
  formatAlertMessage(alert: Alert): string {
    if (alert.days_overdue && alert.days_overdue > 0) {
      return `${alert.message} (${alert.days_overdue} روز عقب‌افتاده)`;
    }
    return alert.message;
  },

  /**
   * Get alert icon based on type
   */
  getAlertIcon(type: Alert['type']): string {
    const icons = {
      'warning': '⚠️',
      'error': '🚨',
      'info': 'ℹ️',
      'success': '✅'
    };
    return icons[type] || '📢';
  },

  /**
   * Get alert color class based on priority
   */
  getAlertColorClass(priority: Alert['priority']): string {
    const colors = {
      'high': 'border-red-500 bg-red-50 text-red-800',
      'medium': 'border-orange-500 bg-orange-50 text-orange-800',
      'low': 'border-blue-500 bg-blue-50 text-blue-800'
    };
    return colors[priority] || colors.medium;
  }
};