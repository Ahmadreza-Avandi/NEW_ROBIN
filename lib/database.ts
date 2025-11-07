import mysql from 'mysql2/promise';

// Smart environment detection
function detectEnvironment() {
  // Check if we're in Docker container (more specific checks)
  const isDocker = process.env.DOCKER_CONTAINER === 'true' || 
                   process.env.HOSTNAME?.includes('docker') ||
                   process.env.HOSTNAME?.includes('nextjs') ||
                   process.env.HOSTNAME?.includes('crm');
  
  // Check if we're on server (has domain or specific indicators)
  const isServer = process.env.NEXTAUTH_URL?.includes('crm.robintejarat.com') ||
                   process.env.DOMAIN?.includes('crm.robintejarat.com') ||
                   (process.env.VPS_MODE === 'true' && process.env.NODE_ENV === 'production');
  
  // Force local if DATABASE_HOST is explicitly localhost or we're in development
  const forceLocal = process.env.DATABASE_HOST === 'localhost' ||
                     process.env.DB_HOST === 'localhost' ||
                     (process.env.NODE_ENV === 'development' && !isDocker);
  
  return {
    isDocker: isDocker && !forceLocal,
    isServer: isServer && !forceLocal,
    isLocal: !isDocker && !isServer || forceLocal
  };
}

// Helper function to get database config with smart detection
function getDbConfig() {
  const env = detectEnvironment();
  
  // Smart host detection
  let host = process.env.DATABASE_HOST || process.env.DB_HOST;
  
  // Override host based on environment detection
  if (env.isLocal && (host === 'mysql' || host === 'auto' || !host)) {
    // Local development - try localhost first, then 127.0.0.1
    host = 'localhost';
  } else if ((env.isDocker || env.isServer) && (host === 'localhost' || host === 'auto' || !host)) {
    // Docker/Server environment - use mysql service name
    host = 'mysql';
  }
  
  // Smart user detection
  let user = process.env.DATABASE_USER || process.env.DB_USER;
  if (env.isLocal && !user) {
    user = 'root'; // Default for local MySQL
  } else if ((env.isDocker || env.isServer) && !user) {
    user = 'crm_user'; // Default for Docker/Server
  }
  
  // Smart password detection
  let password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
  if (env.isLocal && !password) {
    password = ''; // Default for local MySQL (usually no password for root)
  } else if ((env.isDocker || env.isServer) && !password) {
    password = '1234'; // Default for Docker/Server
  }
  
  const config = {
    host,
    port: 3306,
    user,
    password,
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
    connectTimeout: 15000, // Increased timeout
    socketPath: undefined, // Force TCP/IP connection
  };
  
  // Log configuration for debugging (without password)
  console.log(`🔧 Database Config (${env.isLocal ? 'Local' : env.isDocker ? 'Docker' : 'Server'}):`, {
    ...config,
    password: config.password ? '*'.repeat(config.password.length) : 'empty'
  });
  
  return config;
}

// Secure Database connection configuration
const dbConfig = getDbConfig();

// Helper function to get clean config without invalid options
function getCleanDbConfig() {
  const config = getDbConfig();
  return {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    timezone: config.timezone,
    charset: config.charset,
    connectTimeout: config.connectTimeout,
    socketPath: config.socketPath,
  };
}

// Create connection pool for better performance
export const pool = mysql.createPool({
  ...getCleanDbConfig(),
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
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
          socketPath: undefined,
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
    connection = await mysql.createConnection(getCleanDbConfig());

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
        if (!result || !Array.isArray(result)) {
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
    connection = await mysql.createConnection(getCleanDbConfig());

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
