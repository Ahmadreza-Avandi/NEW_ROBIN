const mysql = require('mysql2/promise');
const { createLogger } = require('../utils/logger');

const logger = createLogger('DATABASE');

// تنظیمات دیتابیس
const DB_CONFIG = {
    host: process.env.DATABASE_HOST || "mysql",
    database: process.env.DATABASE_NAME || "crm_system",
    user: process.env.DATABASE_USER || "crm_user",
    password: process.env.DATABASE_PASSWORD || "1234",
    charset: 'utf8mb4'
};

// ایجاد connection pool برای بهتر بودن performance
const pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * اجرای کوئری در دیتابیس
 * @param {string} query - کوئری SQL
 * @param {Array} params - پارامترهای کوئری
 * @returns {Promise<Array>} - نتیجه کوئری
 */
async function executeQuery(query, params = []) {
    let connection;
    const startTime = Date.now();
    
    try {
        logger.dbQuery(query, params);

        connection = await pool.getConnection();
        const [rows] = await connection.execute(query, params);

        const executionTime = Date.now() - startTime;
        logger.dbResult(rows.length, executionTime);
        
        return rows;

    } catch (error) {
        logger.dbError(error, query);
        throw new Error(`خطا در اجرای کوئری دیتابیس: ${error.message}`);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * تست اتصال به دیتابیس
 * @returns {Promise<boolean>} - وضعیت اتصال
 */
async function testConnection() {
    try {
        const result = await executeQuery('SELECT 1 as test');
        logger.info('✅ Database connection successful');
        return true;
    } catch (error) {
        logger.error('❌ Database connection failed', { error: error.message });
        return false;
    }
}

/**
 * دریافت اطلاعات کاربران (همکاران)
 * @returns {Promise<Array>} - لیست کاربران
 */
async function getEmployees() {
    try {
        const query = `
      SELECT id, username, email, full_name, role, status, last_login, created_at
      FROM users 
      WHERE status = 'active'
      ORDER BY full_name
    `;
        return await executeQuery(query);
    } catch (error) {
        logger.error('خطا در دریافت اطلاعات کاربران', { error: error.message });
        return [];
    }
}

/**
 * دریافت اطلاعات مشتریان
 * @returns {Promise<Array>} - لیست مشتریان
 */
async function getCustomers() {
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
    } catch (error) {
        logger.error('خطا در دریافت اطلاعات مشتریان', { error: error.message });
        return [];
    }
}

/**
 * دریافت گزارش فروش (بر اساس جدول deals)
 * @param {string} period - دوره زمانی (today, week, month)
 * @returns {Promise<Array>} - گزارش فروش
 */
async function getSalesReport(period = 'today') {
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
    } catch (error) {
        logger.error('خطا در دریافت گزارش فروش', { error: error.message });
        return [];
    }
}

/**
 * دریافت فعالیت‌ها و وظایف
 * @param {string} assignee - نام مسئول (اختیاری)
 * @returns {Promise<Array>} - لیست فعالیت‌ها
 */
async function getTasks(assignee = null) {
    try {
        let query = `
      SELECT a.id, a.title, a.description, a.type, a.start_time, a.end_time,
             a.performed_by, a.outcome, a.notes, a.created_at,
             c.name as customer_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE a.outcome IN ('completed', 'successful', 'follow_up_needed')
    `;

        const params = [];

        if (assignee) {
            query += ' AND a.performed_by LIKE ?';
            params.push(`%${assignee}%`);
        }

        query += ' ORDER BY a.created_at DESC LIMIT 20';

        return await executeQuery(query, params);
    } catch (error) {
        logger.error('خطا در دریافت فعالیت‌ها', { error: error.message });
        return [];
    }
}

/**
 * دریافت معاملات (deals) به عنوان پروژه‌ها
 * @returns {Promise<Array>} - لیست معاملات
 */
