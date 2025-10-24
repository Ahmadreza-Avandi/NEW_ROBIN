#!/usr/bin/env node

/**
 * بررسی ساختار دیتابیس و داده‌های موجود
 */

const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 بررسی ساختار دیتابیس...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // بررسی دیتابیس‌های موجود
    console.log('📊 دیتابیس‌های موجود:');
    const [databases] = await connection.query('SHOW DATABASES');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });
    console.log('');

    // بررسی جداول saas_master
    console.log('🏢 جداول saas_master:');
    try {
      const [masterTables] = await connection.query('SHOW TABLES FROM saas_master');
      masterTables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      // بررسی tenants
      console.log('\n👥 Tenants موجود:');
      const [tenants] = await connection.query('SELECT tenant_key, company_name, admin_email, is_active FROM saas_master.tenants');
      tenants.forEach(tenant => {
        console.log(`   - ${tenant.tenant_key}: ${tenant.company_name} (${tenant.admin_email}) - ${tenant.is_active ? 'فعال' : 'غیرفعال'}`);
      });
    } catch (error) {
      console.log('   ❌ خطا در دسترسی به saas_master');
    }

    // بررسی جداول crm_system
    console.log('\n💼 جداول crm_system:');
    try {
      const [crmTables] = await connection.query('SHOW TABLES FROM crm_system');
      crmTables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });

      // بررسی کاربران
      console.log('\n👤 کاربران موجود:');
      const [users] = await connection.query('SELECT name, email, role, tenant_key, status FROM crm_system.users');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role} - tenant: ${user.tenant_key || 'نامشخص'} - ${user.status}`);
      });

      // بررسی مشتریان
      console.log('\n🏪 مشتریان موجود:');
      const [customers] = await connection.query('SELECT name, email, tenant_key FROM crm_system.customers LIMIT 10');
      customers.forEach(customer => {
        console.log(`   - ${customer.name} (${customer.email}) - tenant: ${customer.tenant_key || 'نامشخص'}`);
      });

      // بررسی فعالیت‌ها
      console.log('\n📋 فعالیت‌های اخیر:');
      const [activities] = await connection.query('SELECT type, description, tenant_key, created_at FROM crm_system.activities ORDER BY created_at DESC LIMIT 5');
      activities.forEach(activity => {
        console.log(`   - ${activity.type}: ${activity.description} - tenant: ${activity.tenant_key || 'نامشخص'} - ${activity.created_at}`);
      });

      // بررسی وظایف
      console.log('\n✅ وظایف موجود:');
      const [tasks] = await connection.query('SELECT title, assigned_to, tenant_key, status FROM crm_system.tasks LIMIT 5');
      tasks.forEach(task => {
        console.log(`   - ${task.title} - مسئول: ${task.assigned_to} - tenant: ${task.tenant_key || 'نامشخص'} - ${task.status}`);
      });

    } catch (error) {
      console.log('   ❌ خطا در دسترسی به crm_system:', error.message);
    }

    // بررسی ساختار جداول مهم
    console.log('\n🔧 بررسی ساختار جداول:');
    
    const tablesToCheck = ['users', 'customers', 'activities', 'tasks', 'leads'];
    
    for (const table of tablesToCheck) {
      try {
        console.log(`\n📋 ساختار جدول ${table}:`);
        const [columns] = await connection.query(`DESCRIBE crm_system.${table}`);
        const hasTenantKey = columns.some(col => col.Field === 'tenant_key');
        console.log(`   - tenant_key موجود: ${hasTenantKey ? '✅' : '❌'}`);
        
        if (!hasTenantKey) {
          console.log(`   ⚠️  جدول ${table} فاقد ستون tenant_key است!`);
        }
      } catch (error) {
        console.log(`   ❌ جدول ${table} وجود ندارد`);
      }
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();