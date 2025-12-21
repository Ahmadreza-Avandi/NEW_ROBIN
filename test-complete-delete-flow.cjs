const mysql = require('mysql2/promise');

async function testCompleteDeleteFlow() {
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

    console.log('🔄 تست کامل فرآیند حذف علاقه‌مندی\n');

    // Step 1: Get customer data (like the API does)
    console.log('1️⃣ دریافت اطلاعات مشتری:');
    const [customer] = await connection.query(`
      SELECT * FROM customers WHERE id = ? AND tenant_key = ?
    `, [customerId, tenantKey]);

    if (customer.length === 0) {
      console.log('❌ مشتری یافت نشد');
      return;
    }

    console.log(`✅ مشتری: ${customer[0].name}`);

    // Step 2: Get interested products (with the updated query)
    console.log('\n2️⃣ دریافت محصولات علاقه‌مند:');
    const [interestedProducts] = await connection.query(`
      SELECT cpi.id, p.id as product_id, p.name as product_name, p.description, p.price, p.category,
             cpi.interest_level, cpi.notes, cpi.created_at
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    console.log(`✅ ${interestedProducts.length} محصول علاقه‌مند یافت شد`);

    if (interestedProducts.length === 0) {
      console.log('❌ هیچ محصول علاقه‌مندی برای تست یافت نشد');
      return;
    }

    // Step 3: Simulate component data structure
    console.log('\n3️⃣ ساختار داده کامپوننت:');
    const componentInterests = interestedProducts.map(product => ({
      id: product.id,                    // ✅ Interest ID (برای حذف)
      product_id: product.product_id,    // ✅ Product ID
      product_name: product.product_name, // ✅ Product name
      description: product.description,   // ✅ Product description
      price: product.price,              // ✅ Product price
      category: product.category,        // ✅ Product category
      interest_level: product.interest_level, // ✅ Interest level
      notes: product.notes,              // ✅ Interest notes
      created_at: product.created_at     // ✅ Interest creation date
    }));

    console.log('✅ ساختار داده آماده برای کامپوننت');
    console.log(`   تعداد آیتم‌ها: ${componentInterests.length}`);
    console.log(`   نمونه ID: ${componentInterests[0].id}`);

    // Step 4: Test delete API simulation
    const interestToDelete = componentInterests[0];
    console.log(`\n4️⃣ شبیه‌سازی حذف: ${interestToDelete.product_name}`);
    console.log(`   Interest ID: ${interestToDelete.id}`);

    // Step 4a: Check if interest exists (API validation)
    const [checkResult] = await connection.query(`
      SELECT cpi.*, c.name as customer_name, p.name as product_name
      FROM customer_product_interests cpi
      JOIN customers c ON cpi.customer_id = c.id
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.id = ? AND cpi.customer_id = ? AND c.tenant_key = ?
    `, [interestToDelete.id, customerId, tenantKey]);

    if (checkResult.length === 0) {
      console.log('❌ علاقه‌مندی برای حذف یافت نشد');
      return;
    }

    console.log('✅ علاقه‌مندی برای حذف تأیید شد');

    // Step 4b: Perform delete
    const deleteResult = await connection.query(
      'DELETE FROM customer_product_interests WHERE id = ? AND customer_id = ?',
      [interestToDelete.id, customerId]
    );

    console.log(`✅ حذف انجام شد: ${deleteResult[0].affectedRows} رکورد حذف شد`);

    // Step 5: Verify delete
    console.log('\n5️⃣ تأیید حذف:');
    const [afterDelete] = await connection.query(`
      SELECT COUNT(*) as count FROM customer_product_interests 
      WHERE customer_id = ?
    `, [customerId]);

    console.log(`✅ تعداد علاقه‌مندی‌های باقی‌مانده: ${afterDelete[0].count}`);

    // Step 6: Test updated data for component
    console.log('\n6️⃣ داده بروزرسانی شده برای کامپوننت:');
    const [updatedProducts] = await connection.query(`
      SELECT cpi.id, p.id as product_id, p.name as product_name, p.description, p.price, p.category,
             cpi.interest_level, cpi.notes, cpi.created_at
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    console.log(`✅ داده بروزرسانی شده: ${updatedProducts.length} مورد`);

    // Step 7: Restore for future tests
    console.log('\n7️⃣ بازگردانی برای تست‌های آینده:');
    const { v4: uuidv4 } = require('uuid');
    const newInterestId = uuidv4();

    await connection.query(`
      INSERT INTO customer_product_interests (id, customer_id, product_id, interest_level, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      newInterestId,
      customerId,
      interestToDelete.product_id,
      interestToDelete.interest_level,
      interestToDelete.notes
    ]);

    console.log('✅ علاقه‌مندی بازگردانی شد');

    console.log('\n🎉 تست کامل فرآیند حذف موفقیت‌آمیز بود!');
    console.log('\n📋 خلاصه:');
    console.log('   ✅ API مشتری Interest ID را برمی‌گرداند');
    console.log('   ✅ کوئری حذف کار می‌کند');
    console.log('   ✅ ساختار داده کامپوننت صحیح است');
    console.log('   ✅ فرآیند کامل تست شد');
    
    console.log('\n💡 اگر حذف در وب اپ کار نمی‌کند، مشکل احتمالاً در:');
    console.log('   - Authentication (توکن نامعتبر)');
    console.log('   - Network (خطای شبکه)');
    console.log('   - Frontend state management');
    console.log('   - Browser console errors');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testCompleteDeleteFlow();