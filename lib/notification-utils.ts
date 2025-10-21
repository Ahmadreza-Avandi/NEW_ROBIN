import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateNotificationData {
    user_id: string;
    title: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

export async function createNotification(data: CreateNotificationData) {
    try {
        const notificationId = uuidv4();

        await executeSingle(`
      INSERT INTO notifications (
        id, user_id, title, message, type, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
            notificationId,
            data.user_id,
            data.title,
            data.message || null,
            data.type || 'info',
            false
        ]);

        return { success: true, id: notificationId };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
    }
}

export async function createSaleNotification(saleData: {
    customer_name: string;
    total_amount: number;
    currency: string;
    sales_person_name: string;
}) {
    try {
        // Get all users who should receive sale notifications (CEO, managers)
        const users = await executeQuery(`
      SELECT id, name, role 
      FROM users 
      WHERE role IN ('ceo', 'sales_manager', 'manager') 
      AND is_active = 1
    `);

        const notifications = [];

        for (const user of users) {
            const amount = saleData.total_amount >= 1000000
                ? `${(saleData.total_amount / 1000000).toFixed(1)} میلیون تومان`
                : `${saleData.total_amount.toLocaleString('fa-IR')} تومان`;

            const result = await createNotification({
                user_id: user.id,
                title: 'فروش جدید ثبت شد',
                message: `${saleData.sales_person_name} فروشی به مبلغ ${amount} به ${saleData.customer_name} ثبت کرد`,
                type: 'success'
            });

            notifications.push(result);
        }

        return { success: true, notifications };
    } catch (error) {
        console.error('Error creating sale notifications:', error);
        return { success: false, error };
    }
}

export async function createCustomerNotification(customerData: {
    customer_name: string;
    created_by_name: string;
}) {
    try {
        // Get all users who should receive customer notifications
        const users = await executeQuery(`
      SELECT id, name, role 
      FROM users 
      WHERE role IN ('ceo', 'sales_manager', 'manager') 
      AND is_active = 1
    `);

        const notifications = [];

        for (const user of users) {
            const result = await createNotification({
                user_id: user.id,
                title: 'مشتری جدید اضافه شد',
                message: `${customerData.created_by_name} مشتری جدیدی با نام ${customerData.customer_name} اضافه کرد`,
                type: 'info'
            });

            notifications.push(result);
        }

        return { success: true, notifications };
    } catch (error) {
        console.error('Error creating customer notifications:', error);
        return { success: false, error };
    }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
    try {
        await executeSingle(`
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error };
    }
}

export async function markAllNotificationsAsRead(userId: string) {
    try {
        await executeSingle(`
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error };
    }
}