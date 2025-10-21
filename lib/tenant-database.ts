import mysql from 'mysql2/promise';

/**
 * Tenant Database Connection
 * این ماژول برای اتصال به دیتابیس‌های تنانت‌ها استفاده میشه
 * در حال حاضر همه تنانت‌ها از یک دیتابیس مشترک (crm_system) استفاده می‌کنند
 * در آینده هر تنانت می‌تواند دیتابیس جداگانه داشته باشد
 */

// Cache برای connection pool های تنانت‌ها
const tenantPools = new Map<string, mysql.Pool>();

/**
 * دریافت connection pool برای یک تنانت خاص
 */
export async function getTenantConnection(tenantKey: string): Promise<mysql.Pool> {
  // اگر pool برای این تنانت وجود داره، برگردون
  if (tenantPools.has(tenantKey)) {
    return tenantPools.get(tenantKey)!;
  }

  // در حال حاضر همه تنانت‌ها از یک دیتابیس استفاده می‌کنند
  // در آینده می‌توان از جدول tenants اطلاعات دیتابیس هر تنانت را خواند
  const dbConfig = {
    host: process.env.DATABASE_HOST || process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
    user: process.env.DATABASE_USER || process.env.DB_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
    connectTimeout: 10000,
  };

  // ایجاد pool جدید
  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // ذخیره در cache
  tenantPools.set(tenantKey, pool);

  return pool;
}

/**
 * بستن تمام connection pool ها
 */
export async function closeAllTenantConnections() {
  for (const [tenantKey, pool] of tenantPools.entries()) {
    await pool.end();
    tenantPools.delete(tenantKey);
  }
}
