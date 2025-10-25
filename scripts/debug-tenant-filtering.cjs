#!/usr/bin/env node

/**
 * دیباگ مشکل tenant filtering
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

async function debugTenantFiltering() {
  let connection;
  
  try {
    console.log('🔍 دیباگ مشکل tenant filtering...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // تست 1: بررسی دقیق داده‌های مشتریان
    console.log('📊 بررسی دقیق مشتریان:');
    
    const [allCustomers] = await connection.query(`
      SELECT tenant_key, COUNT(*) as count, 
             GROUP_CONCAT(name LIMIT 3) as sample_names
      FROM customers 
      GROUP BY tenant_key 
      ORDER BY count DESC
    `);
    
    console.log('   توزیع مشتریان بر اساس tenant:');
    allCustomers.forEach(row => {
      console.log(`   - ${row.tenant_key}: ${row.count} مشتری`);
      console.log(`     نمونه: ${row.sample_names}`);
    });

    // تست 2: شبیه‌سازی دقیق API call
    console.log('\n🌐 شبیه‌سازی API call برای demo:');
    
    const tenantKey = 'demo';
    
    // شبیه‌سازی query API customers
    const [demoCustomersOnly] = await connection.query(
      'SELECT id, name, email, tenant_key FROM customers WHERE tenant_key = ? ORDER BY created_at DESC LIMIT 10',
      [tenantKey]
    );
    
    console.log(`   Query: SELECT * FROM customers WHERE tenant_key = '${tenantKey}'`);
    console.log(`   نتیجه: ${demoCustomersOnly.length} مشتری`);
    
    demoCustomersOnly.forEach(customer => {
      console.log(`     - ${customer.name} (${customer.email}) - tenant: ${customer.tenant_key}`);
    });

    // تست 3: بررسی session و token
    console.log('\n🔐 بررسی نحوه احراز هویت:');
    
    const [demoUser] = await connection.query(
      'SELECT id, name, email, tenant_key, role FROM users WHERE tenant_key = ?',
      [tenantKey]
    );
    
    if (demoUser.length > 0) {
      const user = demoUser[0];
      console.log(`   کاربر demo: ${user.name} (${user.email})`);
      console.log(`   tenant_key: ${user.tenant_key}`);
      console.log(`   role: ${user.role}`);
      console.log(`   user_id: ${user.id}`);
    }

    // تست 4: بررسی API های مختلف
    console.log('\n🧪 تست API های مختلف:');
    
    const apis = [
      {
        name: 'customers',
        query: 'SELECT COUNT(*) as count FROM customers WHERE tenant_key = ?'
      },
      {
        name: 'activities', 
        query: 'SELECT COUNT(*) as count FROM activities WHERE tenant_key = ?'
      },
      {
        name: 'tasks',
        query: 'SELECT COUNT(*) as count FROM tasks WHERE tenant_key = ?'
      },
      {
        name: 'products',
        query: 'SELECT COUNT(*) as count FROM products WHERE tenant_key = ?'
      },
      {
        name: 'users (chat)',
        query: 'SELECT COUNT(*) as count FROM users WHERE tenant_key = ? AND status = "active"'
      }
    ];

    for (const api of apis) {
      const [result] = await connection.query(api.query, [tenantKey]);
      console.log(`   ${api.name}: ${result[0].count} رکورد`);
    }

    // تست 5: بررسی مشکلات احتمالی
    console.log('\n⚠️  بررسی مشکلات احتمالی:');
    
    // بررسی رکوردهای بدون tenant_key
    const [nullTenants] = await connection.query(
      'SELECT COUNT(*) as count FROM customers WHERE tenant_key IS NULL'
    );
    
    if (nullTenants[0].count > 0) {
      console.log(`   ❌ ${nullTenants[0].count} مشتری بدون tenant_key`);
    } else {
      console.log('   ✅ همه مشتریان tenant_key دارند');
    }

    // بررسی case sensitivity
    const [caseTest] = await connection.query(
      'SELECT COUNT(*) as count FROM customers WHERE tenant_key = ? COLLATE utf8mb4_bin',
      [tenantKey]
    );
    console.log(`   Case-sensitive test: ${caseTest[0].count} رکورد`);

    console.log('\n💡 راه‌حل‌های پیشنهادی:');
    console.log('1. بررسی کنید که frontend از URL صحیح استفاده می‌کند');
    console.log('2. بررسی کنید که X-Tenant-Key header درست ارسال می‌شود');
    console.log('3. بررسی کنید که middleware درست کار می‌کند');
    console.log('4. Cache browser را پاک کنید');
    console.log('5. سرور را restart کنید');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugTenantFiltering();