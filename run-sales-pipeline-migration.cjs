#!/usr/bin/env node

/**
 * Execute Sales Pipeline Database Migration
 * Adds fields and tables needed for sales pipeline functionality
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Smart environment loading - try multiple env files
const envPaths = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '.env.production'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📁 Loaded env from: ${envPath}`);
    break;
  }
}

// Smart environment detection
function detectEnvironment() {
  const isDocker = process.env.DOCKER_CONTAINER === 'true' || 
                   process.env.HOSTNAME?.includes('docker') ||
                   process.env.HOSTNAME?.includes('nextjs') ||
                   process.env.HOSTNAME?.includes('crm');
  
  const isLocal = process.env.NODE_ENV === 'development' && !isDocker;
  
  return { isDocker, isLocal };
}

function getDbConfig() {
  const env = detectEnvironment();
  
  // Smart host detection
  let host = process.env.DATABASE_HOST || process.env.DB_HOST;
  if (env.isLocal && (host === 'mysql' || !host)) {
    host = 'localhost';
  } else if (env.isDocker && (host === 'localhost' || !host)) {
    host = 'mysql';
  } else if (!host) {
    host = process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost';
  }
  
  // Smart user detection
  let user = process.env.DATABASE_USER || process.env.DB_USER;
  if (!user) {
    user = env.isLocal ? 'root' : 'crm_user';
  }
  
  // Smart password detection
  let password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
  if (!password) {
    password = env.isLocal ? '' : '1234';
  }
  
  return { host, user, password };
}

const DB_CONFIG = {
  host: 'localhost',
  user: 'crm_user',
  password: '1234',
  database: 'crm_system'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🚀 شروع migration سیستم پیگیری فروش...\n');
    console.log(`📊 اتصال به دیتابیس: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`👤 کاربر: ${DB_CONFIG.user}\n`);
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // خواندن فایل migration
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-sales-pipeline-fields.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`فایل migration یافت نشد: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 فایل migration خوانده شد\n');
    
    // تقسیم SQL به دستورات جداگانه
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('#'));
    
    console.log(`📝 ${statements.length} دستور SQL برای اجرا یافت شد\n`);
    
    // اجرای هر دستور
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ اجرای دستور ${i + 1}/${statements.length}...`);
        
        // نمایش خلاصه دستور
        const firstLine = statement.split('\n')[0].substring(0, 80);
        console.log(`   ${firstLine}${firstLine.length >= 80 ? '...' : ''}`);
        
        const [result] = await connection.execute(statement);
        
        // نمایش نتیجه
        if (result.affectedRows !== undefined) {
          console.log(`   ✅ موفق - ${result.affectedRows} رکورد تأثیر پذیرفت`);
        } else if (result.warningStatus === 0) {
          console.log(`   ✅ موفق`);
        } else {
          console.log(`   ✅ موفق با هشدار`);
        }
        
        successCount++;
        
      } catch (error) {
        // بررسی خطاهای قابل نادیده گیری
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.message.includes('Duplicate column name') ||
            error.message.includes('already exists')) {
          console.log(`   ⚠️  رد شد - قبلاً اجرا شده: ${error.message.split('\n')[0]}`);
          skipCount++;
        } else {
          console.log(`   ❌ خطا: ${error.message}`);
          throw error;
        }
      }
      
      console.log(''); // خط خالی
    }
    
    console.log('🎉 Migration با موفقیت تکمیل شد!\n');
    console.log(`📊 خلاصه:`);
    console.log(`   ✅ موفق: ${successCount} دستور`);
    console.log(`   ⚠️  رد شده: ${skipCount} دستور`);
    console.log(`   📝 کل: ${statements.length} دستور\n`);
    
    // بررسی نتیجه نهایی
    console.log('🔍 بررسی نتیجه migration...\n');
    
    // بررسی فیلدهای جدید در جدول customers
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'sales_owner', 'last_followup_date', 'next_action_date', 'lead_temperature', 'loss_reason')
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 فیلدهای جدید در جدول customers:');
    columns.forEach(col => {
      console.log(`   • ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
    });
    console.log('');
    
    // بررسی جدول pipeline_stages
    const [stagesCount] = await connection.query(`
      SELECT COUNT(*) as count FROM pipeline_stages WHERE tenant_key = 'rabin'
    `);
    console.log(`📊 تعداد مراحل pipeline: ${stagesCount[0].count} مرحله`);
    
    // بررسی جدول lead_pipeline_history
    const [historyCount] = await connection.query(`
      SELECT COUNT(*) as count FROM lead_pipeline_history WHERE tenant_key = 'rabin'
    `);
    console.log(`📈 تعداد رکوردهای تاریخچه: ${historyCount[0].count} رکورد`);
    
    // بررسی به‌روزرسانی مشتریان موجود
    const [customerStats] = await connection.query(`
      SELECT 
        type,
        current_pipeline_stage,
        lead_temperature,
        COUNT(*) as count
      FROM customers 
      WHERE tenant_key = 'rabin'
      GROUP BY type, current_pipeline_stage, lead_temperature
      ORDER BY type, current_pipeline_stage
    `);
    
    console.log('\n📊 آمار مشتریان به‌روزرسانی شده:');
    customerStats.forEach(stat => {
      console.log(`   • ${stat.type} - ${stat.current_pipeline_stage} - ${stat.lead_temperature}: ${stat.count} مشتری`);
    });
    
    console.log('\n🎯 Migration سیستم پیگیری فروش با موفقیت تکمیل شد!');
    console.log('🚀 حالا می‌توانید از قابلیت‌های Sales Pipeline استفاده کنید.\n');
    
  } catch (error) {
    console.error('❌ خطا در اجرای migration:', error.message);
    console.error('\n📋 جزئیات خطا:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };