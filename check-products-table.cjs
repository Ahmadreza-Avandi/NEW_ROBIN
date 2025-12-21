const mysql = require('mysql2/promise');

async function checkProductsTable() {
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

    // بررسی ساختار جدول products
    const [structure] = await connection.query("DESCRIBE products");
    console.log('🏗️ ساختار جدول products:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'} ${col.Key} ${col.Default ? `default: ${col.Default}` : ''} ${col.Extra}`);
    });

    // بررسی محصولات موجود
    const [existingProducts] = await connection.query("SELECT * FROM products WHERE tenant_key = 'rabin'");
    console.log('\n📦 محصولات موجود:', existingProducts.length);
    existingProducts.forEach(product => {
      console.log(`  - ID: ${product.id}, نام: ${product.name}`);
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

checkProductsTable();