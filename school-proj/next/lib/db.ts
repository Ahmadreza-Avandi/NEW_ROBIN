// 🗄️ مدیریت اتصال به دیتابیس MySQL
import mysql from 'mysql2/promise';
import { DATABASE_URL } from './config';

/**
 * پارس کردن DATABASE_URL و ساخت configuration object
 */
function parseDatabaseUrl(url: string) {
  try {
    // فرمت: mysql://username:password@host:port/database?params
    const urlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = url.match(urlPattern);
    
    if (!match) {
      throw new Error('فرمت DATABASE_URL نامعتبر است');
    }

    const [, user, password, host, port, database] = match;

    return {
      host,
      port: parseInt(port, 10),
      user,
      password,
      database,
      // تنظیمات اضافی برای بهبود عملکرد
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // حذف connect_timeout و استفاده از connectTimeout
      connectTimeout: 10000, // 10 ثانیه
    };
  } catch (error) {
    console.error('خطا در پارس DATABASE_URL:', error);
    throw error;
  }
}

// ساخت configuration
const dbConfig = parseDatabaseUrl(DATABASE_URL);

/**
 * ایجاد یک connection جدید
 */
export async function createDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('خطا در اتصال به دیتابیس:', error);
    throw error;
  }
}

/**
 * ایجاد connection pool (بهتر برای استفاده در production)
 */
let pool: mysql.Pool | null = null;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * اجرای یک query با استفاده از pool
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  const pool = getDbPool();
  const [rows] = await pool.execute(query, params);
  return rows as T;
}

/**
 * اجرای transaction
 */
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default {
  createConnection: createDbConnection,
  getPool: getDbPool,
  executeQuery,
  executeTransaction,
};
