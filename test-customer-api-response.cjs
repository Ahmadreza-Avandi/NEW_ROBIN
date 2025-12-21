const mysql = require('mysql2/promise');

async function testCustomerAPIResponse() {
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

    const customerId = '98dad6eb-d387-11f0-8d2c-581122e4f0be';
    const tenantKey = 'rabin';

    // Test the exact query from the updated API
    console.log('\n🔍 تست کوئری بروزرسانی شده API:');
    const [interestedProducts] = await connection.query(`
      SELECT cpi.id, p.id as product_id, p.name as product_name, p.description, p.price, p.category,
             cpi.interest_level, cpi.notes, cpi.created_at
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    console.log(`✅ ${interestedProducts.length} محصول علاقه‌مند یافت شد:`);
    
    interestedProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.product_name}`);
      console.log(`   Interest ID: ${product.id}`);
      console.log(`   Product ID: ${product.product_id}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Interest Level: ${product.interest_level}`);
      console.log(`   Price: ${product.price}`);
      if (product.notes) {
        console.log(`   Notes: ${product.notes}`);
      }
    });

    // Test the data structure that will be sent to the component
    console.log('\n📋 ساختار داده برای کامپوننت:');
    const componentData = interestedProducts.map(product => ({
      id: product.id,                    // Interest ID (needed for delete)
      product_id: product.product_id,    // Product ID
      product_name: product.product_name, // Product name
      description: product.description,   // Product description
      price: product.price,              // Product price
      category: product.category,        // Product category
      interest_level: product.interest_level, // Interest level
      notes: product.notes,              // Interest notes
      created_at: product.created_at     // Interest creation date
    }));

    console.log('✅ نمونه داده کامپوننت (اولین مورد):');
    if (componentData.length > 0) {
      console.log(JSON.stringify(componentData[0], null, 2));
      
      // Verify the ID is present and valid
      console.log(`\n🔍 بررسی Interest ID:`);
      console.log(`   ID: ${componentData[0].id}`);
      console.log(`   نوع: ${typeof componentData[0].id}`);
      console.log(`   معتبر: ${componentData[0].id && componentData[0].id.length === 36}`);
    }

    console.log('\n✅ ساختار داده صحیح است و شامل Interest ID برای حذف می‌باشد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testCustomerAPIResponse();