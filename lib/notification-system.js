// Internal Notification System for CRM
import { executeQuery, executeSingle } from './database';
import { v4 as uuidv4 } from 'uuid';

class InternalNotificationSystem {
    constructor() {
        this.notificationTypes = {
            TASK_ASSIGNED: 'task_assigned',
            PROJECT_ASSIGNED: 'project_assigned',
            SALE_CREATED: 'sale_created',
            REPORT_SUBMITTED: 'report_submitted',
            ACTIVITY_COMPLETED: 'activity_completed',
            PROJECT_COMPLETED: 'project_completed',
            MESSAGE_RECEIVED: 'message_received',
            TASK_COMPLETED: 'task_completed'
        };
    }

    // Create notification in database
    async createNotification(data) {
        try {
            const id = uuidv4();
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            await executeSingle(`
                INSERT INTO notifications (
                    id, user_id, type, title, message, 
                    related_id, related_type, is_read, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                data.userId,
                data.type,
                data.title,
                data.message,
                data.relatedId || null,
                data.relatedType || null,
                false,
                now
            ]);

            console.log(`✅ Internal notification created for user ${data.userId}: ${data.title}`);
            return { success: true, id };
        } catch (error) {
            console.error('❌ Error creating internal notification:', error);
            return { success: false, error: error.message };
        }
    }

    // 1. Task assigned notification
    async notifyTaskAssigned(taskData, assignedUserId) {
        return await this.createNotification({
            userId: assignedUserId,
            type: this.notificationTypes.TASK_ASSIGNED,
            title: `📋 وظیفه جدید: ${taskData.title}`,
            message: `وظیفه "${taskData.title}" به شما اختصاص داده شد. اولویت: ${this.getPriorityText(taskData.priority)}`,
            relatedId: taskData.id,
            relatedType: 'task'
        });
    }

    // 2. Project assigned notification  
    async notifyProjectAssigned(projectData, assignedUserId) {
        return await this.createNotification({
            userId: assignedUserId,
            type: this.notificationTypes.PROJECT_ASSIGNED,
            title: `🚀 پروژه جدید: ${projectData.title}`,
            message: `پروژه "${projectData.title}" به شما اختصاص داده شد. مهلت: ${projectData.deadline || 'تعیین نشده'}`,
            relatedId: projectData.id,
            relatedType: 'project'
        });
    }

    // 3. Sale created notification (for CEO)
    async notifySaleCreated(saleData, ceoUserId) {
        return await this.createNotification({
            userId: ceoUserId,
            type: this.notificationTypes.SALE_CREATED,
            title: `💰 فروش جدید: ${this.formatCurrency(saleData.total_amount)}`,
            message: `فروش جدید توسط ${saleData.sales_person_name} ثبت شد. مشتری: ${saleData.customer_name}`,
            relatedId: saleData.id,
            relatedType: 'sale'
        });
    }

    // 4. Report submitted notification
    async notifyReportSubmitted(reportData, managerUserId) {
        return await this.createNotification({
            userId: managerUserId,
            type: this.notificationTypes.REPORT_SUBMITTED,
            title: `📊 گزارش جدید: ${reportData.title}`,
            message: `گزارش "${reportData.title}" توسط ${reportData.submitted_by_name} ارسال شد`,
            relatedId: reportData.id,
            relatedType: 'report'
        });
    }

    // 5. Activity completed notification (for CEO)
    async notifyActivityCompleted(activityData, ceoUserId) {
        return await this.createNotification({
            userId: ceoUserId,
            type: this.notificationTypes.ACTIVITY_COMPLETED,
            title: `✅ فعالیت تکمیل شد: ${activityData.title}`,
            message: `فعالیت "${activityData.title}" توسط ${activityData.employee_name} تکمیل شد`,
            relatedId: activityData.id,
            relatedType: 'activity'
        });
    }

    // 6. Project completed notification (for CEO)
    async notifyProjectCompleted(projectData, ceoUserId) {
        return await this.createNotification({
            userId: ceoUserId,
            type: this.notificationTypes.PROJECT_COMPLETED,
            title: `🎉 پروژه تکمیل شد: ${projectData.title}`,
            message: `پروژه "${projectData.title}" توسط ${projectData.completed_by_name} تکمیل شد`,
            relatedId: projectData.id,
            relatedType: 'project'
        });
    }

    // 7. Task completed notification (for CEO)
    async notifyTaskCompleted(taskData, ceoUserId) {
        return await this.createNotification({
            userId: ceoUserId,
            type: this.notificationTypes.TASK_COMPLETED,
            title: `✅ وظیفه تکمیل شد: ${taskData.title}`,
            message: `وظیفه "${taskData.title}" توسط ${taskData.completed_by_name} تکمیل شد`,
            relatedId: taskData.id,
            relatedType: 'task'
        });
    }

    // 8. Message received notification
    async notifyMessageReceived(messageData, receiverUserId) {
        return await this.createNotification({
            userId: receiverUserId,
            type: this.notificationTypes.MESSAGE_RECEIVED,
            title: `💬 پیام جدید از ${messageData.sender_name}`,
            message: messageData.content.length > 50 ?
                messageData.content.substring(0, 50) + '...' :
                messageData.content,
            relatedId: messageData.id,
            relatedType: 'message'
        });
    }

    // Get unread notifications for user
    async getUnreadNotifications(userId, limit = 10) {
        try {
            const notifications = await executeQuery(`
                SELECT * FROM notifications 
                WHERE user_id = ? AND is_read = FALSE 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [userId, limit]);

            return { success: true, data: notifications };
        } catch (error) {
            console.error('❌ Error getting unread notifications:', error);
            return { success: false, error: error.message };
        }
    }

