import mysql from 'mysql2/promise';

// تنظیمات اتصال به دیتابیس
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crm_system'
};

async function fixTenantData() {
  let connection;
  
  try {
    console.log('🔌 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ اتصال برقرار شد\n');

    // لیست جداول با tenant_key
    const tables = [
      'activities',
      'calendar_events',
      'chat_conversations',
      'chat_messages',
      'chat_participants',
      'contacts',
      'customers',
      'daily_reports',
      'deals',
      'deal_products',
      'documents',
      'feedback',
      'interactions',
      'notifications',
      'products',
      'sales',
      'sale_items',
      'tasks',
      'task_assignees',
      'tickets',
      'users'
    ];

    console.log('📊 بررسی وضعیت tenant_key در جداول:\n');

    for (const table of tables) {
      try {
        // بررسی وجود جدول
        const [tableExists] = await connection.query(
          `SHOW TABLES LIKE '${table}'`
        );

        if (tableExists.length === 0) {
          console.log(`⚠️  جدول ${table} وجود ندارد`);
          continue;
        }

        // بررسی وجود ستون tenant_key
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE 'tenant_key'`
        );

        if (columns.length === 0) {
          console.log(`⚠️  جدول ${table} ستون tenant_key ندارد`);
          continue;
        }

        // شمارش رکوردها بر اساس tenant_key
        const [counts] = await connection.query(
          `SELECT tenant_key, COUNT(*) as count FROM ${table} GROUP BY tenant_key`
        );

        if (counts.length > 0) {
          console.log(`📋 جدول ${table}:`);
          counts.forEach(row => {
            console.log(`   - ${row.tenant_key || 'NULL'}: ${row.count} رکورد`);
          });
        } else {
          console.log(`📋 جدول ${table}: خالی`);
        }

        // اصلاح رکوردهای NULL یا خالی
        const [updateResult] = await connection.query(
          `UPDATE ${table} SET tenant_key = 'rabin' WHERE tenant_key IS NULL OR tenant_key = ''`
        );

        if (updateResult.affectedRows > 0) {
          console.log(`   ✅ ${updateResult.affectedRows} رکورد به 'rabin' تغییر یافت`);
        }

        console.log('');

      } catch (error) {
        console.error(`❌ خطا در پردازش جدول ${table}:`, error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ اصلاح داده‌ها کامل شد!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // نمایش خلاصه نهایی
    console.log('📊 خلاصه نهایی:\n');
    
    for (const table of ['customers', 'tasks', 'activities', 'deals']) {
      try {
        const [tableExists] = await connection.query(
          `SHOW TABLES LIKE '${table}'`
        );

        if (tableExists.length === 0) continue;

        const [columns] = await connection.query(
          `SHOW COLUMNS FROM ${table} LIKE 'tenant_key'`
        );

        if (columns.length === 0) continue;

        const [finalCounts] = await connection.query(
          `SELECT tenant_key, COUNT(*) as count FROM ${table} GROUP BY tenant_key`
        );

        if (finalCounts.length > 0) {
          console.log(`${table}:`);
          finalCounts.forEach(row => {
            console.log(`   ${row.tenant_key}: ${row.count} رکورد`);
          });
        }
      } catch (error) {
        // Skip errors
      }
    }

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال به دیتابیس بسته شد');
    }
  }
}

// اجرای اسکریپت
fixTenantData();
