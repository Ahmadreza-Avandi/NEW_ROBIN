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
          INDEX idx_product_id (product_id),
          INDEX idx_product_category (product_category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ جدول sale_items ایجاد شد');

    // Update sales titles
    await connection.query(`
      UPDATE sales 
      SET title = CONCAT('فروش ', customer_name, ' - ', DATE_FORMAT(COALESCE(sale_date, created_at), '%Y/%m/%d'))
      WHERE title IS NULL OR title = ''
    `);

    console.log('✅ عناوین فروش به‌روزرسانی شد');

    // Add sample sale items
    const [sales] = await connection.query(`
      SELECT id, tenant_key, customer_name, total_amount 
      FROM sales 
      WHERE tenant_key = 'rabin' 
      LIMIT 3
    `);

    const [products] = await connection.query(`
      SELECT id, name, category 
      FROM products 
      WHERE tenant_key = 'rabin' AND status = 'active' 
      LIMIT 3
    `);

    if (sales.length > 0 && products.length > 0) {
      for (let i = 0; i < Math.min(sales.length, products.length); i++) {
        const sale = sales[i];
        const product = products[i];
        
        await connection.query(`
          INSERT INTO sale_items (id, tenant_key, sale_id, product_id, product_name, product_category, quantity, unit_price, total_price)
          VALUES (UUID(), ?, ?, ?, ?, ?, 1, ?, ?)
        `, [
          sale.tenant_key,
          sale.id,
          product.id,
          product.name,
          product.category,
          sale.total_amount,
          sale.total_amount
        ]);
      }
      console.log(`✅ ${Math.min(sales.length, products.length)} آیتم فروش نمونه اضافه شد`);
    }

    // Check results
    const [structure] = await connection.query('DESCRIBE sale_items');
    console.log('\n📋 ساختار جدول sale_items:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type}`);
    });

    const [sampleItems] = await connection.query(`
      SELECT si.product_name, si.quantity, si.unit_price, si.total_price, s.customer_name
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE si.tenant_key = 'rabin'
      LIMIT 3
    `);

    console.log(`\n📊 نمونه آیتم‌های فروش (${sampleItems.length} مورد):`);
    sampleItems.forEach((item, index) => {
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

createSaleItemsTable();