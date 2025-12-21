const mysql = require('mysql2/promise');

async function testCustomerStats() {
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

    // بررسی جداول موجود
    const [tables] = await connection.query("SHOW TABLES");
    console.log('📋 جداول موجود:', tables.map(t => Object.values(t)[0]));

    // بررسی ساختار جدول customers
    const [customersStructure] = await connection.query("DESCRIBE customers");
    console.log('\n🏗️ ساختار جدول customers:');
    customersStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });

    // شمارش مشتریان
    const [customerCount] = await connection.query(`
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

    console.log('\n📊 آمار مشتریان:');
    console.log('  کل مشتریان:', customerCount[0].total_customers);
    console.log('  فعال:', customerCount[0].active_customers);
    console.log('  غیرفعال:', customerCount[0].inactive_customers);
    console.log('  نیاز به پیگیری:', customerCount[0].follow_up_customers);
    console.log('  سازمانی:', customerCount[0].enterprise_customers);
    console.log('  میانگین رضایت:', customerCount[0].avg_satisfaction);
    console.log('  ارزش کل:', customerCount[0].total_potential_value);

    // نمونه مشتریان
    const [sampleCustomers] = await connection.query(`
      SELECT id, name, status, segment, priority, created_at
      FROM customers 
      WHERE tenant_key = 'rabin'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n👥 نمونه مشتریان:');
    sampleCustomers.forEach(customer => {
      console.log(`  - ${customer.name} (${customer.status}) - ${customer.segment} - ${customer.priority}`);
    });

    // بررسی جدول products
    const [productCount] = await connection.query(`
      SELECT COUNT(*) as total_products
      FROM products 
      WHERE tenant_key = 'rabin'
    `);
    console.log('\n📦 تعداد محصولات:', productCount[0].total_products);

    // بررسی جدول customer_product_interests
    const [interestCount] = await connection.query(`
      SELECT COUNT(*) as total_interests
      FROM customer_product_interests cpi
      JOIN customers c ON cpi.customer_id = c.id
      WHERE c.tenant_key = 'rabin'
    `);
    console.log('💝 تعداد علاقه‌مندی‌ها:', interestCount[0].total_interests);

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testCustomerStats();