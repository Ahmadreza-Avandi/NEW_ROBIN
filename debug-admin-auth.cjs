const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

async function debugAdminAuth() {
  console.log('🔍 دیباگ احراز هویت admin...\n');
  
  try {
    // 1. بررسی JWT_SECRET
    console.log('1️⃣ بررسی JWT_SECRET:');
    console.log(`   JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);
    
    // 2. ایجاد توکن تست
    console.log('\n2️⃣ ایجاد توکن تست:');
    const testPayload = {
      id: 1,
      email: 'ahmadrezaavandi@gmail.com',
      name: 'احمدرضا اوندی',
      role: 'super_admin'
    };
    
    const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log(`   Token: ${testToken.substring(0, 50)}...`);
    
    // 3. تست تأیید توکن
    console.log('\n3️⃣ تست تأیید توکن:');
    try {
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('   ✅ توکن معتبر است');
      console.log(`   User ID: ${decoded.id}`);
      console.log(`   Email: ${decoded.email}`);
      console.log(`   Role: ${decoded.role}`);
    } catch (error) {
      console.log('   ❌ توکن نامعتبر:', error.message);
    }
    
    // 4. بررسی کاربر در دیتابیس
    console.log('\n4️⃣ بررسی کاربر در دیتابیس:');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'saas_master'
    });
    
    const [admins] = await connection.execute(
      'SELECT id, username, email, full_name, is_active FROM super_admins WHERE id = 1'
    );
    
    if (admins.length > 0) {
      const admin = admins[0];
      console.log('   ✅ کاربر یافت شد:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Active: ${admin.is_active}`);
    } else {
      console.log('   ❌ کاربر یافت نشد');
    }
    
    await connection.end();
    
    // 5. تست شبیه‌سازی درخواست
    console.log('\n5️⃣ نمونه cookie برای تست:');
    console.log(`   admin_token=${testToken}`);
    
    console.log('\n💡 راه‌حل‌های پیشنهادی:');
    console.log('   1. مطمئن شوید که در مرورگر logout و login مجدد کنید');
    console.log('   2. کوکی‌های مرورگر را پاک کنید');
    console.log('   3. Developer Tools > Application > Cookies را بررسی کنید');
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

debugAdminAuth();