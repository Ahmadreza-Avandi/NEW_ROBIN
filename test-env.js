#!/usr/bin/env node

/**
 * اسکریپت تست Environment Variables
 * این اسکریپت تنظیمات .env را بررسی و اتصال به دیتابیس را تست می‌کند
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEnvironment() {
  log('\n🔍 بررسی Environment Variables...', 'cyan');
  log('='.repeat(50), 'blue');

  // بررسی متغیرهای ضروری
  const requiredVars = [
    'DATABASE_HOST',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'SAAS_DATABASE_NAME',
    'JWT_SECRET',
  ];

  const optionalVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'RABIN_VOICE_OPENROUTER_API_KEY',
  ];

  let hasErrors = false;

  log('\n✅ متغیرهای ضروری:', 'green');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET')
        ? '***' + value.slice(-4)
        : value;
      log(`  ${varName}: ${displayValue}`, 'green');
    } else {
      log(`  ${varName}: ❌ یافت نشد`, 'red');
      hasErrors = true;
    }
  }

  log('\n📋 متغیرهای اختیاری:', 'yellow');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      const displayValue = varName.includes('PASSWORD')
        ? '***' + value.slice(-4)
        : value;
      log(`  ${varName}: ${displayValue}`, 'yellow');
    } else {
      log(`  ${varName}: - (تنظیم نشده)`, 'yellow');
    }
  }

  if (hasErrors) {
    log('\n❌ خطا: برخی متغیرهای ضروری یافت نشدند!', 'red');
    log('لطفاً فایل .env را بررسی کنید.', 'red');
    process.exit(1);
  }

  // تست اتصال به دیتابیس‌ها
  log('\n🔌 تست اتصال به دیتابیس‌ها...', 'cyan');
  log('='.repeat(50), 'blue');

  const host = process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost';
  const user = process.env.DATABASE_USER || process.env.DB_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '';

  // تست دیتابیس CRM
  log('\n📊 دیتابیس CRM (crm_system):', 'cyan');
  const crmDbConfig = {
    host,
    user,
    password,
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'crm_system',
  };

  log(`  Host: ${crmDbConfig.host}`, 'blue');
  log(`  User: ${crmDbConfig.user}`, 'blue');
  log(`  Database: ${crmDbConfig.database}`, 'blue');

  try {
    const connection = await mysql.createConnection(crmDbConfig);
    log('  ✅ اتصال موفقیت‌آمیز!', 'green');

    // بررسی جداول CRM
    const [crmTables] = await connection.query('SHOW TABLES');
    log(`  📊 تعداد جداول: ${crmTables.length}`, 'green');

    if (crmTables.length === 0) {
      log('  ⚠️  هیچ جدولی یافت نشد. لطفاً دیتابیس را import کنید.', 'yellow');
    } else {
      const crmTableNames = crmTables.map((t) => Object.values(t)[0]);
      const importantCrmTables = ['users', 'customers', 'deals', 'activities', 'documents'];
      
      log('  🔍 جداول مهم:', 'cyan');
      for (const tableName of importantCrmTables) {
        if (crmTableNames.includes(tableName)) {
          const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const count = rows[0].count;
          log(`    ✅ ${tableName}: ${count} رکورد`, 'green');
        } else {
          log(`    ❌ ${tableName}: یافت نشد`, 'red');
        }
      }
    }

    await connection.end();

    // تست دیتابیس SaaS
    log('\n🏢 دیتابیس SaaS (saas_master):', 'cyan');
    const saasDbConfig = {
      host,
      user,
      password,
      database: process.env.SAAS_DATABASE_NAME || 'saas_master',
    };

    log(`  Host: ${saasDbConfig.host}`, 'blue');
    log(`  User: ${saasDbConfig.user}`, 'blue');
    log(`  Database: ${saasDbConfig.database}`, 'blue');

    const saasConnection = await mysql.createConnection(saasDbConfig);
    log('  ✅ اتصال موفقیت‌آمیز!', 'green');

    // بررسی جداول SaaS
    const [saasTables] = await saasConnection.query('SHOW TABLES');
    log(`  📊 تعداد جداول: ${saasTables.length}`, 'green');

    if (saasTables.length === 0) {
      log('  ⚠️  هیچ جدولی یافت نشد. لطفاً دیتابیس را import کنید.', 'yellow');
    } else {
      const saasTableNames = saasTables.map((t) => Object.values(t)[0]);
      const importantSaasTables = ['tenants', 'subscription_plans', 'subscription_history', 'super_admins'];
      
      log('  🔍 جداول مهم:', 'cyan');
      for (const tableName of importantSaasTables) {
        if (saasTableNames.includes(tableName)) {
          const [rows] = await saasConnection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const count = rows[0].count;
          log(`    ✅ ${tableName}: ${count} رکورد`, 'green');
        } else {
          log(`    ❌ ${tableName}: یافت نشد`, 'red');
        }
      }
    }

    await saasConnection.end();

    log('\n' + '='.repeat(50), 'blue');
    log('✅ همه چیز آماده است! می‌توانید پروژه را اجرا کنید.', 'green');
    log('='.repeat(50), 'blue');
    log('\nبرای اجرای پروژه:', 'cyan');
    log('  npm run dev     (Development)', 'cyan');
    log('  npm run build && npm start     (Production)', 'cyan');
    log('  docker-compose up -d     (Docker)', 'cyan');
    log('');

  } catch (error) {
    log('\n❌ خطا در اتصال به دیتابیس:', 'red');
    log(`  ${error.message}`, 'red');
    log('\nراهنمای عیب‌یابی:', 'yellow');
    log('  1. مطمئن شوید MySQL/MariaDB در حال اجرا است', 'yellow');
    log('  2. نام کاربری و رمز عبور را بررسی کنید', 'yellow');
    log('  3. دیتابیس‌ها ایجاد شده باشند', 'yellow');
    log('  4. دسترسی‌های کاربر را بررسی کنید', 'yellow');
    log('\nبرای ایجاد دیتابیس‌ها:', 'cyan');
    log('  mysql -u root -p', 'cyan');
    log('  CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;', 'cyan');
    log('  CREATE DATABASE saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;', 'cyan');
    log('  CREATE USER \'crm_app_user\'@\'localhost\' IDENTIFIED BY \'Ahmad.1386\';', 'cyan');
    log('  GRANT ALL PRIVILEGES ON crm_system.* TO \'crm_app_user\'@\'localhost\';', 'cyan');
    log('  GRANT ALL PRIVILEGES ON saas_master.* TO \'crm_app_user\'@\'localhost\';', 'cyan');
    log('  FLUSH PRIVILEGES;', 'cyan');
    log('\nبرای import کردن:', 'cyan');
    log('  mysql -u crm_app_user -p crm_system < database/crm_system.sql', 'cyan');
    log('  mysql -u crm_app_user -p saas_master < database/saas_master.sql', 'cyan');
    log('');
    process.exit(1);
  }
}

// اجرای تست
testEnvironment().catch((error) => {
  log(`\n❌ خطای غیرمنتظره: ${error.message}`, 'red');
  process.exit(1);
});
