const mysql = require('mysql2/promise');

async function checkInterestsTable() {
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

    // بررسی ساختار جدول customer_product_interests
    const [structure] = await connection.query("DESCRIBE customer_product_interests");
    console.log('🏗️ ساختار جدول customer_product_interests:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'} ${col.Key} ${col.Default ? `default: ${col.Default}` : ''} ${col.Extra}`);
    });

    // بررسی رکوردهای موجود
    const [existing] = await connection.query(`
      SELECT cpi.*, c.name as customer_name, p.name as product_name
      FROM customer_product_interests cpi
      LEFT JOIN customers c ON cpi.customer_id = c.id
      LEFT JOIN products p ON cpi.product_id = p.id
      WHERE c.tenant_key = 'rabin' OR c.tenant_key IS NULL
    `);
    console.log('\n💝 علاقه‌مندی‌های موجود:', existing.length);
    existing.forEach(interest => {
      console.log(`  - ID: ${interest.id}, Customer: ${interest.customer_name}, Product: ${interest.product_name}`);
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

checkInterestsTable();