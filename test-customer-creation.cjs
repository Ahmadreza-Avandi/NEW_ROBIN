const mysql = require('mysql2/promise');

async function testCustomerCreation() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 تست ایجاد مشتری جدید...');
    
    // نمایش مشتریان موجود با اطلاعات created_by
    const [customers] = await connection.query(`
      SELECT c.id, c.name, c.created_by, u.name as created_by_name, c.created_at
      FROM customers c 
      LEFT JOIN users u ON c.created_by = u.id 
      ORDER BY c.created_at DESC
    `);

    console.log('\n📋 مشتریان موجود:');
    customers.forEach(customer => {
      console.log(`  - ${customer.name} | اضافه شده توسط: ${customer.created_by_name || 'نامشخص'} | تاریخ: ${customer.created_at}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testCustomerCreation();