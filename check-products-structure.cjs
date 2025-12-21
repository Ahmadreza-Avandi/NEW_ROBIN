const mysql = require('mysql2/promise');

async function checkProductsStructure() {
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

    // Check products table structure
    const [productsStructure] = await connection.query('DESCRIBE products');
    console.log('📋 ساختار جدول products:');
    productsStructure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'}`);
    });

    // Check sample products
    const [products] = await connection.query(`
      SELECT * FROM products WHERE tenant_key = 'rabin' LIMIT 3
    `);

    console.log(`\n📦 نمونه محصولات (${products.length} مورد):`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price} تومان`);
      console.log(`   وضعیت: ${product.status}`);
      if (product.category) console.log(`   دسته: ${product.category}`);
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

checkProductsStructure();