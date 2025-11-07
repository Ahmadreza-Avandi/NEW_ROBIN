const mysql = require('mysql2/promise');
require('dotenv').config();

async function testWSLConnection() {
  console.log('🔍 تست اتصال از WSL به MySQL ویندوز...\n');
  
  const windowsIP = '10.255.255.254';
  
  const config = {
    host: windowsIP,
    port: 3306,
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
    socketPath: undefined,
    connectTimeout: 10000,
  };
  
  console.log('📋 تنظیمات:');
  console.log(`   Host: ${config.host} (Windows IP)`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}\n`);
  
  try {
    console.log('🔌 در حال اتصال به MySQL روی ویندوز...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ اتصال موفق!\n');
    
    // تست query
    const [rows] = await connection.query('SELECT 1 as test, NOW() as time, VERSION() as version');
    console.log('📊 نتیجه تست query:', rows[0]);
    
    // بررسی جدول users
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 تعداد کاربران: ${users[0].count}`);
    } catch (err) {
      console.log('⚠️  جدول users موجود نیست یا مشکلی دارد');
    }
    
    await connection.end();
    
    console.log('\n✅ اتصال از WSL به MySQL ویندوز موفق بود!');
    console.log('🚀 حالا می‌توانید اپلیکیشن را اجرا کنید.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطا در اتصال:', error.message);
    console.error('\n💡 راه‌حل‌ها:');
    console.error('   1. مطمئن شوید MySQL در XAMPP/WAMP روشن است');
    console.error('   2. بررسی کنید که MySQL روی 0.0.0.0:3306 listen می‌کند (نه فقط 127.0.0.1)');
    console.error('   3. در my.ini یا my.cnf این خط را اضافه کنید: bind-address = 0.0.0.0');
    console.error('   4. مطمئن شوید که کاربر crm_user از هر IP می‌تواند وصل شود:');
    console.error('      GRANT ALL ON *.* TO \'crm_user\'@\'%\' IDENTIFIED BY \'1234\';');
    console.error('   5. Windows Firewall را بررسی کنید');
    process.exit(1);
  }
}

testWSLConnection();