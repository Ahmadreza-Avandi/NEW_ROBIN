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
  
  // تشخیص هوشمند محیط اجرا
  const isDocker = process.env.DOCKER_CONTAINER === 'true' || 
                   process.env.HOSTNAME?.includes('docker') ||
                   process.env.HOSTNAME?.includes('nextjs') ||
                   process.env.HOSTNAME?.includes('crm');
  
  const isLocal = process.env.NODE_ENV === 'development' && !isDocker;
  
  // Smart host detection
  let host = process.env.DATABASE_HOST || process.env.DB_HOST;
  if (isLocal && (host === 'mysql' || !host)) {
    host = 'localhost';
  } else if (isDocker && (host === 'localhost' || !host)) {
    host = 'mysql';
  } else if (!host) {
    host = isDocker ? 'mysql' : 'localhost';
  }
  
  // Smart user detection
  let user = process.env.DATABASE_USER || process.env.DB_USER;
  if (!user) {
    user = isLocal ? 'root' : 'crm_user';
  }
  
  // Smart password detection
  let password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
  if (!password) {
    password = isLocal ? '' : '1234';
  }
  
  const dbConfig = {
    host,
    port: 3306,
    user,
    password,
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
    connectTimeout: 15000,
    acquireTimeout: 15000,
    timeout: 15000,
    // Force IPv4 connection
    socketPath: undefined,
  };

  // ایجاد pool جدید
  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 15000,
    timeout: 15000,
  });

  // ذخیره در cache
  tenantPools.set(tenantKey, pool);

  return pool;
}

/**
 * بستن تمام connection pool ها
 */
export async function closeAllTenantConnections() {
  const entries = Array.from(tenantPools.entries());
  for (const [tenantKey, pool] of entries) {
    await pool.end();
    tenantPools.delete(tenantKey);
  }
}
