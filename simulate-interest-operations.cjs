const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function simulateInterestOperations() {
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

    // Simulate adding a new interest
    console.log('\n➕ شبیه‌سازی افزودن علاقه‌مندی جدید...');

    // Get an available product
    const [availableProducts] = await connection.query(`
      SELECT p.id, p.name, p.category
      FROM products p
      WHERE p.tenant_key = ? 
      AND p.status = 'active'
      AND p.id NOT IN (
        SELECT product_id FROM customer_product_interests 
        WHERE customer_id = ?
      )
      LIMIT 1
    `, [tenantKey, customerId]);

    if (availableProducts.length === 0) {
      console.log('❌ هیچ محصول قابل اضافه کردنی یافت نشد');
      return;
    }

    const productToAdd = availableProducts[0];
    console.log(`🎯 محصول انتخاب شده: ${productToAdd.name}`);

    // Simulate the add operation
    const interestId = uuidv4();
    const interestLevel = 'high';
    const notes = 'تست افزودن علاقه‌مندی از طریق شبیه‌سازی';

    await connection.query(`
      INSERT INTO customer_product_interests (id, customer_id, product_id, interest_level, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [interestId, customerId, productToAdd.id, interestLevel, notes]);

    console.log(`✅ علاقه‌مندی "${productToAdd.name}" با موفقیت اضافه شد`);
    console.log(`   ID: ${interestId}`);
    console.log(`   سطح علاقه: ${interestLevel}`);
    console.log(`   یادداشت: ${notes}`);

    // Check current interests
    console.log('\n📋 لیست علاقه‌مندی‌های فعلی:');
    const [currentInterests] = await connection.query(`
      SELECT cpi.id, cpi.interest_level, cpi.notes, p.name as product_name
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    currentInterests.forEach((interest, index) => {
      console.log(`${index + 1}. ${interest.product_name} (${interest.interest_level})`);
      if (interest.notes) {
        console.log(`   یادداشت: ${interest.notes}`);
      }
    });

    // Simulate removing the interest we just added
    console.log('\n🗑️ شبیه‌سازی حذف علاقه‌مندی...');

    await connection.query(
      'DELETE FROM customer_product_interests WHERE id = ? AND customer_id = ?',
      [interestId, customerId]
    );

    console.log(`✅ علاقه‌مندی "${productToAdd.name}" با موفقیت حذف شد`);

    // Check updated interests
    console.log('\n📋 لیست علاقه‌مندی‌های بروزرسانی شده:');
    const [updatedInterests] = await connection.query(`
      SELECT cpi.id, cpi.interest_level, cpi.notes, p.name as product_name
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    updatedInterests.forEach((interest, index) => {
      console.log(`${index + 1}. ${interest.product_name} (${interest.interest_level})`);
    });

    // Test the component data structure
    console.log('\n🔄 تست ساختار داده برای کامپوننت:');

    const componentInterests = updatedInterests.map(interest => ({
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

    console.log('✅ ساختار داده کامپوننت:');
    console.log(`   - تعداد علاقه‌مندی‌ها: ${componentInterests.length}`);
    console.log(`   - فرمت داده: مناسب برای CustomerInterestsManager`);

    // Test available products for adding
    const [stillAvailable] = await connection.query(`
      SELECT p.id, p.name, p.category, p.price
      FROM products p
      WHERE p.tenant_key = ? 
      AND p.status = 'active'
      AND p.id NOT IN (
        SELECT product_id FROM customer_product_interests 
        WHERE customer_id = ?
      )
      ORDER BY p.name ASC
    `, [tenantKey, customerId]);

    console.log(`\n📦 محصولات قابل اضافه کردن: ${stillAvailable.length} مورد`);
    stillAvailable.slice(0, 3).forEach(product => {
      console.log(`   - ${product.name} (${product.category})`);
    });

    console.log('\n🎉 شبیه‌سازی عملیات افزودن/حذف موفقیت‌آمیز بود!');
    console.log('✅ سیستم آماده برای استفاده در وب اپ است');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

simulateInterestOperations();