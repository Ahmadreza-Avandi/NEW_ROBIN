const mysql = require('mysql2/promise');

async function checkSaleItemsTable() {
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

    // Check if table exists and its structure
    const [structure] = await connection.query('DESCRIBE sale_items');
    console.log('📋 ساختار جدول sale_items:');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(required)' : '(nullable)'}`);
    });

    // Add sample data manually
    const [sales] = await connection.query(`
      SELECT id, tenant_key, customer_name, total_amount 
      FROM sales 
      WHERE tenant_key = 'rabin' 
      LIMIT 2
    `);

    const [products] = await connection.query(`
      SELECT id, name, category 
      FROM products 
      WHERE tenant_key = 'rabin' AND status = 'active' 
      LIMIT 2
    `);

    console.log(`\n📊 یافت شد: ${sales.length} فروش و ${products.length} محصول`);

    if (sales.length > 0 && products.length > 0) {
      // Clear existing data first
      await connection.query('DELETE FROM sale_items WHERE tenant_key = ?', ['rabin']);
      
      for (let i = 0; i < Math.min(sales.length, products.length); i++) {
        const sale = sales[i];
        const product = products[i];
        
        console.log(`🔄 اضافه کردن: ${product.name} برای فروش ${sale.customer_name}`);
        
        await connection.query(`
          INSERT INTO sale_items (
            id, tenant_key, sale_id, product_id, product_name, 
            product_category, quantity, unit_price, total_price
          ) VALUES (UUID(), ?, ?, ?, ?, ?, 1, ?, ?)
        `, [
          sale.tenant_key,
          sale.id,
          product.id,
          product.name,
          product.category || 'عمومی',
          sale.total_amount,
          sale.total_amount
        ]);
      }
      console.log(`✅ ${Math.min(sales.length, products.length)} آیتم فروش اضافه شد`);
    }

    // Check final results
    const [items] = await connection.query(`
      SELECT si.*, s.customer_name
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE si.tenant_key = 'rabin'
    `);

    console.log(`\n📦 آیتم‌های فروش (${items.length} مورد):`);
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.product_name} (${item.product_category})`);
      console.log(`   مشتری: ${item.customer_name}`);
      console.log(`   تعداد: ${item.quantity} × ${item.unit_price} = ${item.total_price}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

checkSaleItemsTable();