#!/usr/bin/env node

/**
 * بررسی وضعیت MySQL و راهنمای راه‌اندازی
 */

const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

require('dotenv').config();

async function checkMySQLStatus() {
  console.log('🔍 بررسی وضعیت MySQL...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const dbConfig = {
    host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.DATABASE_USER || process.env.DB_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
    connectTimeout: 5000,
  };

  console.log('📋 تنظیمات دیتابیس:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: 3306`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}\n`);

  // تست اتصال
  console.log('🔌 تست اتصال به MySQL...');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL در حال اجرا است و اتصال موفق!\n');
    
    const [result] = await connection.query('SELECT VERSION() as version');
    console.log(`📊 نسخه MySQL: ${result[0].version}\n`);
    
    await connection.end();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ همه چیز آماده است! می‌توانید لاگین کنید.\n');
    return true;
    
  } catch (error) {
    console.log('❌ MySQL در حال اجرا نیست!\n');
    console.log(`خطا: ${error.message}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 راه‌حل‌های ممکن:\n');
    
    console.log('1️⃣  اگر از XAMPP استفاده می‌کنید:');
    console.log('   - XAMPP Control Panel را باز کنید');
    console.log('   - دکمه Start کنار MySQL را بزنید');
    console.log('   - منتظر بمانید تا وضعیت به Running تغییر کند\n');
    
    console.log('2️⃣  اگر از MySQL مستقل استفاده می‌کنید:');
    console.log('   - Windows: Services را باز کنید و MySQL را Start کنید');
    console.log('   - یا از Command Prompt: net start MySQL80\n');
    
    console.log('3️⃣  اگر از Docker استفاده می‌کنید:');
    console.log('   - docker-compose up -d mysql');
    console.log('   - یا: docker start mysql-container-name\n');
    
    console.log('4️⃣  بررسی پورت 3306:');
    console.log('   - مطمئن شوید پورت 3306 توسط برنامه دیگری استفاده نمی‌شود');
    console.log('   - Windows: netstat -ano | findstr :3306\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 بعد از راه‌اندازی MySQL، دوباره این اسکریپت را اجرا کنید:\n');
    console.log('   node check-mysql-status.cjs\n');
    
    return false;
  }
}

// بررسی سرویس MySQL در ویندوز
async function checkWindowsService() {
  try {
    console.log('🔍 بررسی سرویس MySQL در ویندوز...\n');
    
    const { stdout } = await execPromise('sc query MySQL80 2>nul || sc query MySQL 2>nul');
    
    if (stdout.includes('RUNNING')) {
      console.log('✅ سرویس MySQL در حال اجرا است\n');
    } else if (stdout.includes('STOPPED')) {
      console.log('⚠️  سرویس MySQL متوقف است\n');
      console.log('💡 برای راه‌اندازی:');
      console.log('   net start MySQL80');
      console.log('   یا: net start MySQL\n');
    }
  } catch (error) {
    // سرویس یافت نشد - احتماالا XAMPP یا Docker
    console.log('ℹ️  سرویس MySQL به عنوان Windows Service یافت نشد');
    console.log('   احتماالا از XAMPP یا Docker استفاده می‌کنید\n');
  }
}

// اجرای بررسی
(async () => {
  await checkWindowsService();
  const isRunning = await checkMySQLStatus();
  
  if (isRunning) {
    console.log('🎯 مرحله بعد: رفع مشکل tenant_key');
    console.log('   node fix-login-issue.cjs\n');
  }
})();
