import mysql from 'mysql2/promise';

/**
 * Master Database Configuration
 * این دیتابیس برای مدیریت تنانت‌ها و SaaS استفاده میشه
 * دیتابیس: saas_master
 * جداول: tenants, subscription_plans, subscription_history, super_admins
 */

const masterDbConfig = {
  host: process.env.DATABASE_HOST || process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
  user: process.env.DATABASE_USER || process.env.DB_USER || 'crm_user',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '1234',
  database: process.env.SAAS_DATABASE_NAME || 'saas_master',
  timezone: '+00:00',
  charset: 'utf8mb4',
  connectTimeout: 10000,
};

// Create connection pool for master database
export const masterPool = mysql.createPool({
  ...masterDbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Get master database connection
 */
export async function getMasterConnection() {
  try {
    const connection = await masterPool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Master database connection failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to connect to master database');
  }
}

/**
 * Get tenant by key
 */
export async function getTenantByKey(tenantKey: string) {
  let connection;
  try {
    connection = await getMasterConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM tenants WHERE tenant_key = ? AND is_deleted = false LIMIT 1',
      [tenantKey]
    ) as any[];

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error('❌ Error fetching tenant:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Test master database connection
 */
export async function testMasterConnection() {
  try {
    const connection = await getMasterConnection();
    console.log('✅ Master database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Master database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
