import mysql from 'mysql2/promise';

// تنظیمات دیتابیس - استفاده از تنظیمات محیط
const DB_CONFIG = {
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'crm_system',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    charset: 'utf8mb4',
    connectTimeout: 15000
};

console.log('🔧 Voice Assistant DB Config:', {
    host: DB_CONFIG.host,
    database: DB_CONFIG.database,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password ? '****' : '(empty)',
    charset: DB_CONFIG.charset
});

// ایجاد connection pool
const pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function executeQuery(query: string, params: any[] = []) {
    let connection;
    const startTime = Date.now();

    try {
        console.log('🔍 Voice Assistant Query:', query.substring(0, 100) + '...');
        console.log('📊 Query params:', params);

        connection = await pool.getConnection();
        console.log('✅ Database connection acquired');
        
        const [rows] = await connection.execute(query, params);

        const executionTime = Date.now() - startTime;
        console.log(`✅ Query executed in ${executionTime}ms, ${(rows as any[]).length} rows returned`);

        return rows as any[];

    } catch (error: any) {
        console.error('❌ Database query error:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ SQL State:', error.sqlState);
        console.error('❌ Query was:', query.substring(0, 200));
        console.error('❌ Params were:', params);
        throw new Error(`خطا در اجرای کوئری دیتابیس: ${error.message}`);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

export async function testConnection(): Promise<boolean> {
    try {
        console.log('🔌 Testing Voice Assistant DB connection...');
        await executeQuery('SELECT 1 as test');
        console.log('✅ Voice Assistant DB connection successful');
        return true;
    } catch (error: any) {
        console.error('❌ Voice Assistant DB connection failed:', error.message);
        console.error('❌ Please check your database credentials in .env file');
        console.error('❌ Current config:', {
            host: DB_CONFIG.host,
            database: DB_CONFIG.database,
            user: DB_CONFIG.user
        });
        return false;
    }
}

export async function getEmployees(tenantKey: string = 'rabin') {
    try {
        console.log('👥 getEmployees called for tenant:', tenantKey);
        const query = `
            SELECT id, name, email, role, department, position, status, phone, team, last_login, created_at
            FROM users 
            WHERE status = 'active' AND tenant_key = ?
            ORDER BY name
        `;
        const result = await executeQuery(query, [tenantKey]);
        console.log(`✅ Found ${result.length} employees for tenant ${tenantKey}`);
        return result;
    } catch (error: any) {
        console.error('❌ خطا در دریافت اطلاعات کاربران:', error.message);
        return [];
    }
}

export async function getCustomers(tenantKey: string = 'rabin') {
    try {
        console.log('🏢 getCustomers called for tenant:', tenantKey);
        const query = `
            SELECT id, name, email, phone, website, address, city, state, 
                   industry, company_size, status, segment, priority, 
                   assigned_to, created_at, last_interaction
            FROM customers 
            WHERE status IN ('active', 'prospect', 'customer') AND tenant_key = ?
            ORDER BY name
            LIMIT 50
        `;
        const result = await executeQuery(query, [tenantKey]);
        console.log(`✅ Found ${result.length} customers for tenant ${tenantKey}`);
        if (result.length > 0) {
            console.log('📋 Sample customer names:', result.slice(0, 3).map(c => c.name).join(', '));
        }
        return result;
    } catch (error: any) {
        console.error('❌ خطا در دریافت اطلاعات مشتریان:', error.message);
        return [];
    }
}

export async function getSalesReport(period: string = 'today', tenantKey: string = 'rabin') {
    try {
        console.log('💰 getSalesReport called with:', { period, tenantKey });
        
        let dateCondition = '';

        switch (period) {
            case 'today':
                dateCondition = 'DATE(created_at) = CURDATE()';
                console.log('⏰ Filtering sales for TODAY');
                break;
            case 'yesterday':
                dateCondition = 'DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
                console.log('⏰ Filtering sales for YESTERDAY');
                break;
            case 'week':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                console.log('⏰ Filtering sales for THIS WEEK');
                break;
            case 'month':
                dateCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                console.log('⏰ Filtering sales for THIS MONTH');
                break;
            case 'year':
                dateCondition = 'YEAR(created_at) = YEAR(NOW())';
                console.log('⏰ Filtering sales for THIS YEAR');
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
            WHERE ${dateCondition} AND tenant_key = ?
            GROUP BY DATE(created_at)
            ORDER BY deal_date DESC
        `;

        const result = await executeQuery(query, [tenantKey]);
        console.log(`✅ Found ${result.length} sales records for tenant ${tenantKey} (${period})`);
        return result;
    } catch (error: any) {
        console.error('خطا در دریافت گزارش فروش:', error.message);
        return [];
    }
}

export async function getTasks(assignee: string | null = null, tenantKey: string = 'rabin', timeFilter: string | null = null) {
    try {
        console.log('📋 getTasks called with:', { assignee, tenantKey, timeFilter });
        
        let query = `
            SELECT a.id, a.title, a.description, a.type, a.start_time, a.end_time,
                   a.performed_by, a.outcome, a.notes, a.created_at,
                   c.name as customer_name
            FROM activities a
            LEFT JOIN customers c ON a.customer_id = c.id
            WHERE a.tenant_key = ?
        `;

        const params: any[] = [tenantKey];

        // اضافه کردن فیلتر زمانی
        if (timeFilter) {
            switch (timeFilter) {
                case 'today':
                    query += ' AND DATE(a.created_at) = CURDATE()';
                    console.log('⏰ Filtering activities for TODAY');
                    break;
                case 'yesterday':
                    query += ' AND DATE(a.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
                    console.log('⏰ Filtering activities for YESTERDAY');
                    break;
                case 'week':
                    query += ' AND a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    console.log('⏰ Filtering activities for THIS WEEK');
                    break;
                case 'month':
                    query += ' AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    console.log('⏰ Filtering activities for THIS MONTH');
                    break;
                case 'year':
                    query += ' AND YEAR(a.created_at) = YEAR(NOW())';
                    console.log('⏰ Filtering activities for THIS YEAR');
                    break;
            }
        }

        if (assignee) {
            query += ' AND a.performed_by LIKE ?';
            params.push(`%${assignee}%`);
        }

        query += ' ORDER BY a.created_at DESC LIMIT 50';

        const result = await executeQuery(query, params);
        console.log(`✅ Found ${result.length} activities for tenant ${tenantKey}${timeFilter ? ` (${timeFilter})` : ''}`);
        return result;
    } catch (error: any) {
        console.error('خطا در دریافت فعالیت‌ها:', error.message);
        return [];
    }
}

export async function getProjects(tenantKey: string = 'rabin', timeFilter: string | null = null) {
    try {
        console.log('📁 getProjects called with:', { tenantKey, timeFilter });
        
        let query = `
            SELECT d.id, d.title as name, d.description, d.total_value, 
                   d.probability, d.expected_close_date, d.assigned_to,
                   d.created_at, c.name as customer_name
            FROM deals d
            LEFT JOIN customers c ON d.customer_id = c.id
            WHERE d.probability > 0 AND d.tenant_key = ?
        `;

        const params: any[] = [tenantKey];

        // اضافه کردن فیلتر زمانی
        if (timeFilter) {
            switch (timeFilter) {
                case 'today':
                    query += ' AND DATE(d.created_at) = CURDATE()';
                    console.log('⏰ Filtering projects for TODAY');
                    break;
                case 'yesterday':
                    query += ' AND DATE(d.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
                    console.log('⏰ Filtering projects for YESTERDAY');
                    break;
                case 'week':
                    query += ' AND d.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    console.log('⏰ Filtering projects for THIS WEEK');
                    break;
                case 'month':
                    query += ' AND d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    console.log('⏰ Filtering projects for THIS MONTH');
                    break;
                case 'year':
                    query += ' AND YEAR(d.created_at) = YEAR(NOW())';
                    console.log('⏰ Filtering projects for THIS YEAR');
                    break;
            }
        }

        query += ' ORDER BY d.created_at DESC LIMIT 20';

        const result = await executeQuery(query, params);
        console.log(`✅ Found ${result.length} projects for tenant ${tenantKey}${timeFilter ? ` (${timeFilter})` : ''}`);
        return result;
    } catch (error: any) {
        console.error('خطا در دریافت معاملات:', error.message);
        return [];
    }
}

export async function getProducts(tenantKey: string = 'rabin') {
    try {
        console.log('📦 getProducts called for tenant:', tenantKey);
        const query = `
            SELECT id, name, description, category, price, currency, 
                   status, sku, tags, specifications, created_at
            FROM products 
            WHERE status = 'active' AND tenant_key = ?
            ORDER BY name
            LIMIT 50
        `;
        const result = await executeQuery(query, [tenantKey]);
        console.log(`✅ Found ${result.length} products for tenant ${tenantKey}`);
        if (result.length > 0) {
            console.log('📋 Sample product names:', result.slice(0, 3).map(p => p.name).join(', '));
        }
        return result;
    } catch (error: any) {
        console.error('❌ خطا در دریافت اطلاعات محصولات:', error.message);
        return [];
    }
}
