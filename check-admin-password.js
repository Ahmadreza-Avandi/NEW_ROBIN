#!/usr/bin/env node

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkAdminPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'crm_user',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.SAAS_DATABASE_NAME || 'saas_master',
    });

    console.log('\n🔐 بررسی رمز عبور Super Admin:\n');
    
    const [admins] = await connection.query(
      'SELECT id, username, email, full_name, password_hash FROM super_admins'
    );
    
    if (admins.length === 0) {
      console.log('❌ هیچ Super Admin یافت نشد');
      return;
    }

    const admin = admins[0];
    console.log('✅ Super Admin یافت شد:');
    console.log('  نام کامل:', admin.full_name);
    console.log('  نام کاربری:', admin.username);
    console.log('  ایمیل:', admin.email);
    console.log('  رمز (hash):', admin.password_hash.substring(0, 30) + '...');

    // تست رمزهای مختلف
    const testPasswords = ['Ahmadreza.avandi', 'admin123', 'Admin123', '123456', 'password'];
    
    console.log('\n🔍 تست رمزهای مختلف:');
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, admin.password_hash);
      console.log(`  "${testPassword}":`, isMatch ? '✅ صحیح' : '❌ نادرست');
      
      if (isMatch) {
        console.log('\n✅ رمز عبور صحیح پیدا شد:', testPassword);
        break;
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkAdminPassword();
