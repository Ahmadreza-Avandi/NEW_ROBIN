#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixPipelineStagesTable() {
  let connection;
  
  try {
    console.log('🔧 اصلاح جدول pipeline_stages...\n');
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // بررسی ساختار فعلی
    const [currentColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'pipeline_stages'
    `);
    
    console.log('📋 ساختار فعلی جدول:');
    currentColumns.forEach(col => {
      console.log(`   • ${col.COLUMN_NAME}`);
    });
    console.log('');
    
    // افزودن فیلدهای مورد نیاز
    const fieldsToAdd = [
      { name: 'tenant_key', sql: "ADD COLUMN tenant_key VARCHAR(50) DEFAULT 'rabin'" },
      { name: 'display_name', sql: "ADD COLUMN display_name VARCHAR(100) NOT NULL DEFAULT ''" }
    ];
    
    for (const field of fieldsToAdd) {
      try {
        await connection.execute(`ALTER TABLE pipeline_stages ${field.sql}`);
        console.log(`✅ فیلد ${field.name} اضافه شد`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  فیلد ${field.name} قبلاً وجود دارد`);
        } else {
          console.log(`❌ خطا در افزودن فیلد ${field.name}: ${error.message}`);
        }
      }
    }
    
    // بررسی داده‌های موجود
    const [existingStages] = await connection.query(`
      SELECT COUNT(*) as count FROM pipeline_stages
    `);
    
    console.log(`\n📊 تعداد مراحل موجود: ${existingStages[0].count} مرحله`);
    
    if (existingStages[0].count === 0) {
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
      // به‌روزرسانی مراحل موجود
      const updates = [
        { name: 'new_lead', display_name: 'سرنخ جدید', order: 1 },
        { name: 'contacted', display_name: 'تماس اولیه', order: 2 },
        { name: 'needs_analysis', display_name: 'نیازسنجی', order: 3 },
        { name: 'proposal_sent', display_name: 'ارسال پیشنهاد', order: 4 },
        { name: 'negotiation', display_name: 'مذاکره', order: 5 },
        { name: 'closed_won', display_name: 'برنده شده', order: 6 },
        { name: 'closed_lost', display_name: 'از دست رفته', order: 7 }
      ];
      
      for (const update of updates) {
        await connection.execute(`
          INSERT INTO pipeline_stages (name, display_name, stage_order, tenant_key) 
          VALUES (?, ?, ?, 'rabin')
          ON DUPLICATE KEY UPDATE 
          display_name = VALUES(display_name),
          stage_order = VALUES(stage_order),
          tenant_key = VALUES(tenant_key)
        `, [update.name, update.display_name, update.order]);
      }
      console.log('✅ مراحل موجود به‌روزرسانی شدند');
    }
    
    // بررسی نتیجه نهایی
    const [finalStages] = await connection.query(`
      SELECT name, display_name, stage_order 
      FROM pipeline_stages 
      WHERE tenant_key = 'rabin' 
      ORDER BY stage_order
    `);
    
    console.log('\n📋 مراحل نهایی:');
    finalStages.forEach(stage => {
      console.log(`   ${stage.stage_order}. ${stage.name} - ${stage.display_name}`);
    });
    
    console.log('\n🎉 جدول pipeline_stages با موفقیت اصلاح شد!');
    
  } catch (error) {
    console.error('❌ خطا در اصلاح جدول:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای اصلاح
if (require.main === module) {
  fixPipelineStagesTable().catch(console.error);
}

module.exports = { fixPipelineStagesTable };