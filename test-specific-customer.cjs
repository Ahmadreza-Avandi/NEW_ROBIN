const mysql = require('mysql2/promise');

async function testSpecificCustomer() {
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

    const targetCustomerId = '98dad6eb-d387-11f0-8d2c-581122e4f0be';
    console.log(`🔍 جستجوی مشتری با ID: ${targetCustomerId}`);

    // Check if this specific customer exists
    const [customers] = await connection.query(`
      SELECT id, name, status, tenant_key FROM customers 
      WHERE id = ? AND tenant_key = 'rabin'
    `, [targetCustomerId]);

    if (customers.length === 0) {
      console.log('❌ مشتری با این ID یافت نشد');
      
      // Show available customers
      console.log('\n📋 مشتریان موجود:');
      const [allCustomers] = await connection.query(`
        SELECT id, name, status FROM customers 
        WHERE tenant_key = 'rabin'
        ORDER BY created_at DESC
      `);
      
      allCustomers.forEach(customer => {
        console.log(`  - ${customer.name} (${customer.id}) - ${customer.status}`);
      });
      
      return;
    }

    const customer = customers[0];
    console.log(`✅ مشتری یافت شد: ${customer.name} (${customer.status})`);

    // Check current interests for this customer
    console.log('\n💝 محصولات علاقه‌مند فعلی:');
    const [interests] = await connection.query(`
      SELECT cpi.id, cpi.interest_level, cpi.notes, cpi.created_at,
             p.name as product_name, p.category, p.price
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [targetCustomerId, 'rabin']);

    console.log(`✅ ${interests.length} محصول علاقه‌مند یافت شد:`);
    interests.forEach(interest => {
      console.log(`  - ${interest.product_name} (${interest.interest_level})`);
      if (interest.notes) {
        console.log(`    یادداشت: ${interest.notes}`);
      }
    });

    // Check available products that can be added
    console.log('\n📦 محصولات قابل اضافه کردن:');
    const [availableProducts] = await connection.query(`
      SELECT p.id, p.name, p.category, p.price
      FROM products p
      WHERE p.tenant_key = ? 
      AND p.status = 'active'
      AND p.id NOT IN (
        SELECT product_id FROM customer_product_interests 
        WHERE customer_id = ?
      )
      ORDER BY p.name ASC
    `, ['rabin', targetCustomerId]);

    console.log(`✅ ${availableProducts.length} محصول قابل اضافه کردن:`);
    availableProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category || 'بدون دسته'})`);
    });

    // Test data structure for the component
    console.log('\n🔄 ساختار داده برای کامپوننت:');
    const componentData = {
      customerId: targetCustomerId,
      interests: interests.map(interest => ({
        id: interest.id,
        product_id: interest.product_id,
        product_name: interest.product_name,
        description: interest.description,
        price: interest.price,
        category: interest.category,
        interest_level: interest.interest_level,
        notes: interest.notes,
        created_at: interest.created_at
      })),
      availableProducts: availableProducts
    };

    console.log('✅ ساختار داده آماده:');
    console.log(`   - Customer ID: ${componentData.customerId}`);
    console.log(`   - Current interests: ${componentData.interests.length} مورد`);
    console.log(`   - Available products: ${componentData.availableProducts.length} مورد`);

    console.log('\n🎉 مشتری و داده‌ها آماده برای تست وب اپ!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testSpecificCustomer();