#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  let connection;
  
  try {
    console.log('🚀 اجرای migration سیستم پیگیری فروش...\n');
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // اجرای دستورات migration یکی یکی
    console.log('📝 اجرای دستورات migration...\n');
    
    // 1. افزودن فیلد type
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN type ENUM('lead', 'customer') DEFAULT 'lead' 
        COMMENT 'Customer type: lead (prospect) or customer (converted)' 
        AFTER lifecycle_stage
      `);
      console.log('✅ فیلد type اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد type قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 2. افزودن فیلد current_pipeline_stage
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN current_pipeline_stage VARCHAR(50) DEFAULT 'new_lead' 
        COMMENT 'Current stage in the sales pipeline' 
        AFTER type
      `);
      console.log('✅ فیلد current_pipeline_stage اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد current_pipeline_stage قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 3. افزودن فیلد deal_value
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN deal_value DECIMAL(15,2) DEFAULT NULL 
        COMMENT 'Potential deal value for this lead' 
        AFTER potential_value
      `);
      console.log('✅ فیلد deal_value اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد deal_value قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 4. افزودن فیلد success_probability
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN success_probability INT DEFAULT 50 
        COMMENT 'Success probability percentage (0-100)' 
        AFTER deal_value
      `);
      console.log('✅ فیلد success_probability اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد success_probability قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 5. افزودن فیلد sales_owner
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN sales_owner VARCHAR(36) DEFAULT NULL 
        COMMENT 'Assigned sales person for this lead' 
        AFTER assigned_to
      `);
      console.log('✅ فیلد sales_owner اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد sales_owner قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 6. افزودن فیلد last_followup_date
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN last_followup_date TIMESTAMP NULL DEFAULT NULL 
        COMMENT 'Date of last follow-up contact' 
        AFTER last_interaction
      `);
      console.log('✅ فیلد last_followup_date اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد last_followup_date قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 7. افزودن فیلد next_action_date
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN next_action_date TIMESTAMP NULL DEFAULT NULL 
        COMMENT 'Scheduled date for next action' 
        AFTER last_followup_date
      `);
      console.log('✅ فیلد next_action_date اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد next_action_date قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 8. افزودن فیلد lead_temperature
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN lead_temperature ENUM('hot', 'warm', 'cold') DEFAULT 'warm' 
        COMMENT 'Lead temperature based on interaction and probability' 
        AFTER lead_score
      `);
      console.log('✅ فیلد lead_temperature اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد lead_temperature قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 9. افزودن فیلد loss_reason
    try {
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN loss_reason TEXT NULL 
        COMMENT 'Reason for losing the lead (required for closed_lost)' 
        AFTER lead_temperature
      `);
      console.log('✅ فیلد loss_reason اضافه شد');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  فیلد loss_reason قبلاً وجود دارد');
      } else {
        throw error;
      }
    }
    
    // 10. ایجاد جدول pipeline_stages
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS pipeline_stages (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          tenant_key VARCHAR(50) DEFAULT 'rabin',
          name VARCHAR(100) NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          stage_order INT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_stage_tenant (name, tenant_key),
          KEY idx_pipeline_stages_tenant (tenant_key),
          KEY idx_pipeline_stages_order (stage_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ جدول pipeline_stages ایجاد شد');
    } catch (error) {
      console.log('⚠️  جدول pipeline_stages قبلاً وجود دارد');
    }
    
    // 11. درج مراحل پیش‌فرض
    try {
      await connection.execute(`
        INSERT IGNORE INTO pipeline_stages (name, display_name, stage_order, tenant_key) VALUES
        ('new_lead', 'سرنخ جدید', 1, 'rabin'),
        ('contacted', 'تماس اولیه', 2, 'rabin'),
        ('needs_analysis', 'نیازسنجی', 3, 'rabin'),
        ('proposal_sent', 'ارسال پیشنهاد', 4, 'rabin'),
        ('negotiation', 'مذاکره', 5, 'rabin'),
        ('closed_won', 'برنده شده', 6, 'rabin'),
        ('closed_lost', 'از دست رفته', 7, 'rabin')
      `);
      console.log('✅ مراحل پیش‌فرض درج شدند');
    } catch (error) {
      console.log('⚠️  مراحل پیش‌فرض قبلاً درج شده‌اند');
    }
    
    // 12. ایجاد جدول lead_pipeline_history
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS lead_pipeline_history (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          tenant_key VARCHAR(50) DEFAULT 'rabin',
          customer_id VARCHAR(36) NOT NULL,
          from_stage VARCHAR(50),
          to_stage VARCHAR(50) NOT NULL,
          changed_by VARCHAR(36) NOT NULL,
          change_reason TEXT,
          changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          KEY idx_pipeline_history_customer (customer_id),
          KEY idx_pipeline_history_tenant (tenant_key),
          KEY idx_pipeline_history_date (changed_at),
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ جدول lead_pipeline_history ایجاد شد');
    } catch (error) {
      console.log('⚠️  جدول lead_pipeline_history قبلاً وجود دارد');
    }
    
    // 13. افزودن ایندکس‌ها
    const indexes = [
      { name: 'idx_customers_pipeline_stage', sql: 'CREATE INDEX idx_customers_pipeline_stage ON customers (current_pipeline_stage)' },
      { name: 'idx_customers_type', sql: 'CREATE INDEX idx_customers_type ON customers (type)' },
      { name: 'idx_customers_temperature', sql: 'CREATE INDEX idx_customers_temperature ON customers (lead_temperature)' },
      { name: 'idx_customers_sales_owner', sql: 'CREATE INDEX idx_customers_sales_owner ON customers (sales_owner)' },
      { name: 'idx_customers_followup_date', sql: 'CREATE INDEX idx_customers_followup_date ON customers (last_followup_date)' },
      { name: 'idx_customers_next_action', sql: 'CREATE INDEX idx_customers_next_action ON customers (next_action_date)' },
      { name: 'idx_customers_pipeline_composite', sql: 'CREATE INDEX idx_customers_pipeline_composite ON customers (tenant_key, type, current_pipeline_stage)' }
    ];
    
    for (const index of indexes) {
      try {
        await connection.execute(index.sql);
        console.log(`✅ ایندکس ${index.name} اضافه شد`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  ایندکس ${index.name} قبلاً وجود دارد`);
        } else {
          console.log(`❌ خطا در ایجاد ایندکس ${index.name}: ${error.message}`);
        }
      }
    }
    
    // 14. به‌روزرسانی رکوردهای موجود
    console.log('\n📊 به‌روزرسانی رکوردهای موجود...');
    
    // تنظیم type به lead برای همه مشتریان
    const [updateResult1] = await connection.execute(`
      UPDATE customers 
      SET type = 'lead' 
      WHERE type IS NULL
    `);
    console.log(`✅ ${updateResult1.affectedRows} مشتری به نوع 'lead' تنظیم شد`);
    
    // تنظیم مرحله پیش‌فرض
    const [updateResult2] = await connection.execute(`
      UPDATE customers 
      SET current_pipeline_stage = 'new_lead' 
      WHERE current_pipeline_stage IS NULL
    `);
    console.log(`✅ ${updateResult2.affectedRows} مشتری به مرحله 'new_lead' تنظیم شد`);
    
    // تنظیم احتمال موفقیت پیش‌فرض
    const [updateResult3] = await connection.execute(`
      UPDATE customers 
      SET success_probability = 50 
      WHERE success_probability IS NULL
    `);
    console.log(`✅ ${updateResult3.affectedRows} مشتری احتمال موفقیت 50% تنظیم شد`);
    
    // تنظیم دمای سرنخ پیش‌فرض
    const [updateResult4] = await connection.execute(`
      UPDATE customers 
      SET lead_temperature = 'warm' 
      WHERE lead_temperature IS NULL
    `);
    console.log(`✅ ${updateResult4.affectedRows} مشتری دمای 'warm' تنظیم شد`);
    
    // ایجاد رکوردهای تاریخچه اولیه
    const [historyResult] = await connection.execute(`
      INSERT INTO lead_pipeline_history (customer_id, from_stage, to_stage, changed_by, change_reason, tenant_key)
      SELECT 
          id,
          NULL,
          'new_lead',
          'system',
          'Initial pipeline setup - migrated existing customer',
          tenant_key
      FROM customers 
      WHERE id NOT IN (SELECT DISTINCT customer_id FROM lead_pipeline_history WHERE customer_id IS NOT NULL)
    `);
    console.log(`✅ ${historyResult.affectedRows} رکورد تاریخچه اولیه ایجاد شد`);
    
    // 15. بررسی نتیجه
    console.log('\n🔍 بررسی نتیجه migration...\n');
    
    // شمارش مراحل pipeline
    const [stagesCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM pipeline_stages WHERE tenant_key = 'rabin'
    `);
    console.log(`📊 تعداد مراحل pipeline: ${stagesCount[0].count} مرحله`);
    
    // شمارش رکوردهای تاریخچه
    const [historyCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM lead_pipeline_history WHERE tenant_key = 'rabin'
    `);
    console.log(`📈 تعداد رکوردهای تاریخچه: ${historyCount[0].count} رکورد`);
    
    // آمار مشتریان
    const [customerStats] = await connection.execute(`
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
    
    console.log('\n🎉 Migration سیستم پیگیری فروش با موفقیت تکمیل شد!');
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
  executeMigration().catch(console.error);
}

module.exports = { executeMigration };