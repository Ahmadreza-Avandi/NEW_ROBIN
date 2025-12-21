const mysql = require('mysql2/promise');

async function checkTablesStructure() {
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

    // بررسی جداول موجود
    const tables = ['customers', 'products', 'customer_product_interests', 'sales', 'activities', 'contacts', 'tickets'];
    
    for (const tableName of tables) {
      try {
        console.log(`\n📋 ساختار جدول ${tableName}:`);
        const [structure] = await connection.query(`DESCRIBE ${tableName}`);
        structure.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'} ${col.Key} ${col.Extra}`);
        });
        
        // شمارش رکوردها
        const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE tenant_key = 'rabin' OR tenant_key IS NULL`);
        console.log(`  📊 تعداد رکوردها: ${count[0].count}`);
        
      } catch (error) {
        console.log(`  ❌ جدول ${tableName} وجود ندارد یا خطا: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

checkTablesStructure();