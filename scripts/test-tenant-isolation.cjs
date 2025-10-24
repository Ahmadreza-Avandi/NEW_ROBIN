#!/usr/bin/env node

/**
 * تست جداسازی tenant ها
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

async function testTenantIsolation() {
  let connection;
  
  try {
    console.log('🧪 تست جداسازی tenant ها...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // بررسی داده‌های هر tenant
    const tenants = ['rabin', 'demo', 'samin', 'testcompany'];
    
    for (const tenant of tenants) {
      console.log(`📊 Tenant: ${tenant}`);
      
      // کاربران
      const [users] = await connection.query(
        'SELECT COUNT(*) as count FROM users WHERE tenant_key = ?',
        [tenant]
      );
      console.log(`   👤 کاربران: ${users[0].count}`);
      
      // مشتریان
      const [customers] = await connection.query(
        'SELECT COUNT(*) as count FROM customers WHERE tenant_key = ?',
        [tenant]
      );
      console.log(`   🏪 مشتریان: ${customers[0].count}`);
      
      // فعالیت‌ها
      const [activities] = await connection.query(
        'SELECT COUNT(*) as count FROM activities WHERE tenant_key = ?',
        [tenant]
      );
      console.log(`   📋 فعالیت‌ها: ${activities[0].count}`);
      
      // وظایف
      const [tasks] = await connection.query(
        'SELECT COUNT(*) as count FROM tasks WHERE tenant_key = ?',
        [tenant]
      );
      console.log(`   ✅ وظایف: ${tasks[0].count}`);
      
      // محصولات
      const [products] = await connection.query(
        'SELECT COUNT(*) as count FROM products WHERE tenant_key = ?',
        [tenant]
      );
      console.log(`   📦 محصولات: ${products[0].count}`);
      
      console.log('');
    }

    // بررسی cross-tenant contamination
    console.log('🔍 بررسی آلودگی cross-tenant:');
    
    const tables = ['users', 'customers', 'activities', 'tasks', 'products'];
    
    for (const table of tables) {
      const [nullTenant] = await connection.query(
        `SELECT COUNT(*) as count FROM ${table} WHERE tenant_key IS NULL`
      );
      
      if (nullTenant[0].count > 0) {
        console.log(`   ⚠️  ${table}: ${nullTenant[0].count} رکورد بدون tenant_key`);
      } else {
        console.log(`   ✅ ${table}: همه رکوردها tenant_key دارند`);
      }
    }

    // نمونه query برای تست
    console.log('\n🧪 تست query های tenant-aware:');
    
    // تست برای demo
    const [demoCustomers] = await connection.query(`
      SELECT c.name, c.email, c.tenant_key
      FROM customers c
      WHERE c.tenant_key = 'demo'
      LIMIT 3
    `);
    
    console.log('   📋 مشتریان demo:');
    demoCustomers.forEach(customer => {
      console.log(`     - ${customer.name} (${customer.email}) - tenant: ${customer.tenant_key}`);
    });

    // تست فعالیت‌های demo
    const [demoActivities] = await connection.query(`
      SELECT 
        a.title,
        a.type,
        a.tenant_key,
        c.name as customer_name,
        u.name as user_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id AND a.tenant_key = c.tenant_key
      LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key = u.tenant_key
      WHERE a.tenant_key = 'demo'
      LIMIT 3
    `);
    
    console.log('\n   📋 فعالیت‌های demo:');
    demoActivities.forEach(activity => {
      console.log(`     - ${activity.title} (${activity.type}) - مشتری: ${activity.customer_name} - کاربر: ${activity.user_name}`);
    });

    console.log('\n✨ تست جداسازی tenant ها کامل شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTenantIsolation();