import mysql from 'mysql2/promise';

// تنظیمات دیتابیس
const DB_CONFIG = {
    host: process.env.DATABASE_HOST || "mysql", // استفاده از Docker service name
    database: process.env.DATABASE_NAME || "crm_system",
    user: process.env.DATABASE_USER || "crm_user",
    password: process.env.DATABASE_PASSWORD || "1234",
    charset: 'utf8mb4',
    connectTimeout: 10000 // 10 second timeout
};

// ایجاد connection pool
const pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * اجرای کوئری در دیتابیس
 */
export async function executeQuery(query: string, params: any[] = []) {
    let connection;
    const startTime = Date.now();

    try {
        console.log('🔍 Executing query:', query.substring(0, 100) + '...');

        connection = await pool.getConnection();
        const [rows] = await connection.execute(query, params);

        const executionTime = Date.now() - startTime;
        console.log(`✅ Query executed successfully in ${executionTime}ms, ${(rows as any[]).length} rows`);

        return rows as any[];

    } catch (error: any) {
        console.error('❌ Database query error:', error.message);
        throw new Error(`خطا در اجرای کوئری دیتابیس: ${error.message}`);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * تست اتصال به دیتابیس
 */
export async function testConnection(): Promise<boolean> {
    try {
        await executeQuery('SELECT 1 as test');
        console.log('✅ Database connection successful');
        return true;
    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * دریافت اطلاعات کاربران (همکاران)
 */
export async function getEmployees() {
    try {
        const query = `
            SELECT id, name, email, role, department, position, status, phone, team, last_login, created_at
            FROM users 
            WHERE status = 'active'
            ORDER BY name
        `;
        return await executeQuery(query);
    } catch (error: any) {
        console.error('خطا در دریافت اطلاعات کاربران:', error.message);
        return [];
    }
}

/**
 * دریافت اطلاعات مشتریان
 */
export async function getCustomers() {
    try {
        const query = `
            SELECT id, name, email, phone, website, address, city, state, 
                   industry, company_size, status, segment, priority, 
                   assigned_to, created_at, last_interaction
            FROM customers 
            WHERE status IN ('active', 'prospect', 'customer')
            ORDER BY name
            LIMIT 50
        `;
        return await executeQuery(query);
    } catch (error: any) {
        console.error('خطا در دریافت اطلاعات مشتریان:', error.message);
        return [];
    }
}

/**
 * دریافت گزارش فروش
 */
export async function getSalesReport(period: string = 'today') {
    try {
        let dateCondition = '';

        switch (period) {
            case 'today':
                dateCondition = 'DATE(created_at) = CURDATE()';
                break;
            case 'week':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            default:
                dateCondition = 'DATE(created_at) = CURDATE()';
        }

        const query = `
            SELECT 
                COUNT(*) as total_deals,
                SUM(total_value) as total_amount,
                AVG(total_value) as average_amount,
                AVG(probability) as average_probability,
                DATE(created_at) as deal_date
            FROM deals 
            WHERE ${dateCondition}
            GROUP BY DATE(created_at)
            ORDER BY deal_date DESC
        `;

        return await executeQuery(query);
    } catch (error: any) {
        console.error('خطا در دریافت گزارش فروش:', error.message);
        return [];
    }
}

/**
 * دریافت فعالیت‌ها و وظایف
 */
export async function getTasks(assignee: string | null = null) {
    try {
        let query = `
            SELECT a.id, a.title, a.description, a.type, a.start_time, a.end_time,
                   a.performed_by, a.outcome, a.notes, a.created_at,
                   c.name as customer_name
            FROM activities a
            LEFT JOIN customers c ON a.customer_id = c.id
            WHERE a.outcome IN ('completed', 'successful', 'follow_up_needed')
        `;

        const params: any[] = [];

        if (assignee) {
            query += ' AND a.performed_by LIKE ?';
            params.push(`%${assignee}%`);
        }

        query += ' ORDER BY a.created_at DESC LIMIT 20';

        return await executeQuery(query, params);
    } catch (error: any) {
        console.error('خطا در دریافت فعالیت‌ها:', error.message);
        return [];
    }
}

/**
 * دریافت معاملات (deals) به عنوان پروژه‌ها
 */
export async function getProjects() {
    try {
        const query = `
            SELECT d.id, d.title as name, d.description, d.total_value, 
                   d.probability, d.expected_close_date, d.assigned_to,
                   d.created_at, c.name as customer_name
            FROM deals d
            LEFT JOIN customers c ON d.customer_id = c.id
            WHERE d.probability > 0
            ORDER BY d.created_at DESC
            LIMIT 10
        `;
        return await executeQuery(query);
    } catch (error: any) {
        console.error('خطا در دریافت معاملات:', error.message);
        return [];
    }
}