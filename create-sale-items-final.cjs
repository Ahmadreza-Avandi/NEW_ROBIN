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

    // Check if table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'sale_items'
    `);

    if (tables.length > 0) {
      console.log('✅ جدول sale_items از قبل موجود است');
    } else {
      // Create sale_items table
      await connection.query(`
        CREATE TABLE sale_items (
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
    }

    // Update sales titles if needed
    await connection.query(`
      UPDATE sales 
      SET title = CONCAT('فروش ', customer_name, ' - ', DATE_FORMAT(COALESCE(sale_date, created_at), '%Y/%m/%d'))
      WHERE (title IS NULL OR title = '') AND tenant_key = 'rabin'
    `);
    console.log('✅ عناوین فروش به‌روزرسانی شد');

    console.log('🎉 همه چیز آماده است!');

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