async function getProjects() {
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
    } catch (error) {
        logger.error('خطا در دریافت معاملات', { error: error.message });
        return [];
    }
}

/**
 * دریافت گزارشات روزانه
 * @param {string} userId - شناسه کاربر (اختیاری)
 * @returns {Promise<Array>} - لیست گزارشات روزانه
 */
async function getDailyReports(userId = null) {
    try {
        let query = `
      SELECT dr.id, dr.user_id, dr.report_date, dr.persian_date,
             dr.work_description, dr.working_hours, dr.status,
             dr.created_at, u.full_name as user_name
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.status = 'submitted'
    `;

        const params = [];

        if (userId) {
            query += ' AND dr.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY dr.report_date DESC LIMIT 20';

        return await executeQuery(query, params);
    } catch (error) {
        logger.error('خطا در دریافت گزارشات روزانه', { error: error.message });
        return [];
    }
}

/**
 * دریافت بازخوردها و نظرات
 * @param {string} period - دوره زمانی (today, week, month)
 * @returns {Promise<Array>} - لیست بازخوردها
 */
async function getFeedback(period = 'month') {
    try {
        let dateCondition = '';

        switch (period) {
            case 'today':
                dateCondition = 'DATE(f.created_at) = CURDATE()';
                break;
            case 'week':
                dateCondition = 'f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            default:
                dateCondition = 'f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        }

        const query = `
      SELECT f.id, f.type, f.title, f.comment, f.score, f.sentiment,
             f.status, f.created_at, c.name as customer_name
      FROM feedback f
      LEFT JOIN customers c ON f.customer_id = c.id
      WHERE ${dateCondition}
      ORDER BY f.created_at DESC
      LIMIT 30
    `;

        return await executeQuery(query);
    } catch (error) {
        logger.error('خطا در دریافت بازخوردها', { error: error.message });
        return [];
    }
}

/**
 * دریافت رویدادهای تقویم
 * @param {string} period - دوره زمانی (today, week, month)
 * @returns {Promise<Array>} - لیست رویدادها
 */
async function getCalendarEvents(period = 'week') {
    try {
        let dateCondition = '';

        switch (period) {
            case 'today':
                dateCondition = 'DATE(start_date) = CURDATE()';
                break;
            case 'week':
                dateCondition = 'start_date >= CURDATE() AND start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'start_date >= CURDATE() AND start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';
                break;
            default:
                dateCondition = 'start_date >= CURDATE() AND start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)';
        }

        const query = `
      SELECT id, title, description, start_date, end_date, type, 
             location, status, created_by, created_at
      FROM calendar_events
      WHERE ${dateCondition} AND status = 'confirmed'
      ORDER BY start_date ASC
      LIMIT 20
    `;

        return await executeQuery(query);
    } catch (error) {
        logger.error('خطا در دریافت رویدادهای تقویم', { error: error.message });
        return [];
    }
}

/**
 * دریافت اسناد
 * @param {string} category - دسته‌بندی (اختیاری)
 * @returns {Promise<Array>} - لیست اسناد
 */
async function getDocuments(category = null) {
    try {
        let query = `
      SELECT d.id, d.title, d.description, d.original_filename,
             d.file_size, d.mime_type, d.access_level, d.status,
             d.created_at, d.uploaded_by
      FROM documents d
      WHERE d.status = 'active'
    `;

        const params = [];

        if (category) {
            query += ' AND d.category_id = ?';
            params.push(category);
        }

        query += ' ORDER BY d.created_at DESC LIMIT 20';

        return await executeQuery(query, params);
    } catch (error) {
        logger.error('خطا در دریافت اسناد', { error: error.message });
        return [];
    }
}

module.exports = {
    executeQuery,
    testConnection,
    getEmployees,
    getCustomers,
    getSalesReport,
    getTasks,
    getProjects,
    getDailyReports,
    getFeedback,
    getCalendarEvents,
    getDocuments
};