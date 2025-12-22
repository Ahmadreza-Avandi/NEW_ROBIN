const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'crm_system'
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔌 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ اتصال برقرار شد');
    
    // بررسی جدول users
    console.log('\n👥 بررسی ساختار جدول users:');
    const [usersColumns] = await connection.execute('DESCRIBE users');
    console.log('ستون‌های جدول users:');
    usersColumns.forEach(col => {
      console.log(`  • ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // بررسی جدول products
    console.log('\n📦 بررسی ساختار جدول products:');
    const [productsColumns] = await connection.execute('DESCRIBE products');
    console.log('ستون‌های جدول products:');
    productsColumns.forEach(col => {
      console.log(`  • ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // بررسی تعداد رکوردهای موجود
    console.log('\n📊 آمار فعلی:');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE tenant_key = ?', ['rabin']);
    const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE tenant_key = ?', ['rabin']);
    
    console.log(`👥 کاربران تنانت rabin: ${userCount[0].count}`);
    console.log(`📦 محصولات تنانت rabin: ${productCount[0].count}`);
    
    // نمایش کاربران موجود
    if (userCount[0].count > 0) {
      console.log('\n👥 کاربران موجود:');
      const [existingUsers] = await connection.execute(
        'SELECT id, name, email, role FROM users WHERE tenant_key = ? ORDER BY role, name', 
        ['rabin']
      );
      existingUsers.forEach(user => {
        console.log(`  • ${user.name} (${user.role}) - ${user.email} [${user.id}]`);
      });
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

checkDatabaseStructure();