    // Get notification history for user
    async getNotificationHistory(userId, limit = 30) {
        try {
            const notifications = await executeQuery(`
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [userId, limit]);

            return { success: true, data: notifications };
        } catch (error) {
            console.error('❌ Error getting notification history:', error);
            return { success: false, error: error.message };
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            await executeSingle(`
                UPDATE notifications 
                SET is_read = TRUE, read_at = NOW() 
                WHERE id = ? AND user_id = ?
            `, [notificationId, userId]);

            return { success: true };
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }

    // Mark all notifications as read for user
    async markAllAsRead(userId) {
        try {
            await executeSingle(`
                UPDATE notifications 
                SET is_read = TRUE, read_at = NOW() 
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);

            return { success: true };
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            return { success: false, error: error.message };
        }
    }

    // Get unread count for user
    async getUnreadCount(userId) {
        try {
            const result = await executeSingle(`
                SELECT COUNT(*) as count FROM notifications 
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);

            return { success: true, count: result.count || 0 };
        } catch (error) {
            console.error('❌ Error getting unread count:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper methods
    getPriorityText(priority) {
        const priorities = {
            'low': '🟢 کم',
            'medium': '🟡 متوسط',
            'high': '🔴 بالا',
            'urgent': '🚨 فوری'
        };
        return priorities[priority] || priority;
    }

    formatCurrency(amount, currency = 'IRR') {
        if (currency === 'IRR') {
            return `${(amount / 1000000).toLocaleString('fa-IR')} میلیون تومان`;
        }
        return `${amount.toLocaleString('fa-IR')} ${currency}`;
    }

    getNotificationIcon(type) {
        const icons = {
            [this.notificationTypes.TASK_ASSIGNED]: '📋',
            [this.notificationTypes.PROJECT_ASSIGNED]: '🚀',
            [this.notificationTypes.SALE_CREATED]: '💰',
            [this.notificationTypes.REPORT_SUBMITTED]: '📊',
            [this.notificationTypes.ACTIVITY_COMPLETED]: '✅',
            [this.notificationTypes.PROJECT_COMPLETED]: '🎉',
            [this.notificationTypes.MESSAGE_RECEIVED]: '💬',
            [this.notificationTypes.TASK_COMPLETED]: '✅'
        };
        return icons[type] || '🔔';
    }
}

const notificationSystem = new InternalNotificationSystem();
export default notificationSystem;

module.exports = new InternalNotificationSystem();