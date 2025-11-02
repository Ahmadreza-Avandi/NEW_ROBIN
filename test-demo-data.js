#!/usr/bin/env node

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDemoData() {
  log('\n🔍 بررسی داده‌های دمو...', 'cyan');
  log('='.repeat(50), 'blue');

  const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'crm_system',
  };

  const saasDbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'crm_user',
    password: process.env.DATABASE_PASSWORD || '1234',
    database: process.env.SAAS_DATABASE_NAME || 'saas_master',
  };

  try {
    // اتصال به دیتابیس SaaS
    log('\n🏢 بررسی تنانت rabin در SaaS:', 'cyan');
    const saasConnection = await mysql.createConnection(saasDbConfig);
    
    const [tenants] = await saasConnection.query(
      'SELECT * FROM tenants WHERE tenant_key = ?',
      ['rabin']
    );
    
    log(`  📊 تعداد تنانت‌های یافت شده: ${tenants.length}`, 'blue');
    
    if (tenants.length > 0) {
      const tenant = tenants[0];
      log(`  ✅ تنانت یافت شد: ${tenant.company_name}`, 'green');
      log(`  📧 ایمیل: ${tenant.admin_email}`, 'blue');
      log(`  📱 تلفن: ${tenant.admin_phone}`, 'blue');
      log(`  🔑 کلید: ${tenant.tenant_key}`, 'blue');
      log(`  📊 وضعیت: ${tenant.status}`, tenant.status === 'active' ? 'green' : 'red');
    } else {
      log('  ❌ تنانت rabin یافت نشد!', 'red');
    }
    
    await saasConnection.end();

    // اتصال به دیتابیس CRM
    log('\n📊 بررسی داده‌های CRM:', 'cyan');
    const crmConnection = await mysql.createConnection(dbConfig);

    // بررسی کاربر دمو
    log('\n👤 بررسی کاربر دمو:', 'yellow');
    const [demoUsers] = await crmConnection.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      ['Robintejarat@gmail.com', 'Robintejarat@gmail.com']
    );
    
    if (demoUsers.length > 0) {
      const user = demoUsers[0];
      log(`  ✅ کاربر دمو یافت شد: ${user.name || user.username}`, 'green');
      log(`  📧 ایمیل: ${user.email}`, 'blue');
      log(`  👑 نقش: ${user.role}`, 'blue');
      log(`  📊 وضعیت: ${user.status}`, user.status === 'active' ? 'green' : 'red');
      log(`  🏢 تیم: ${user.team || 'تعریف نشده'}`, 'blue');
      
      // بررسی دسترسی‌های کاربر
      log('\n🔐 بررسی دسترسی‌های کاربر:', 'yellow');
      const [permissions] = await crmConnection.query(
        'SELECT * FROM user_permissions WHERE user_id = ?',
        [user.id]
      );
      
      if (permissions.length > 0) {
        log(`  ✅ تعداد دسترسی‌ها: ${permissions.length}`, 'green');
        permissions.forEach(perm => {
          log(`    - ${perm.module_id}: ${perm.can_read ? '👁️' : '❌'} ${perm.can_write ? '✏️' : '❌'} ${perm.can_delete ? '🗑️' : '❌'}`, 'blue');
        });
      } else {
        log('  ⚠️ هیچ دسترسی خاصی تعریف نشده', 'yellow');
      }
      
    } else {
      log('  ❌ کاربر دمو یافت نشد!', 'red');
    }

    // بررسی وظایف
    log('\n📋 بررسی وظایف (Tasks):', 'yellow');
    const [tasks] = await crmConnection.query(
      'SELECT COUNT(*) as count FROM tasks'
    );
    log(`  📊 تعداد کل وظایف: ${tasks[0].count}`, tasks[0].count > 0 ? 'green' : 'red');
    
    if (tasks[0].count > 0) {
      const [recentTasks] = await crmConnection.query(
        'SELECT * FROM tasks ORDER BY created_at DESC LIMIT 3'
      );
      log('  📝 آخرین وظایف:', 'blue');
      recentTasks.forEach((task, index) => {
        log(`    ${index + 1}. ${task.title} - وضعیت: ${task.status}`, 'blue');
      });
    }

    // بررسی فعالیت‌ها
    log('\n🎯 بررسی فعالیت‌ها (Activities):', 'yellow');
    const [activities] = await crmConnection.query(
      'SELECT COUNT(*) as count FROM activities'
    );
    log(`  📊 تعداد کل فعالیت‌ها: ${activities[0].count}`, activities[0].count > 0 ? 'green' : 'red');
    
    if (activities[0].count > 0) {
      const [recentActivities] = await crmConnection.query(
        'SELECT * FROM activities ORDER BY created_at DESC LIMIT 3'
      );
      log('  📝 آخرین فعالیت‌ها:', 'blue');
      recentActivities.forEach((activity, index) => {
        log(`    ${index + 1}. ${activity.title} - نوع: ${activity.type}`, 'blue');
      });
    }

    // بررسی اسناد
    log('\n📄 بررسی اسناد (Documents):', 'yellow');
    const [documents] = await crmConnection.query(
      'SELECT COUNT(*) as count FROM documents WHERE status != "deleted"'
    );
    log(`  📊 تعداد کل اسناد: ${documents[0].count}`, documents[0].count > 0 ? 'green' : 'red');
    
    if (documents[0].count > 0) {
      const [recentDocs] = await crmConnection.query(
        'SELECT * FROM documents WHERE status != "deleted" ORDER BY created_at DESC LIMIT 3'
      );
      log('  📝 آخرین اسناد:', 'blue');
      recentDocs.forEach((doc, index) => {
        log(`    ${index + 1}. ${doc.title} - نوع: ${doc.mime_type}`, 'blue');
      });
    }

    // بررسی همکاران
    log('\n👥 بررسی همکاران:', 'yellow');
    const [coworkers] = await crmConnection.query(
      'SELECT COUNT(*) as count FROM users WHERE status = "active"'
    );
    log(`  📊 تعداد همکاران فعال: ${coworkers[0].count}`, coworkers[0].count > 0 ? 'green' : 'red');

    // بررسی گزارش‌ها برای مدیرعامل
    if (demoUsers.length > 0 && ['ceo', 'مدیر', 'مدیرعامل'].includes(demoUsers[0].role)) {
      log('\n📈 بررسی دسترسی گزارش‌ها برای مدیرعامل:', 'yellow');
      
      // بررسی آمار کلی
      const [customerCount] = await crmConnection.query('SELECT COUNT(*) as count FROM customers');
      const [dealCount] = await crmConnection.query('SELECT COUNT(*) as count FROM deals');
      const [salesCount] = await crmConnection.query('SELECT COUNT(*) as count FROM sales');
      
      log(`  👥 تعداد مشتریان: ${customerCount[0].count}`, 'green');
      log(`  💼 تعداد معاملات: ${dealCount[0].count}`, 'green');
      log(`  💰 تعداد فروش‌ها: ${salesCount[0].count}`, 'green');
    }

    await crmConnection.end();

    log('\n' + '='.repeat(50), 'blue');
    log('✅ بررسی داده‌های دمو تمام شد!', 'green');
    log('='.repeat(50), 'blue');

  } catch (error) {
    log(`\n❌ خطا در بررسی داده‌ها: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

testDemoData().catch(console.error);