#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function checkPipelineTables() {
  let connection;
  
  try {
    console.log('🔍 بررسی جداول pipeline...\n');
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // بررسی وجود جدول pipeline_stages
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'pipeline_stages'
    `);
    
    if (tables.length === 0) {
      console.log('❌ جدول pipeline_stages وجود ندارد');
      
      // ایجاد جدول
      await connection.execute(`
        CREATE TABLE pipeline_stages (
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
      
      // درج مراحل پیش‌فرض
      await connection.execute(`
        INSERT INTO pipeline_stages (name, display_name, stage_order, tenant_key) VALUES
        ('new_lead', 'سرنخ جدید', 1, 'rabin'),
        ('contacted', 'تماس اولیه', 2, 'rabin'),
        ('needs_analysis', 'نیازسنجی', 3, 'rabin'),
        ('proposal_sent', 'ارسال پیشنهاد', 4, 'rabin'),
        ('negotiation', 'مذاکره', 5, 'rabin'),
        ('closed_won', 'برنده شده', 6, 'rabin'),
        ('closed_lost', 'از دست رفته', 7, 'rabin')
      `);
      console.log('✅ مراحل پیش‌فرض درج شدند');
      
    } else {
      console.log('✅ جدول pipeline_stages وجود دارد');
      
      // بررسی ساختار جدول
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'crm_system' 
        AND TABLE_NAME = 'pipeline_stages'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('📋 ساختار جدول pipeline_stages:');
      columns.forEach(col => {
        console.log(`   • ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
      });
    }
    
    // بررسی داده‌های موجود
    const [stageCount] = await connection.query(`
      SELECT COUNT(*) as count FROM pipeline_stages WHERE tenant_key = 'rabin'
    `);
    console.log(`\n📊 تعداد مراحل موجود: ${stageCount[0].count} مرحله`);
    
    if (stageCount[0].count > 0) {
      const [stages] = await connection.query(`
        SELECT name, display_name, stage_order 
        FROM pipeline_stages 
        WHERE tenant_key = 'rabin' 
        ORDER BY stage_order
      `);
      
      console.log('📋 مراحل موجود:');
      stages.forEach(stage => {
        console.log(`   ${stage.stage_order}. ${stage.name} - ${stage.display_name}`);
      });
    }
    
    console.log('\n🎉 بررسی جداول pipeline تکمیل شد!');
    
  } catch (error) {
    console.error('❌ خطا در بررسی جداول:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای بررسی
if (require.main === module) {
  checkPipelineTables().catch(console.error);
}

module.exports = { checkPipelineTables };