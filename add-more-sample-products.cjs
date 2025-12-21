const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function addMoreSampleProducts() {
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

    // Check current products
    const [currentProducts] = await connection.query(`
      SELECT name, category FROM products WHERE tenant_key = 'rabin'
    `);

    console.log(`📦 محصولات فعلی (${currentProducts.length} مورد):`);
    currentProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category})`);
    });

    // Add more sample products
    const newProducts = [
      {
        id: uuidv4(),
        name: 'سیستم مدیریت انبار (WMS)',
        description: 'سیستم جامع مدیریت انبار و موجودی کالا',
        category: 'نرم‌افزار',
        price: 25000000,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'سیستم مدیریت منابع انسانی (HRM)',
        description: 'سیستم کامل مدیریت کارکنان و حقوق و دستمزد',
        category: 'نرم‌افزار',
        price: 35000000,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'اپلیکیشن موبایل اختصاصی',
        description: 'طراحی و توسعه اپلیکیشن موبایل برای اندروید و iOS',
        category: 'توسعه موبایل',
        price: 45000000,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'سیستم امنیت شبکه',
        description: 'راه‌حل‌های امنیتی پیشرفته برای شبکه‌های سازمانی',
        category: 'امنیت',
        price: 20000000,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'خدمات پشتیبانی فنی',
        description: 'خدمات پشتیبانی 24/7 برای سیستم‌های IT',
        category: 'خدمات',
        price: 5000000,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'آموزش کارکنان IT',
        description: 'دوره‌های آموزشی تخصصی برای کارکنان فنی',
        category: 'آموزش',
        price: 8000000,
        status: 'active'
      }
    ];

    console.log('\n➕ افزودن محصولات جدید...');

    for (const product of newProducts) {
      await connection.query(`
        INSERT INTO products (id, tenant_key, name, description, category, price, status, created_by, created_at, updated_at)
        VALUES (?, 'rabin', ?, ?, ?, ?, ?, 'system', NOW(), NOW())
      `, [
        product.id,
        product.name,
        product.description,
        product.category,
        product.price,
        product.status
      ]);

      console.log(`✅ ${product.name} اضافه شد`);
    }

    // Check updated products list
    const [updatedProducts] = await connection.query(`
      SELECT name, category, price FROM products 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC
    `);

    console.log(`\n📦 محصولات بروزرسانی شده (${updatedProducts.length} مورد):`);
    updatedProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category}) - ${product.price.toLocaleString('fa-IR')} تومان`);
    });

    // Test available products for the specific customer
    const customerId = '98dad6eb-d387-11f0-8d2c-581122e4f0be';
    const [availableForCustomer] = await connection.query(`
      SELECT p.id, p.name, p.category, p.price
      FROM products p
      WHERE p.tenant_key = ? 
      AND p.status = 'active'
      AND p.id NOT IN (
        SELECT product_id FROM customer_product_interests 
        WHERE customer_id = ?
      )
      ORDER BY p.name ASC
    `, ['rabin', customerId]);

    console.log(`\n🎯 محصولات قابل اضافه کردن برای مشتری (${availableForCustomer.length} مورد):`);
    availableForCustomer.forEach(product => {
      console.log(`  - ${product.name} (${product.category})`);
    });

    console.log('\n🎉 محصولات جدید با موفقیت اضافه شدند!');
    console.log('حالا می‌توانید در وب اپ محصولات جدید را به لیست علاقه‌مندی‌ها اضافه کنید.');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

addMoreSampleProducts();