const mysql = require('mysql2/promise');

async function addSampleProducts() {
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

    // اضافه کردن محصولات نمونه
    const sampleProducts = [
      {
        name: 'سیستم مدیریت ارتباط با مشتری (CRM)',
        description: 'نرم‌افزار جامع مدیریت مشتریان',
        price: 15000000,
        category: 'نرم‌افزار'
      },
      {
        name: 'سیستم حسابداری',
        description: 'نرم‌افزار حسابداری و مالی',
        price: 8000000,
        category: 'نرم‌افزار'
      },
      {
        name: 'خدمات مشاوره IT',
        description: 'مشاوره فناوری اطلاعات',
        price: 5000000,
        category: 'خدمات'
      },
      {
        name: 'طراحی وب‌سایت',
        description: 'طراحی و توسعه وب‌سایت',
        price: 12000000,
        category: 'خدمات'
      }
    ];

    // حذف محصولات قبلی tenant rabin
    await connection.query('DELETE FROM products WHERE tenant_key = ?', ['rabin']);
    console.log('🗑️ محصولات قبلی حذف شدند');

    const productIds = [];
    for (const product of sampleProducts) {
      const productId = require('crypto').randomUUID();
      await connection.query(`
        INSERT INTO products (
          id, tenant_key, name, description, price, category, status,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'active', 'ceo-001', NOW(), NOW())
      `, [
        productId, 'rabin', product.name, product.description, product.price, product.category
      ]);
      productIds.push(productId);
    }

    console.log('✅ محصولات نمونه اضافه شدند');

    // دریافت لیست مشتریان
    const [customers] = await connection.query(`
      SELECT id, name FROM customers WHERE tenant_key = 'rabin' LIMIT 3
    `);

    // حذف علاقه‌مندی‌های قبلی
    await connection.query(`
      DELETE cpi FROM customer_product_interests cpi
      JOIN customers c ON cpi.customer_id = c.id
      WHERE c.tenant_key = 'rabin'
    `);

    // اضافه کردن علاقه‌مندی‌های نمونه
    if (customers.length > 0 && productIds.length > 0) {
      const crypto = require('crypto');
      
      // مشتری اول علاقه‌مند به 2 محصول اول
      await connection.query(`
        INSERT INTO customer_product_interests (id, customer_id, product_id, created_at)
        VALUES (?, ?, ?, NOW()), (?, ?, ?, NOW())
      `, [
        crypto.randomUUID(), customers[0].id, productIds[0], 
        crypto.randomUUID(), customers[0].id, productIds[1]
      ]);

      // مشتری دوم علاقه‌مند به محصول سوم
      if (customers.length > 1) {
        await connection.query(`
          INSERT INTO customer_product_interests (id, customer_id, product_id, created_at)
          VALUES (?, ?, ?, NOW())
        `, [crypto.randomUUID(), customers[1].id, productIds[2]]);
      }

      // مشتری سوم علاقه‌مند به همه محصولات
      if (customers.length > 2) {
        for (const productId of productIds) {
          await connection.query(`
            INSERT INTO customer_product_interests (id, customer_id, product_id, created_at)
            VALUES (?, ?, ?, NOW())
          `, [crypto.randomUUID(), customers[2].id, productId]);
        }
      }

      console.log('✅ علاقه‌مندی‌های نمونه اضافه شدند');
    }

    // نمایش آمار نهایی
    const [finalStats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE tenant_key = 'rabin') as total_products,
        (SELECT COUNT(*) FROM customer_product_interests cpi 
         JOIN customers c ON cpi.customer_id = c.id 
         WHERE c.tenant_key = 'rabin') as total_interests,
        (SELECT COUNT(DISTINCT customer_id) FROM customer_product_interests cpi
         JOIN customers c ON cpi.customer_id = c.id 
         WHERE c.tenant_key = 'rabin') as customers_with_interests
    `);

    console.log('\n📊 آمار نهایی:');
    console.log('  تعداد محصولات:', finalStats[0].total_products);
    console.log('  تعداد علاقه‌مندی‌ها:', finalStats[0].total_interests);
    console.log('  مشتریان با علاقه‌مندی:', finalStats[0].customers_with_interests);

    // نمایش جزئیات علاقه‌مندی‌ها
    const [interestDetails] = await connection.query(`
      SELECT c.name as customer_name, p.name as product_name
      FROM customer_product_interests cpi
      JOIN customers c ON cpi.customer_id = c.id
      JOIN products p ON cpi.product_id = p.id
      WHERE c.tenant_key = 'rabin'
      ORDER BY c.name, p.name
    `);

    console.log('\n💝 جزئیات علاقه‌مندی‌ها:');
    interestDetails.forEach(detail => {
      console.log(`  ${detail.customer_name} ← ${detail.product_name}`);
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

addSampleProducts();