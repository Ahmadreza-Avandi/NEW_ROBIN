/**
 * Connect to Database
 * Simple database connection test
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  user: 'crm_user',
  password: '1234',
  database: 'crm_system'
};

async function connectToDatabase() {
  let connection;

  try {
    console.log('🔄 اتصال به دیتابیس...');
    console.log('📊 تنظیمات:', {
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      database: DB_CONFIG.database
    });
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ اتصال به دیتابیس برقرار شد');

    // Test basic query
    const [result] = await connection.query('SELECT NOW() as `current_time`');
    console.log('🕐 زمان فعلی سرور:', result[0].current_time);

    // Check database tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 تعداد جداول: ${tables.length}`);
    
    // Check if alerts table exists
    const alertsTable = tables.find(table => 
      Object.values(table)[0] === 'alerts'
    );
    
    if (alertsTable) {
      console.log('✅ جدول alerts موجود است');
      
      // Check alerts table structure
      const [alertsStructure] = await connection.query('DESCRIBE alerts');
      console.log('📊 ساختار جدول alerts:');
      alertsStructure.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''}`);
      });
    } else {
      console.log('❌ جدول alerts موجود نیست');
      console.log('🔧 ایجاد جدول alerts...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS alerts (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          tenant_key VARCHAR(50) NOT NULL DEFAULT 'rabin',
          type ENUM('warning', 'info', 'urgent', 'success') NOT NULL DEFAULT 'warning',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          lead_id VARCHAR(36) NULL,
          lead_name VARCHAR(255) NULL,
          priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
          is_read BOOLEAN DEFAULT FALSE,
          days_overdue INT NULL,
          created_by VARCHAR(36) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP NULL,
          dismissed_at TIMESTAMP NULL,
          
          INDEX idx_tenant_key (tenant_key),
          INDEX idx_lead_id (lead_id),
          INDEX idx_priority (priority),
          INDEX idx_is_read (is_read),
          INDEX idx_created_at (created_at)
        )
      `);
      
      console.log('✅ جدول alerts ایجاد شد');
    }

    // Check customers table
    const [customers] = await connection.query('SELECT COUNT(*) as count FROM customers');
    console.log(`👥 تعداد مشتریان: ${customers[0].count}`);

    // Check leads
    const [leads] = await connection.query('SELECT COUNT(*) as count FROM customers WHERE type = "lead"');
    console.log(`🎯 تعداد سرنخ‌ها: ${leads[0].count}`);

    // Check tasks
    const [tasks] = await connection.query('SELECT COUNT(*) as count FROM tasks');
    console.log(`📋 تعداد وظایف: ${tasks[0].count}`);

    // Check activities
    const [activities] = await connection.query('SELECT COUNT(*) as count FROM activities');
    console.log(`📝 تعداد فعالیت‌ها: ${activities[0].count}`);

    console.log('\n🎉 اتصال به دیتابیس موفقیت‌آمیز بود!');

  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error.message);
    console.error('🔍 جزئیات خطا:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 راهنمایی: نام کاربری یا رمز عبور اشتباه است');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 راهنمایی: سرور MySQL در حال اجرا نیست یا پورت اشتباه است');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 راهنمایی: دیتابیس مورد نظر وجود ندارد');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال به دیتابیس بسته شد');
    }
  }
}

// اجرای اتصال
connectToDatabase();