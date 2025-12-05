const mysql = require('mysql2/promise');
require('dotenv').config();

async function addImageField() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm_system'
    });
    
    console.log('🔄 Adding image field to products table...');
    
    // چک کنیم که فیلد از قبل وجود نداره
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'image'",
      [process.env.DB_NAME || 'crm_system']
    );
    
    if (columns.length > 0) {
      console.log('✅ Field "image" already exists!');
    } else {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN image VARCHAR(500) NULL AFTER description'
      );
      console.log('✅ Field "image" added successfully!');
    }
    
    // نمایش ساختار جدید
    const [structure] = await connection.execute('DESCRIBE products');
    console.log('\n📋 Updated table structure:');
    structure.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addImageField();
