const mysql = require('mysql2/promise');

async function testProductsAPI() {
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

    // Check products
    const [products] = await connection.query(`
      SELECT p.id, p.name, p.description, p.price, p.category, p.image, p.currency
      FROM products p
      WHERE p.tenant_key = 'rabin' AND p.status = 'active'
      ORDER BY p.name ASC
      LIMIT 10
    `);

    console.log(`📦 تعداد محصولات فعال: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 محصولات موجود:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   قیمت: ${product.price} ${product.currency || 'IRR'}`);
        console.log(`   دسته: ${product.category || 'بدون دسته'}`);
        console.log('');
      });
    } else {
      console.log('❌ هیچ محصول فعالی یافت نشد');
      
      // Check all products
      const [allProducts] = await connection.query(`
        SELECT p.id, p.name, p.status, p.tenant_key
        FROM products p
        WHERE p.tenant_key = 'rabin'
        LIMIT 5
      `);
      
      console.log(`📊 کل محصولات tenant rabin: ${allProducts.length}`);
      allProducts.forEach(product => {
        console.log(`- ${product.name} (وضعیت: ${product.status})`);
      });
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

testProductsAPI();