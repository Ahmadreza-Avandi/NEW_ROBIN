const mysql = require('mysql2/promise');

async function fixCollationIssue() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 بررسی collation جداول...');
    
    // بررسی collation جدول customers
    const [customersInfo] = await connection.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'customers'
    `);
    
    // بررسی collation جدول users
    const [usersInfo] = await connection.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'users'
    `);

    console.log('\n📋 Collation جداول:');
    console.log(`  - customers: ${customersInfo[0]?.TABLE_COLLATION}`);
    console.log(`  - users: ${usersInfo[0]?.TABLE_COLLATION}`);

    // بررسی collation ستون‌های مربوطه
    const [customerColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLLATION_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('created_by', 'tenant_key')
    `);

    const [userColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLLATION_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('id', 'tenant_key')
    `);

    console.log('\n📋 Collation ستون‌ها:');
    console.log('  customers:');
    customerColumns.forEach(col => {
      console.log(`    - ${col.COLUMN_NAME}: ${col.COLLATION_NAME}`);
    });
    console.log('  users:');
    userColumns.forEach(col => {
      console.log(`    - ${col.COLUMN_NAME}: ${col.COLLATION_NAME}`);
    });

    // تغییر collation به utf8mb4_unicode_ci
    console.log('\n🔧 تغییر collation به utf8mb4_unicode_ci...');
    
    // تغییر collation جدول customers
    await connection.query('ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ جدول customers بروزرسانی شد');

    // تغییر collation جدول users
    await connection.query('ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ جدول users بروزرسانی شد');

    console.log('\n✅ مشکل collation حل شد!');

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

fixCollationIssue();