const mysql = require('mysql2/promise');

async function fixCollationIssue() {
  let connection;
  
  try {
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // بررسی collation جداول
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME IN ('customers', 'customer_product_interests', 'products', 'users')
    `);

    console.log('📋 Collation جداول:');
    tables.forEach(table => {
      console.log(`  ${table.TABLE_NAME}: ${table.TABLE_COLLATION}`);
    });

    // بررسی collation ستون‌های مهم
    const [columns] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME IN ('customers', 'customer_product_interests', 'products', 'users')
      AND COLUMN_NAME IN ('id', 'customer_id', 'product_id', 'tenant_key', 'created_by')
      AND COLLATION_NAME IS NOT NULL
    `);

    console.log('\n📋 Collation ستون‌ها:');
    columns.forEach(col => {
      console.log(`  ${col.TABLE_NAME}.${col.COLUMN_NAME}: ${col.COLLATION_NAME}`);
    });

    // تغییر collation جداول به utf8mb4_unicode_ci
    const tablesToFix = ['customers', 'customer_product_interests', 'products', 'users'];
    
    for (const tableName of tablesToFix) {
      try {
        await connection.query(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ جدول ${tableName} به utf8mb4_unicode_ci تبدیل شد`);
      } catch (error) {
        console.log(`⚠️ خطا در تبدیل جدول ${tableName}:`, error.message);
      }
    }

    console.log('\n🔄 تست کوئری‌های مشکل‌دار...');

    // تست کوئری آمار
    try {
      const [statsResult] = await connection.query(`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
          COUNT(CASE WHEN status = 'follow_up' THEN 1 END) as follow_up_customers,
          COUNT(CASE WHEN segment = 'enterprise' THEN 1 END) as enterprise_customers,
          AVG(COALESCE(satisfaction_score, 0)) as avg_satisfaction,
          SUM(COALESCE(potential_value, 0)) as total_potential_value
        FROM customers 
        WHERE tenant_key = 'rabin'
      `);
      console.log('✅ کوئری آمار اصلی کار می‌کند');
    } catch (error) {
      console.log('❌ کوئری آمار اصلی:', error.message);
    }

    // تست کوئری محصولات علاقه‌مند (ساده‌تر)
    try {
      const [interestResult] = await connection.query(`
        SELECT COUNT(*) as customers_with_interests
        FROM customer_product_interests cpi
        WHERE EXISTS (
          SELECT 1 FROM customers c 
          WHERE c.id = cpi.customer_id AND c.tenant_key = 'rabin'
        )
      `);
      console.log('✅ کوئری محصولات علاقه‌مند (ساده) کار می‌کند');
    } catch (error) {
      console.log('❌ کوئری محصولات علاقه‌مند (ساده):', error.message);
    }

    // تست کوئری مشتریان با JOIN
    try {
      const [customersResult] = await connection.query(`
        SELECT c.*, u.name as assigned_user_name
        FROM customers c 
        LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
        WHERE c.tenant_key = 'rabin'
        LIMIT 5
      `);
      console.log('✅ کوئری مشتریان با JOIN کار می‌کند');
    } catch (error) {
      console.log('❌ کوئری مشتریان با JOIN:', error.message);
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

fixCollationIssue();