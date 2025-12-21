const mysql = require('mysql2/promise');

async function fixSaleItemsStructure() {
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

    // Add missing columns
    try {
      await connection.query(`
        ALTER TABLE sale_items 
        ADD COLUMN product_category VARCHAR(100) AFTER product_name
      `);
      console.log('✅ ستون product_category اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ ستون product_category از قبل موجود است');
      } else {
        console.log('❌ خطا در اضافه کردن product_category:', error.message);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE sale_items 
        ADD COLUMN discount_amount DECIMAL(15,2) DEFAULT 0 AFTER total_price
      `);
      console.log('✅ ستون discount_amount اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ ستون discount_amount از قبل موجود است');
      } else {
        console.log('❌ خطا در اضافه کردن discount_amount:', error.message);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE sale_items 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at
      `);
      console.log('✅ ستون updated_at اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ ستون updated_at از قبل موجود است');
      } else {
        console.log('❌ خطا در اضافه کردن updated_at:', error.message);
      }
    }

    // Check final structure
    const [structure] = await connection.query('DESCRIBE sale_items');
    console.log('\n📋 ساختار نهایی جدول sale_items:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'}`);
    });

    console.log('\n🎉 ساختار جدول درست شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

fixSaleItemsStructure();