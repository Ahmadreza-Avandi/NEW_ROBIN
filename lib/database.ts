import mysql from 'mysql2/promise';

// Secure Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || process.env.DATABASE_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
  user: process.env.DB_USER || process.env.DATABASE_USER || 'crm_user',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '1234',
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'crm_system',
  timezone: '+00:00',
  charset: 'utf8mb4',
  connectTimeout: 10000,
};

// Create connection pool for better performance
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to crm_system');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error');

    // Try to create database if it doesn't exist
    if ((error as any)?.code === 'ER_BAD_DB_ERROR') {
      try {
        const tempConnection = await mysql.createConnection({
          host: dbConfig.host,
          user: dbConfig.user,
          password: dbConfig.password,
        });

        await tempConnection.execute('CREATE DATABASE IF NOT EXISTS crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await tempConnection.end();
        console.log('✅ Database crm_system created successfully');
        return true;
      } catch (createError) {
        console.error('❌ Failed to create database:', createError instanceof Error ? createError.message : 'Unknown error');
      }
    }

    return false;
  }
}

// Execute query with error handling
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  let connection;
  try {
    // Convert parameters to proper types for MySQL
    const processedParams = params.map(param => {
      if (param === undefined) return null;
      return param;
    });

    // Use individual connection instead of pool for better error handling
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.DATABASE_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
      user: process.env.DB_USER || process.env.DATABASE_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
      database: process.env.DB_NAME || process.env.DATABASE_NAME || 'crm_system',
      timezone: '+00:00',
      charset: 'utf8mb4',
    });

    // For Docker environment, use query instead of execute for LIMIT/OFFSET
    if (query.includes('LIMIT ? OFFSET ?') && processedParams.length >= 2) {
      const limitIndex = query.indexOf('LIMIT ?');
      const modifiedQuery = query.substring(0, limitIndex) +
        `LIMIT ${processedParams[processedParams.length - 2]} OFFSET ${processedParams[processedParams.length - 1]}`;

      // Remove the last two parameters (limit and offset)
      const modifiedParams = processedParams.slice(0, -2);

      // Use query instead of execute for LIMIT/OFFSET queries
      if (modifiedParams.length > 0) {
        const [rows] = await connection.execute(modifiedQuery, modifiedParams);
        return Array.isArray(rows) ? rows as T[] : [];
      } else {
        const [rows] = await connection.query(modifiedQuery);
        return Array.isArray(rows) ? rows as T[] : [];
      }
    } else {
      // Try using query instead of execute for complex queries
      if (query.includes('LEFT JOIN') && processedParams.length === 0) {
        const [rows] = await connection.query(query);
        return Array.isArray(rows) ? rows as T[] : [];
      } else {
        const result = await connection.execute(query, processedParams);
        if (!result || !Array.isArray(result) || result.length === 0) {
          return [];
        }
        const [rows] = result;
        return Array.isArray(rows) ? rows as T[] : [];
      }
    }
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query was:', query);
    console.error('Params were:', params);
    throw new Error('Database operation failed');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute single query (for inserts, updates, deletes)
export async function executeSingle(
  query: string,
  params: any[] = []
): Promise<any> {
  let connection;
  try {
    // Convert parameters to proper types for MySQL
    const processedParams = params.map(param => {
      if (param === undefined) return null;
      return param;
    });

    // Use individual connection instead of pool for better error handling
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.DATABASE_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
      user: process.env.DB_USER || process.env.DATABASE_USER || 'root',
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
      database: process.env.DB_NAME || process.env.DATABASE_NAME || 'crm_system',
      timezone: '+00:00',
      charset: 'utf8mb4',
    });

    // For Docker environment, use query instead of execute for LIMIT/OFFSET
    if (query.includes('LIMIT ? OFFSET ?') && processedParams.length >= 2) {
      const limitIndex = query.indexOf('LIMIT ?');
      const modifiedQuery = query.substring(0, limitIndex) +
        `LIMIT ${processedParams[processedParams.length - 2]} OFFSET ${processedParams[processedParams.length - 1]}`;

      // Remove the last two parameters (limit and offset)
      const modifiedParams = processedParams.slice(0, -2);

      // Use query instead of execute for LIMIT/OFFSET queries
      if (modifiedParams.length > 0) {
        const [result] = await connection.execute(modifiedQuery, modifiedParams);
        return result;
      } else {
        const [result] = await connection.query(modifiedQuery);
        return result;
      }
    } else {
      const [result] = await connection.execute(query, processedParams);
      return result;
    }
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query was:', query);
    console.error('Params were:', params);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new Error(`Database operation failed: ${errorMessage}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}