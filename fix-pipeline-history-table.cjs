#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixPipelineHistoryTable() {
  let connection;
  
  try {
    console.log('🔧 اصلاح جدول lead_pipeline_history...\n');
    
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    console.log('✅ اتصال به دیتابیس برقرار شد\n');
    
    // حذف جدول اگر وجود دارد
    await connection.execute('DROP TABLE IF EXISTS lead_pipeline_history');
    console.log('🗑️  جدول قدیمی حذف شد');
    
    // ایجاد مجدد جدول
    await connection.execute(`
      CREATE TABLE lead_pipeline_history (
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
        KEY idx_pipeline_history_date (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ جدول lead_pipeline_history ایجاد شد');
    
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
      WHERE tenant_key = 'rabin'
    `);
    console.log(`✅ ${historyResult.affectedRows} رکورد تاریخچه اولیه ایجاد شد`);
    
    // بررسی نتیجه
    const [historyCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM lead_pipeline_history WHERE tenant_key = 'rabin'
    `);
    console.log(`📈 تعداد رکوردهای تاریخچه: ${historyCount[0].count} رکورد`);
    
    console.log('\n🎉 جدول lead_pipeline_history با موفقیت اصلاح شد!');
    
  } catch (error) {
    console.error('❌ خطا در اصلاح جدول:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای اصلاح
if (require.main === module) {
  fixPipelineHistoryTable().catch(console.error);
}

module.exports = { fixPipelineHistoryTable };