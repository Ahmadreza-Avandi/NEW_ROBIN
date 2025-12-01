const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm_system'
    });
    
    const [rows] = await connection.execute('SHOW TABLES LIKE "products"');
    console.log('Products table exists:', rows.length > 0);
    
    if (rows.length > 0) {
      const [columns] = await connection.execute('DESCRIBE products');
      console.log('Table structure:');
      columns.forEach(col => console.log('- ' + col.Field + ': ' + col.Type));
      
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
      console.log('Total products:', count[0].count);
      
      const [categories] = await connection.execute('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""');
      console.log('Categories:', categories.map(c => c.category));
      
      // نمونه محصولات
      const [samples] = await connection.execute('SELECT id, name, category, base_price, is_active FROM products LIMIT 3');
      console.log('Sample products:');
      samples.forEach(p => console.log(`- ${p.name} (${p.category}) - ${p.base_price} - Active: ${p.is_active}`));
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTable();