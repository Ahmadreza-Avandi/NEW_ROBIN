const mysql = require('mysql2/promise');

async function testInterestsAPI() {
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

    // پیدا کردن یک مشتری و محصول نمونه
    const [customers] = await connection.query(`
      SELECT id, name FROM customers WHERE tenant_key = 'rabin' LIMIT 1
    `);

    const [products] = await connection.query(`
      SELECT id, name FROM products WHERE tenant_key = 'rabin' LIMIT 3
    `);

    if (customers.length === 0 || products.length === 0) {
      console.log('❌ مشتری یا محصول نمونه‌ای یافت نشد');
      return;
    }

    const customerId = customers[0].id;
    const customerName = customers[0].name;
    console.log(`🔍 تست برای مشتری: ${customerName} (${customerId})`);

    // تست کوئری لیست محصولات موجود (که قبلاً اضافه نشده)
    console.log('\n📦 تست لیست محصولات موجود:');
    const [availableProducts] = await connection.query(`
      SELECT p.id, p.name, p.description, p.price, p.category
      FROM products p
      WHERE p.tenant_key = ? 
      AND p.status = 'active'
      AND p.id NOT IN (
        SELECT product_id FROM customer_product_interests 
        WHERE customer_id = ?
      )
      ORDER BY p.name ASC
      LIMIT 10
    `, ['rabin', customerId]);

    console.log(`✅ محصولات موجود برای اضافه کردن: ${availableProducts.length} مورد`);
    availableProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category || 'بدون دسته'})`);
    });

    // تست کوئری علاقه‌مندی‌های فعلی
    console.log('\n💝 تست علاقه‌مندی‌های فعلی:');
    const [currentInterests] = await connection.query(`
      SELECT cpi.*, p.name as product_name, p.description, p.price, p.category
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, 'rabin']);

    console.log(`✅ علاقه‌مندی‌های فعلی: ${currentInterests.length} مورد`);
    currentInterests.forEach(interest => {
      console.log(`  - ${interest.product_name} (${interest.interest_level || 'medium'})`);
    });

    // تست شبیه‌سازی اضافه کردن علاقه‌مندی جدید (اگر محصول موجود باشه)
    if (availableProducts.length > 0) {
      console.log('\n➕ شبیه‌سازی اضافه کردن علاقه‌مندی:');
      const newProductId = availableProducts[0].id;
      const newProductName = availableProducts[0].name;
      
      // بررسی عدم تکرار
      const [existing] = await connection.query(
        'SELECT id FROM customer_product_interests WHERE customer_id = ? AND product_id = ?',
        [customerId, newProductId]
      );

      if (existing.length === 0) {
        console.log(`✅ محصول "${newProductName}" قابل اضافه کردن است`);
        console.log('  (در حالت واقعی، اینجا علاقه‌مندی اضافه می‌شود)');
      } else {
        console.log(`⚠️ محصول "${newProductName}" قبلاً اضافه شده`);
      }
    }

    console.log('\n🎉 همه تست‌ها موفقیت‌آمیز بودند!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testInterestsAPI();