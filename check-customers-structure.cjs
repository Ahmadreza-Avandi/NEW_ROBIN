const mysql = require('mysql2/promise');

async function checkCustomersStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // Check customers table structure
    const [structure] = await connection.query('DESCRIBE customers');
    console.log('📋 ساختار جدول customers:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'}`);
    });

    // Check sample data
    const [customers] = await connection.query(`
      SELECT * FROM customers WHERE tenant_key = 'rabin' LIMIT 3
    `);

    console.log(`\n📊 نمونه مشتریان (${customers.length} مورد):`);
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name}`);
      console.log(`   ID: ${customer.id}`);
      if (customer.business_name) console.log(`   نام تجاری: ${customer.business_name}`);
      if (customer.company_name) console.log(`   نام شرکت: ${customer.company_name}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

checkCustomersStructure();