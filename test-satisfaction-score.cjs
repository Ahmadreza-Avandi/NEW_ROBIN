const mysql = require('mysql2/promise');

async function testSatisfactionScore() {
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

    // بررسی نوع داده satisfaction_score
    const [customers] = await connection.query(`
      SELECT id, name, satisfaction_score
      FROM customers 
      WHERE tenant_key = 'rabin'
      ORDER BY created_at DESC
    `);

    console.log('📊 بررسی satisfaction_score:');
    customers.forEach(customer => {
      console.log(`  ${customer.name}:`);
      console.log(`    مقدار: ${customer.satisfaction_score}`);
      console.log(`    نوع: ${typeof customer.satisfaction_score}`);
      console.log(`    parseFloat: ${parseFloat(customer.satisfaction_score || 0)}`);
      console.log(`    toFixed: ${parseFloat(customer.satisfaction_score || 0).toFixed(1)}`);
      console.log('');
    });

    // تست کد JavaScript مشابه React
    console.log('🧪 تست کد React:');
    customers.forEach(customer => {
      try {
        const result = customer.satisfaction_score && parseFloat(customer.satisfaction_score).toFixed(1);
        console.log(`✅ ${customer.name}: ${result || 'ندارد'}`);
      } catch (error) {
        console.log(`❌ ${customer.name}: خطا - ${error.message}`);
      }
    });

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testSatisfactionScore();