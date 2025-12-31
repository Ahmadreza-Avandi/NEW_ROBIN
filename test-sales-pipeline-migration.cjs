#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testSalesPipelineMigration() {
  let connection;
  
  try {
    console.log('🧪 تست کامل migration سیستم پیگیری فروش...\n');
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // 1. بررسی فیلدهای جدید در جدول customers
    console.log('📋 بررسی فیلدهای جدید در جدول customers:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'sales_owner', 'last_followup_date', 'next_action_date', 'lead_temperature', 'loss_reason')
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
    });
    console.log(`   📊 کل فیلدهای جدید: ${columns.length} فیلد\n`);
    
    // 2. بررسی جدول pipeline_stages
    console.log('📊 بررسی جدول pipeline_stages:');
    const [stages] = await connection.query(`
      SELECT name, display_name, stage_order 
      FROM pipeline_stages 
      WHERE tenant_key = 'rabin' 
      ORDER BY stage_order
    `);
    
    stages.forEach(stage => {
      console.log(`   ${stage.stage_order}. ${stage.name} - ${stage.display_name}`);
    });
    console.log(`   📊 کل مراحل: ${stages.length} مرحله\n`);
    
    // 3. بررسی جدول lead_pipeline_history
    console.log('📈 بررسی جدول lead_pipeline_history:');
    const [historyCount] = await connection.query(`
      SELECT COUNT(*) as count FROM lead_pipeline_history WHERE tenant_key = 'rabin'
    `);
    console.log(`   📊 تعداد رکوردهای تاریخچه: ${historyCount[0].count} رکورد`);
    
    // نمایش چند رکورد نمونه
    const [historySample] = await connection.query(`
      SELECT h.customer_id, c.name, h.to_stage, h.changed_by, h.changed_at
      FROM lead_pipeline_history h
      JOIN customers c ON h.customer_id = c.id
      WHERE h.tenant_key = 'rabin'
      ORDER BY h.changed_at DESC
      LIMIT 3
    `);
    
    historySample.forEach(record => {
      console.log(`   • ${record.name} → ${record.to_stage} (${record.changed_by}) - ${record.changed_at}`);
    });
    console.log('');
    
    // 4. بررسی آمار مشتریان
    console.log('👥 آمار مشتریان به‌روزرسانی شده:');
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
    
    customerStats.forEach(stat => {
      console.log(`   • ${stat.type} - ${stat.current_pipeline_stage} - ${stat.lead_temperature}: ${stat.count} مشتری`);
    });
    console.log('');
    
    // 5. بررسی ایندکس‌ها
    console.log('🔍 بررسی ایندکس‌های جدید:');
    const [indexes] = await connection.query(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'customers'
      AND INDEX_NAME LIKE '%pipeline%' OR INDEX_NAME LIKE '%type%' OR INDEX_NAME LIKE '%temperature%'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);
    
    const indexGroups = {};
    indexes.forEach(idx => {
      if (!indexGroups[idx.INDEX_NAME]) {
        indexGroups[idx.INDEX_NAME] = [];
      }
      indexGroups[idx.INDEX_NAME].push(idx.COLUMN_NAME);
    });
    
    Object.keys(indexGroups).forEach(indexName => {
      console.log(`   ✅ ${indexName}: ${indexGroups[indexName].join(', ')}`);
    });
    console.log('');
    
    // 6. تست عملکرد - ایجاد یک سرنخ نمونه
    console.log('🧪 تست عملکرد - ایجاد سرنخ نمونه:');
    
    const testLeadId = 'test-lead-' + Date.now();
    await connection.execute(`
      INSERT INTO customers (
        id, name, email, phone, company_name, 
        type, current_pipeline_stage, deal_value, success_probability, 
        lead_temperature, tenant_key
      ) VALUES (
        ?, 'مشتری تست پایپ‌لاین', 'test@pipeline.com', '09123456789', 'شرکت تست',
        'lead', 'new_lead', 1000000, 75,
        'hot', 'rabin'
      )
    `, [testLeadId]);
    
    console.log('   ✅ سرنخ نمونه ایجاد شد');
    
    // ثبت تغییر مرحله
    await connection.execute(`
      INSERT INTO lead_pipeline_history (
        customer_id, from_stage, to_stage, changed_by, change_reason, tenant_key
      ) VALUES (
        ?, 'new_lead', 'contacted', 'test-user', 'تست تغییر مرحله', 'rabin'
      )
    `, [testLeadId]);
    
    // به‌روزرسانی مرحله مشتری
    await connection.execute(`
      UPDATE customers 
      SET current_pipeline_stage = 'contacted' 
      WHERE id = ?
    `, [testLeadId]);
    
    console.log('   ✅ تغییر مرحله ثبت شد');
    
    // بررسی نتیجه
    const [testResult] = await connection.query(`
      SELECT c.name, c.current_pipeline_stage, c.deal_value, c.success_probability, c.lead_temperature,
             h.from_stage, h.to_stage, h.changed_by, h.change_reason
      FROM customers c
      LEFT JOIN lead_pipeline_history h ON c.id = h.customer_id
      WHERE c.id = ?
      ORDER BY h.changed_at DESC
      LIMIT 1
    `, [testLeadId]);
    
    if (testResult.length > 0) {
      const result = testResult[0];
      console.log(`   📊 نتیجه تست:`);
      console.log(`      نام: ${result.name}`);
      console.log(`      مرحله فعلی: ${result.current_pipeline_stage}`);
      console.log(`      مبلغ معامله: ${result.deal_value?.toLocaleString()} تومان`);
      console.log(`      احتمال موفقیت: ${result.success_probability}%`);
      console.log(`      دمای سرنخ: ${result.lead_temperature}`);
      console.log(`      آخرین تغییر: ${result.from_stage} → ${result.to_stage} (${result.changed_by})`);
    }
    
    // حذف داده تست
    await connection.execute('DELETE FROM lead_pipeline_history WHERE customer_id = ?', [testLeadId]);
    await connection.execute('DELETE FROM customers WHERE id = ?', [testLeadId]);
    console.log('   🗑️  داده‌های تست حذف شدند');
    
    console.log('\n🎉 تست migration با موفقیت تکمیل شد!');
    console.log('✅ همه قابلیت‌های Sales Pipeline آماده استفاده هستند.\n');
    
    // خلاصه نهایی
    console.log('📋 خلاصه Migration:');
    console.log(`   • ${columns.length} فیلد جدید به جدول customers اضافه شد`);
    console.log(`   • ${stages.length} مرحله pipeline تعریف شد`);
    console.log(`   • ${historyCount[0].count} رکورد تاریخچه اولیه ایجاد شد`);
    console.log(`   • ${Object.keys(indexGroups).length} ایندکس جدید اضافه شد`);
    console.log('   • تست عملکرد با موفقیت انجام شد');
    
  } catch (error) {
    console.error('❌ خطا در تست migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای تست
if (require.main === module) {
  testSalesPipelineMigration().catch(console.error);
}

module.exports = { testSalesPipelineMigration };