const mysql = require('mysql2/promise');

async function createSaleItemsTable() {
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

    // Create sale_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
          id VARCHAR(36) PRIMARY KEY,
          tenant_key VARCHAR(50) NOT NULL,
          sale_id VARCHAR(36) NOT NULL,
          product_id VARCHAR(36) NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_category VARCHAR(100),
          quantity INT NOT NULL DEFAULT 1,
          unit_price DECIMAL(15,2) NOT NULL,
          total_price DECIMAL(15,2) NOT NULL,
          discount_amount DECIMAL(15,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_tenant_key (tenant_key),
          INDEX idx_sale_id (sale_id),
          INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ جدول sale_items ایجاد شد');

    // Check table structure
    const [structure] = await connection.query('DESCRIBE sale_items');
    console.log('\n📋 ساختار جدول sale_items:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type}`);
    });

    console.log('\n🎉 جدول آماده است!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

createSaleItemsTable();