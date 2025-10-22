#!/usr/bin/env node

/**
 * تست اتصال دیتابیس برای Docker
 * این اسکریپت اتصال به دیتابیس رو تست می‌کنه
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 تست اتصال دیتابیس...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // نمایش تنظیمات
  console.log('📋 تنظیمات دیتابیس:');
  console.log(`   Host: ${process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost'}`);
  console.log(`   User: ${process.env.DATABASE_USER || process.env.DB_USER || 'crm_user'}`);
  console.log(`   Password: ${process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '1234'}`);
  console.log(`   Database: ${process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system'}`);
  console.log('');

  const dbConfig = {
    host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.DATABASE_USER || process.env.DB_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
    connectTimeout: 10000,
  };

  let connection;
  
  try {
    console.log('🔌 تلاش برای اتصال...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ اتصال موفقیت‌آمیز!');
    
    // تست query ساده
    console.log('🧪 تست query ساده...');
    const [result] = await connection.query('SELECT VERSION() as version, NOW() as current_time');
    console.log('✅ Query موفقیت‌آمیز!');
    console.log(`   نسخه MySQL: ${result[0].version}`);
    console.log(`   زمان فعلی: ${result[0].current_time}`);
    
    // بررسی جداول موجود
    console.log('📊 بررسی جداول موجود...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ تعداد جداول: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📋 جداول موجود:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('⚠️  هیچ جدولی یافت نشد!');
    }
    
    // تست جدول users
    console.log('👥 بررسی جدول users...');
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ تعداد کاربران: ${users[0].count}`);
    } catch (error) {
      console.log('❌ جدول users یافت نشد یا مشکل دارد');
    }
    
    // تست جدول customers
    console.log('🏢 بررسی جدول customers...');
    try {
      const [customers] = await connection.query('SELECT COUNT(*) as count FROM customers');
      console.log(`✅ تعداد مشتریان: ${customers[0].count}`);
    } catch (error) {
      console.log('❌ جدول customers یافت نشد یا مشکل دارد');
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 تست دیتابیس با موفقیت انجام شد!');
    
  } catch (error) {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ خطا در اتصال دیتابیس:');
    console.error(`   کد خطا: ${error.code || 'نامشخص'}`);
    console.error(`   پیام خطا: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 راه‌حل‌های پیشنهادی:');
      console.log('   1. مطمئن شوید MySQL container در حال اجراست');
      console.log('   2. بررسی کنید که HOST درست تنظیم شده (mysql برای Docker)');
      console.log('   3. دستور: docker-compose ps');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 راه‌حل‌های پیشنهادی:');
      console.log('   1. بررسی نام کاربری و رمز عبور');
      console.log('   2. مطمئن شوید کاربر crm_user ایجاد شده');
      console.log('   3. بررسی فایل database/init.sql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('');
      console.log('💡 راه‌حل‌های پیشنهادی:');
      console.log('   1. مطمئن شوید دیتابیس crm_system ایجاد شده');
      console.log('   2. بررسی فایل database/init.sql');
      console.log('   3. دستور: docker-compose exec mysql mariadb -u root -p1234 -e "SHOW DATABASES;"');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اجرای تست
testDatabaseConnection().catch(console.error);