const mysql = require('mysql2/promise');

async function checkSalesStructure() {
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
    console.log('🔍 بررسی ساختار جدول فروش\n');

    // Check sales table structure
    const [salesStructure] = await connection.query(`
      DESCRIBE sales
    `);

    console.log('📋 ساختار جدول sales:');
    salesStructure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'} ${column.Key || ''}`);
    });

    // Check current sales data
    const [salesData] = await connection.query(`
      SELECT * FROM sales WHERE tenant_key = 'rabin' LIMIT 5
    `);

    console.log(`\n📊 نمونه داده‌های فروش (${salesData.length} مورد):`);
    salesData.forEach((sale, index) => {
      console.log(`${index + 1}. ${sale.customer_name}: ${sale.total_amount} ${sale.currency}`);
      console.log(`   وضعیت: ${sale.payment_status}`);
      console.log(`   فروشنده: ${sale.sales_person_name}`);
      console.log(`   تاریخ: ${sale.sale_date || sale.created_at}`);
      console.log('');
    });

    // Check if we need to add product-related fields
    console.log('🔍 بررسی نیاز به فیلدهای محصول:');
    const hasProductFields = salesStructure.some(col => col.Field.includes('product'));
    
    if (!hasProductFields) {
      console.log('❌ فیلدهای محصول موجود نیست - نیاز به اضافه کردن');
      console.log('💡 فیلدهای پیشنهادی:');
      console.log('   - product_id (varchar)');
      console.log('   - product_name (varchar)');
      console.log('   - product_category (varchar)');
      console.log('   - quantity (int)');
      console.log('   - unit_price (decimal)');
    } else {
      console.log('✅ فیلدهای محصول موجود است');
    }

    // Check products table for integration
    console.log('\n📦 بررسی جدول محصولات:');
    const [products] = await connection.query(`
      SELECT id, name, category, price FROM products 
      WHERE tenant_key = 'rabin' AND status = 'active'
      LIMIT 5
    `);

    console.log(`✅ ${products.length} محصول فعال یافت شد:`);
    products.forEach(product => {
      console.log(`  - ${product.name} (${product.category}) - ${product.price} تومان`);
    });

    console.log('\n🎯 پیشنهادات بهبود:');
    console.log('1. اضافه کردن فیلدهای محصول به جدول sales');
    console.log('2. ایجاد جدول sale_items برای فروش چند محصوله');
    console.log('3. اضافه کردن آمار پرفروش‌ترین محصولات');
    console.log('4. بهبود نام‌گذاری فروش‌ها');
    console.log('5. اضافه کردن فیلتر بر اساس محصول');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

checkSalesStructure();