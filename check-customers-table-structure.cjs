const mysql = require('mysql2/promise');

async function checkCustomersTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 بررسی ساختار جدول customers...');
    
    // نمایش ساختار جدول
    const [columns] = await connection.query('DESCRIBE customers');
    console.log('\n📋 ستون‌های جدول customers:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // بررسی وجود فیلد created_by
    const hasCreatedBy = columns.some(col => col.Field === 'created_by');
    console.log(`\n🔍 فیلد created_by: ${hasCreatedBy ? '✅ موجود' : '❌ موجود نیست'}`);

    if (!hasCreatedBy) {
      console.log('\n🔧 اضافه کردن فیلد created_by...');
      await connection.query('ALTER TABLE customers ADD COLUMN created_by VARCHAR(255) NULL AFTER priority');
      console.log('✅ فیلد created_by اضافه شد');
    }

    // نمایش تعداد مشتریان بدون created_by
    const [result] = await connection.query('SELECT COUNT(*) as count FROM customers WHERE created_by IS NULL');
    console.log(`\n📊 تعداد مشتریان بدون created_by: ${result[0].count}`);

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkCustomersTable();