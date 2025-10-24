#!/usr/bin/env node

/**
 * اضافه کردن tenant filtering به APIهای مهم
 */

const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'crm_system'
};

async function fixTenantFiltering() {
  let connection;
  
  try {
    console.log('🔧 بررسی و اصلاح tenant filtering...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // بررسی جداول مهم و tenant_key
    const tablesToCheck = [
      'customers', 'activities', 'tasks', 'deals', 'contacts', 
      'tickets', 'feedback', 'sales', 'products', 'documents'
    ];

    console.log('📋 بررسی جداول برای tenant_key:');
    
    for (const table of tablesToCheck) {
      try {
        const [columns] = await connection.query(`DESCRIBE ${table}`);
        const hasTenantKey = columns.some(col => col.Field === 'tenant_key');
        
        console.log(`   ${table}: ${hasTenantKey ? '✅' : '❌'}`);
        
        if (hasTenantKey) {
          // بررسی داده‌های موجود
          const [data] = await connection.query(`
            SELECT tenant_key, COUNT(*) as count 
            FROM ${table} 
            GROUP BY tenant_key 
            ORDER BY count DESC
          `);
          
          console.log(`     داده‌ها:`);
          data.forEach(row => {
            console.log(`       - ${row.tenant_key || 'NULL'}: ${row.count} رکورد`);
          });
        }
      } catch (error) {
        console.log(`   ${table}: ❌ جدول وجود ندارد`);
      }
    }

    // بررسی داده‌های tenant demo
    console.log('\n🔍 بررسی داده‌های tenant demo:');
    
    const demoTables = ['customers', 'activities', 'tasks'];
    
    for (const table of demoTables) {
      try {
        const [demoData] = await connection.query(`
          SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'demo'
        `);
        console.log(`   ${table}: ${demoData[0].count} رکورد`);
        
        if (demoData[0].count === 0) {
          console.log(`     ⚠️  هیچ داده‌ای برای tenant demo وجود ندارد`);
        }
      } catch (error) {
        console.log(`   ${table}: ❌ خطا در بررسی`);
      }
    }

    // اضافه کردن داده‌های تستی برای demo
    console.log('\n📝 اضافه کردن داده‌های تستی برای demo...');
    
    // مشتری تستی
    try {
      await connection.query(`
        INSERT INTO customers (id, name, email, phone, status, tenant_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, ['demo-customer-1', 'شرکت دمو تجارت', 'info@demo-company.com', '02133445566', 'active', 'demo']);
      
      await connection.query(`
        INSERT INTO customers (id, name, email, phone, status, tenant_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, ['demo-customer-2', 'مشتری دمو دوم', 'customer2@demo.com', '09123456789', 'prospect', 'demo']);
      
      console.log('   ✅ مشتریان تستی اضافه شد');
    } catch (error) {
      console.log(`   ❌ خطا در اضافه کردن مشتریان: ${error.message}`);
    }

    // فعالیت‌های تستی
    try {
      const [demoUsers] = await connection.query('SELECT id FROM users WHERE tenant_key = "demo" LIMIT 1');
      
      if (demoUsers.length > 0) {
        const demoUserId = demoUsers[0].id;
        
        await connection.query(`
          INSERT INTO activities (id, type, title, description, user_id, customer_id, tenant_key, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE title = VALUES(title)
        `, ['demo-activity-1', 'call', 'تماس با شرکت دمو', 'بررسی نیازهای مشتری و ارائه پیشنهاد', demoUserId, 'demo-customer-1', 'demo']);
        
        await connection.query(`
          INSERT INTO activities (id, type, title, description, user_id, customer_id, tenant_key, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE title = VALUES(title)
        `, ['demo-activity-2', 'meeting', 'جلسه با مشتری دوم', 'جلسه حضوری برای بررسی قرارداد', demoUserId, 'demo-customer-2', 'demo']);
        
        console.log('   ✅ فعالیت‌های تستی اضافه شد');
      }
    } catch (error) {
      console.log(`   ❌ خطا در اضافه کردن فعالیت‌ها: ${error.message}`);
    }

    // وظایف تستی
    try {
      const [demoUsers] = await connection.query('SELECT id FROM users WHERE tenant_key = "demo" LIMIT 1');
      
      if (demoUsers.length > 0) {
        const demoUserId = demoUsers[0].id;
        
        await connection.query(`
          INSERT INTO tasks (id, title, description, assigned_to, status, priority, tenant_key, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE title = VALUES(title)
        `, ['demo-task-1', 'پیگیری مشتری دمو', 'پیگیری وضعیت قرارداد و دریافت بازخورد', demoUserId, 'pending', 'high', 'demo']);
        
        await connection.query(`
          INSERT INTO tasks (id, title, description, assigned_to, status, priority, tenant_key, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE title = VALUES(title)
        `, ['demo-task-2', 'آماده‌سازی پروپوزال', 'تهیه پیشنهاد قیمت برای مشتری جدید', demoUserId, 'in_progress', 'medium', 'demo']);
        
        console.log('   ✅ وظایف تستی اضافه شد');
      }
    } catch (error) {
      console.log(`   ❌ خطا در اضافه کردن وظایف: ${error.message}`);
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی داده‌های demo:');
    
    const finalTables = ['customers', 'activities', 'tasks'];
    
    for (const table of finalTables) {
      try {
        const [count] = await connection.query(`
          SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'demo'
        `);
        console.log(`   ${table}: ${count[0].count} رکورد`);
      } catch (error) {
        console.log(`   ${table}: ❌ خطا`);
      }
    }

    console.log('\n✨ تنظیمات tenant filtering انجام شد!');
    console.log('🔄 حالا باید APIها رو هم اصلاح کنیم تا tenant_key رو چک کنن');
    console.log('🌐 لینک تست: http://localhost:3000/demo/dashboard');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixTenantFiltering();