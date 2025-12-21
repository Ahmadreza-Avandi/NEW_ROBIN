const mysql = require('mysql2/promise');
const fs = require('fs');

async function executeSaleItemsTable() {
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

    // Read and execute the SQL file
    const sqlContent = fs.readFileSync('create-sale-items-table.sql', 'utf8');
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`🔄 اجرای: ${statement.trim().substring(0, 50)}...`);
        await connection.query(statement);
      }
    }

    console.log('✅ جدول sale_items با موفقیت ایجاد شد');

    // Check the new table structure
    const [structure] = await connection.query('DESCRIBE sale_items');
    console.log('\n📋 ساختار جدول sale_items:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'}`);
    });

    // Check sample data
    const [sampleData] = await connection.query(`
      SELECT si.*, s.customer_name 
      FROM sale_items si 
      JOIN sales s ON si.sale_id = s.id 
      WHERE si.tenant_key = 'rabin' 
      LIMIT 3
    `);

    console.log(`\n📊 نمونه داده‌های sale_items (${sampleData.length} مورد):`);
    sampleData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.product_name} - ${item.quantity}x ${item.unit_price} = ${item.total_price}`);
      console.log(`   مشتری: ${item.customer_name}`);
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

executeSaleItemsTable();