#!/usr/bin/env node

/**
 * تنظیم مجدد رمز عبور کاربر demo
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'crm_system'
};

async function resetDemoPassword() {
  let connection;
  
  try {
    console.log('🔐 تنظیم مجدد رمز عبور کاربر demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر demo
    const [users] = await connection.query(
      'SELECT id, name, email, tenant_key FROM users WHERE tenant_key = "demo"'
    );

    if (users.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = users[0];
    console.log(`✅ کاربر demo: ${demoUser.name} (${demoUser.email})`);

    // تنظیم رمز عبور جدید
    const newPassword = 'demo123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // به‌روزرسانی رمز عبور
    await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, demoUser.id]
    );

    console.log('✅ رمز عبور به‌روزرسانی شد');
    console.log('\n🔑 اطلاعات لاگین:');
    console.log(`   Email: ${demoUser.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   URL: http://localhost:3000/demo/login`);

    console.log('\n✨ تنظیمات کامل شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDemoPassword();