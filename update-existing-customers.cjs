const mysql = require('mysql2/promise');

async function updateExistingCustomers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 بروزرسانی مشتریان موجود...');
    
    // ابتدا یک کاربر admin پیدا کنیم
    const [adminUsers] = await connection.query(
      "SELECT id, name FROM users WHERE role = 'admin' OR role = 'ceo' LIMIT 1"
    );

    let defaultUserId = null;
    let defaultUserName = 'سیستم';

    if (adminUsers.length > 0) {
      defaultUserId = adminUsers[0].id;
      defaultUserName = adminUsers[0].name;
      console.log(`✅ کاربر پیش‌فرض پیدا شد: ${defaultUserName} (${defaultUserId})`);
    } else {
      console.log('⚠️ کاربر admin پیدا نشد، از مقدار پیش‌فرض استفاده می‌شود');
    }

    // بروزرسانی مشتریان بدون created_by
    const [result] = await connection.query(
      'UPDATE customers SET created_by = ? WHERE created_by IS NULL',
      [defaultUserId]
    );

    console.log(`✅ ${result.affectedRows} مشتری بروزرسانی شد`);

    // نمایش وضعیت نهایی
    const [finalCount] = await connection.query(
      'SELECT COUNT(*) as total, COUNT(created_by) as with_created_by FROM customers'
    );
    
    console.log(`\n📊 وضعیت نهایی:`);
    console.log(`  - کل مشتریان: ${finalCount[0].total}`);
    console.log(`  - مشتریان با created_by: ${finalCount[0].with_created_by}`);

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

updateExistingCustomers();