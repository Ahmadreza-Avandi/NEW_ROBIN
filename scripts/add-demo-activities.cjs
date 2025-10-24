#!/usr/bin/env node

/**
 * اضافه کردن فعالیت‌های تستی برای demo
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

async function addDemoActivities() {
  let connection;
  
  try {
    console.log('📋 اضافه کردن فعالیت‌های تستی برای demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // بررسی ساختار جدول activities
    console.log('🔍 بررسی ساختار جدول activities:');
    const [columns] = await connection.query('DESCRIBE activities');
    
    console.log('   ستون‌های موجود:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // پیدا کردن کاربر demo
    const [demoUsers] = await connection.query('SELECT id, name FROM users WHERE tenant_key = "demo"');
    
    if (demoUsers.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = demoUsers[0];
    console.log(`\n✅ کاربر demo: ${demoUser.name} (${demoUser.id})`);

    // پیدا کردن مشتریان demo
    const [demoCustomers] = await connection.query('SELECT id, name FROM customers WHERE tenant_key = "demo"');
    console.log(`\n📋 مشتریان demo: ${demoCustomers.length} مشتری`);

    // اضافه کردن فعالیت‌های تستی
    const activities = [
      {
        id: 'demo-activity-1',
        type: 'call',
        title: 'تماس با شرکت دمو تجارت',
        description: 'بررسی نیازهای مشتری و ارائه پیشنهاد اولیه برای همکاری',
        customer_id: demoCustomers[0]?.id || null
      },
      {
        id: 'demo-activity-2',
        type: 'meeting',
        title: 'جلسه حضوری با مدیرعامل',
        description: 'جلسه رسمی برای بررسی جزئیات قرارداد و شرایط همکاری',
        customer_id: demoCustomers[1]?.id || null
      },
      {
        id: 'demo-activity-3',
        type: 'email',
        title: 'ارسال پیشنهاد قیمت',
        description: 'ارسال پروپوزال کامل شامل قیمت‌ها و شرایط پرداخت',
        customer_id: demoCustomers[0]?.id || null
      },
      {
        id: 'demo-activity-4',
        type: 'follow_up',
        title: 'پیگیری پاسخ مشتری',
        description: 'پیگیری وضعیت بررسی پیشنهاد و دریافت بازخورد',
        customer_id: demoCustomers[1]?.id || null
      }
    ];

    console.log('\n📝 اضافه کردن فعالیت‌ها:');
    
    for (const activity of activities) {
      try {
        await connection.query(`
          INSERT INTO activities (
            id, type, title, description, 
            performed_by, customer_id, tenant_key, 
            start_time, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          description = VALUES(description)
        `, [
          activity.id,
          activity.type,
          activity.title,
          activity.description,
          demoUser.id,
          activity.customer_id,
          'demo'
        ]);
        
        console.log(`   ✅ ${activity.title}`);
      } catch (error) {
        console.log(`   ❌ خطا در ${activity.title}: ${error.message}`);
      }
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی:');
    const [finalActivities] = await connection.query(`
      SELECT 
        a.title,
        a.type,
        a.created_at,
        c.name as customer_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE a.tenant_key = 'demo'
      ORDER BY a.created_at DESC
    `);

    console.log(`   ✅ کل فعالیت‌ها: ${finalActivities.length}`);
    finalActivities.forEach(activity => {
      console.log(`   - ${activity.title} (${activity.type}) - مشتری: ${activity.customer_name || 'نامشخص'}`);
    });

    console.log('\n✨ فعالیت‌های تستی با موفقیت اضافه شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDemoActivities();