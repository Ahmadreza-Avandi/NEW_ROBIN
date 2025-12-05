import { getTenantConnection } from './tenant-database';

interface ActivityLogParams {
  tenantKey: string;
  userId: string;
  userName?: string;
  type: 'sale' | 'product' | 'customer' | 'other';
  title: string;
  description?: string;
  customerId?: string;
  customerName?: string;
}

/**
 * ثبت خودکار فعالیت برای اقدامات کاربران
 */
export async function logActivity(params: ActivityLogParams): Promise<void> {
  const {
    tenantKey,
    userId,
    userName,
    type,
    title,
    description,
    customerId,
    customerName
  } = params;

  try {
    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      await conn.query(
        `INSERT INTO activities (
          id, 
          tenant_key, 
          customer_id, 
          type, 
          title, 
          description, 
          outcome, 
          start_time, 
          performed_by, 
          created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          tenantKey,
          customerId || null,
          type,
          title,
          description || null,
          'completed',
          new Date().toISOString(),
          userId
        ]
      );

      console.log(`✅ فعالیت ثبت شد: ${title} توسط ${userName || userId}`);
    } finally {
      conn.release();
    }
  } catch (error) {
    // لاگ خطا ولی عملیات اصلی رو متوقف نکن
    console.error('❌ خطا در ثبت خودکار فعالیت:', error);
  }
}
