#!/usr/bin/env node

/**
 * اسکریپت برطرف کردن مشکل Tenant Filtering در API ها
 * این اسکریپت دیتاهای demo رو به tenant صحیح (rabin) منتقل می‌کنه
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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

async function fixTenantFiltering() {
  log('\n🔧 شروع برطرف کردن مشکل Tenant Filtering...', 'cyan');
  log('='.repeat(60), 'blue');

  const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'crm_system',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    log('✅ اتصال به دیتابیس برقرار شد', 'green');

    // 1. بررسی جداول دارای tenant_key
    log('\n📊 بررسی جداول دارای tenant_key...', 'yellow');
    
    const tables = [
      'customers',
      'activities',
      'tasks',
      'documents',
      'deals',
      'sales',
      'contacts',
      'products'
    ];

    for (const table of tables) {
      try {
        // بررسی وجود ستون tenant_key
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE 'tenant_key'`
        );

        if (columns.length > 0) {
          log(`  ✅ جدول ${table} دارای ستون tenant_key است`, 'green');
          
          // شمارش رکوردهای demo
          const [demoRecords] = await connection.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'demo'`
          );
          
          const demoCount = demoRecords[0].count;
          
          if (demoCount > 0) {
            log(`    ⚠️  ${demoCount} رکورد با tenant_key='demo' یافت شد`, 'yellow');
            
            // به‌روزرسانی به rabin
            const [result] = await connection.query(
              `UPDATE ${table} SET tenant_key = 'rabin' WHERE tenant_key = 'demo'`
            );
            
            log(`    ✅ ${result.affectedRows} رکورد به tenant 'rabin' منتقل شد`, 'green');
          } else {
            log(`    ℹ️  هیچ رکورد demo یافت نشد`, 'blue');
          }
          
          // شمارش رکوردهای NULL
          const [nullRecords] = await connection.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key IS NULL`
          );
          
          const nullCount = nullRecords[0].count;
          
          if (nullCount > 0) {
            log(`    ⚠️  ${nullCount} رکورد با tenant_key=NULL یافت شد`, 'yellow');
            
            // به‌روزرسانی به rabin
            const [result] = await connection.query(
              `UPDATE ${table} SET tenant_key = 'rabin' WHERE tenant_key IS NULL`
            );
            
            log(`    ✅ ${result.affectedRows} رکورد NULL به tenant 'rabin' منتقل شد`, 'green');
          }
          
        } else {
          log(`  ⚠️  جدول ${table} ستون tenant_key ندارد`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ خطا در بررسی جدول ${table}: ${error.message}`, 'red');
      }
    }

    // 2. بررسی نهایی
    log('\n📊 بررسی نهایی...', 'yellow');
    
    for (const table of tables) {
      try {
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE 'tenant_key'`
        );

        if (columns.length > 0) {
          const [rabinRecords] = await connection.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'rabin'`
          );
          
          const [demoRecords] = await connection.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'demo'`
          );
          
          const [nullRecords] = await connection.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key IS NULL`
          );
          
          log(`  📋 ${table}:`, 'blue');
          log(`    - rabin: ${rabinRecords[0].count}`, 'green');
          log(`    - demo: ${demoRecords[0].count}`, demoRecords[0].count > 0 ? 'red' : 'blue');
          log(`    - NULL: ${nullRecords[0].count}`, nullRecords[0].count > 0 ? 'yellow' : 'blue');
        }
      } catch (error) {
        // جدول وجود ندارد یا خطای دیگر
      }
    }

    await connection.end();

    log('\n' + '='.repeat(60), 'blue');
    log('✅ برطرف کردن مشکل Tenant Filtering تمام شد!', 'green');
    log('='.repeat(60), 'blue');

  } catch (error) {
    log(`\n❌ خطا: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

fixTenantFiltering().catch(console.error);
