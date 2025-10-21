import mysql from 'mysql2/promise';

// Test the exact database configuration from the app
const dbConfig = {
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.DB_USER || process.env.DATABASE_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'crm_system',
  timezone: '+00:00',
  charset: 'utf8mb4',
  connectTimeout: 10000,
};

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function debugDatabase() {
    try {
        console.log('Testing database connection pool...');
        
        // Test 1: Simple connection test
        const connection = await pool.getConnection();
        console.log('✅ Pool connection successful');
        connection.release();

        // Test 2: Test the exact query from the API
        const query = `
            SELECT id, name, email, role, status 
            FROM users 
            WHERE id = ? AND status = 'active'
        `;
        const params = ['ceo-001'];

        console.log('Testing query:', query);
        console.log('With params:', params);

        const result = await pool.execute(query, params);
        console.log('Raw result structure:', typeof result, Array.isArray(result));
        console.log('Result length:', result ? result.length : 'undefined');
        
        if (result) {
            console.log('Result[0] type:', typeof result[0]);
            console.log('Result[0] is array:', Array.isArray(result[0]));
            if (result[0]) {
                console.log('Result[0] length:', result[0].length);
                console.log('Result[0] content:', result[0]);
            }
        }

        // Test 3: Test the tasks query
        const tasksQuery = `
            SELECT 
                t.*,
                c.name as customer_name,
                u1.name as assigned_to_name,
                u2.name as assigned_by_name
            FROM tasks t
            LEFT JOIN customers c ON t.customer_id = c.id
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.assigned_by = u2.id
            WHERE 1=1
            ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
        `;

        console.log('\nTesting tasks query...');
        const tasksResult = await pool.execute(tasksQuery, []);
        console.log('Tasks result structure:', typeof tasksResult, Array.isArray(tasksResult));
        
        if (tasksResult && tasksResult[0]) {
            console.log('Tasks result[0] length:', tasksResult[0].length);
            console.log('First task:', tasksResult[0][0]);
        }

        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugDatabase();