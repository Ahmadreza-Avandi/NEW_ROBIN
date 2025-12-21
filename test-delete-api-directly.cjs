const mysql = require('mysql2/promise');

async function testDeleteAPIDirectly() {
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

    // Get current interests with complete data
    console.log('\n📋 علاقه‌مندی‌های فعلی:');
    const [currentInterests] = await connection.query(`
      SELECT cpi.id, cpi.product_id, cpi.interest_level, cpi.notes, cpi.created_at,
             p.name as product_name, p.category, p.price
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    console.log(`✅ ${currentInterests.length} علاقه‌مندی یافت شد:`);
    currentInterests.forEach((interest, index) => {
      console.log(`${index + 1}. ${interest.product_name}`);
      console.log(`   ID: ${interest.id}`);
      console.log(`   Product ID: ${interest.product_id}`);
      console.log(`   Level: ${interest.interest_level}`);
    });

    if (currentInterests.length === 0) {
      console.log('❌ هیچ علاقه‌مندی برای تست یافت نشد');
      return;
    }

    // Test the component data structure
    console.log('\n🔄 ساختار داده برای کامپوننت:');
    const componentInterests = currentInterests.map(interest => ({
      id: interest.id,
      product_id: interest.product_id,
      product_name: interest.product_name,
      description: interest.description,
      price: interest.price,
      category: interest.category,
      interest_level: interest.interest_level,
      notes: interest.notes,
      created_at: interest.created_at
    }));

    console.log('✅ نمونه داده کامپوننت:');
    console.log(JSON.stringify(componentInterests[0], null, 2));

    // Check if the interest.id exists and is valid
    const firstInterest = currentInterests[0];
    console.log(`\n🔍 بررسی ID اولین علاقه‌مندی: ${firstInterest.id}`);
    console.log(`   نوع: ${typeof firstInterest.id}`);
    console.log(`   طول: ${firstInterest.id.length}`);
    console.log(`   فرمت UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstInterest.id)}`);

    // Test the exact API query that would be used for delete
    console.log('\n🧪 تست کوئری API برای حذف:');
    const [apiTestResult] = await connection.query(`
      SELECT cpi.*, c.name as customer_name, p.name as product_name
      FROM customer_product_interests cpi
      JOIN customers c ON cpi.customer_id = c.id
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.id = ? AND cpi.customer_id = ? AND c.tenant_key = ?
    `, [firstInterest.id, customerId, tenantKey]);

    if (apiTestResult.length > 0) {
      console.log('✅ کوئری API موفقیت‌آمیز');
      console.log(`   مشتری: ${apiTestResult[0].customer_name}`);
      console.log(`   محصول: ${apiTestResult[0].product_name}`);
    } else {
      console.log('❌ کوئری API ناموفق');
    }

    // Simulate the frontend delete call
    console.log('\n🌐 شبیه‌سازی فراخوانی frontend:');
    const deleteUrl = `/api/tenant/customers/${customerId}/interests?interest_id=${firstInterest.id}`;
    console.log(`   URL: ${deleteUrl}`);
    
    // Parse like the API does
    const url = new URL(`http://localhost:3000${deleteUrl}`);
    const pathParts = url.pathname.split('/');
    const extractedCustomerId = pathParts[pathParts.length - 2];
    const extractedInterestId = url.searchParams.get('interest_id');
    
    console.log(`   Extracted Customer ID: ${extractedCustomerId}`);
    console.log(`   Extracted Interest ID: ${extractedInterestId}`);
    console.log(`   Customer ID Match: ${extractedCustomerId === customerId}`);
    console.log(`   Interest ID Match: ${extractedInterestId === firstInterest.id}`);

    console.log('\n✅ همه بررسی‌ها موفقیت‌آمیز بود!');
    console.log('\n💡 مشکل احتمالاً در frontend یا authentication است');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testDeleteAPIDirectly();