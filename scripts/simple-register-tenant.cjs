#!/usr/bin/env node

/**
 * ثبت tenant جدید بدون ایجاد دیتابیس جداگانه
 * از دیتابیس موجود crm_system استفاده می‌کنه
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
};

async function registerTenant(tenantData) {
  let connection;
  
  try {
    const {
      tenant_key,
      company_name,
      admin_email,
      admin_name,
      admin_password,
      admin_phone = '',
      plan_key = 'basic',
      subscription_months = 12,
      subscription_end: custom_end_date = null
    } = tenantData;

    console.log(`\n🚀 ثبت tenant: ${tenant_key}`);
    console.log(`📋 شرکت: ${company_name}\n`);

    connection = await mysql.createConnection(DB_CONFIG);

    // دریافت اطلاعات پلن
    const [plans] = await connection.query(
      'SELECT * FROM saas_master.subscription_plans WHERE plan_key = ?',
      [plan_key]
    );

    if (plans.length === 0) {
      throw new Error(`Plan ${plan_key} not found`);
    }

    const plan = plans[0];
    console.log(`✅ پلن ${plan.plan_name} یافت شد\n`);

    // محاسبه تاریخ انقضا
    const subscription_start = new Date();
    let subscription_end;
    
    if (custom_end_date) {
      // استفاده از تاریخ کاستوم
      subscription_end = new Date(custom_end_date);
      console.log(`📅 تاریخ پایان کاستوم: ${subscription_end.toLocaleDateString('fa-IR')}`);
    } else {
      // محاسبه بر اساس ماه‌های اشتراک
      subscription_end = new Date();
      subscription_end.setMonth(subscription_end.getMonth() + subscription_months);
    }

    // ثبت tenant در master database
    console.log('💾 ثبت tenant در master database...');
    const [result] = await connection.query(`
      INSERT INTO saas_master.tenants (
        tenant_key, company_name, db_name, db_host, db_port, db_user, db_password,
        admin_name, admin_email, admin_phone,
        subscription_status, subscription_plan, subscription_start, subscription_end,
        max_users, max_customers, max_storage_mb, features,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tenant_key, company_name,
      'crm_system', DB_CONFIG.host, DB_CONFIG.port, 
      process.env.DB_USER || 'crm_user', process.env.DB_PASSWORD || '',
      admin_name, admin_email, admin_phone,
      'active', plan_key, subscription_start, subscription_end,
      plan.max_users, plan.max_customers, plan.max_storage_mb, 
      JSON.stringify(plan.features),
      true
    ]);

    const tenant_id = result.insertId;
    console.log(`✅ Tenant ثبت شد (ID: ${tenant_id})\n`);

    // ثبت در subscription_history
    console.log('📝 ثبت تاریخچه اشتراک...');
    const amount = subscription_months === 12 ? plan.price_yearly : plan.price_monthly;
    
    await connection.query(`
      INSERT INTO saas_master.subscription_history (
        tenant_id, plan_key, subscription_type, start_date, end_date, amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      tenant_id, plan_key, 
      subscription_months === 12 ? 'yearly' : 'monthly', 
      subscription_start, subscription_end, amount, 'completed'
    ]);

    console.log('✅ تاریخچه ثبت شد\n');

    // ثبت لاگ
    console.log('📋 ثبت لاگ فعالیت...');
    await connection.query(`
      INSERT INTO saas_master.tenant_activity_logs (
        tenant_id, activity_type, description, metadata
      ) VALUES (?, ?, ?, ?)
    `, [
      tenant_id, 'tenant_created', 
      `Tenant created: ${company_name}`, 
      JSON.stringify({ plan_key, subscription_months, admin_email })
    ]);

    console.log('✅ لاگ ثبت شد\n');

    // ایجاد کاربر admin در crm_system
    console.log('👤 ایجاد کاربر admin...');
    const passwordHash = await bcrypt.hash(admin_password, 10);
    const userId = require('crypto').randomUUID();

    await connection.query(`
      INSERT INTO crm_system.users (
        id, name, email, password, role, status, tenant_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId, admin_name, admin_email, passwordHash, 'ceo', 'active', tenant_key
    ]);

    console.log('✅ کاربر admin ایجاد شد\n');

    console.log('✨ ثبت tenant با موفقیت انجام شد!\n');
    console.log('📊 خلاصه:');
    console.log(`   Tenant Key: ${tenant_key}`);
    console.log(`   Company: ${company_name}`);
    console.log(`   Database: crm_system (shared)`);
    console.log(`   URL: http://localhost:3000/${tenant_key}/login`);
    console.log(`   Subscription: ${plan.plan_name} (${subscription_months} ماه)`);
    console.log(`   Expires: ${subscription_end.toLocaleDateString('fa-IR')}\n`);
    console.log('🔐 اطلاعات لاگین:');
    console.log(`   Email: ${admin_email}`);
    console.log(`   Password: ${admin_password}\n`);

    return {
      success: true,
      tenant_id,
      tenant_key,
      admin_email,
      admin_password,
      url: `http://localhost:3000/${tenant_key}/login`
    };

  } catch (error) {
    console.error('\n❌ خطا:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اگر مستقیم اجرا شد
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('استفاده:');
    console.log('  node simple-register-tenant.cjs <tenant_key> <company_name> <admin_email> <admin_name> <admin_password> [plan_key] [months]');
    console.log('\nمثال:');
    console.log('  node simple-register-tenant.cjs samin "شرکت سامین" "admin@samin.com" "مدیر سامین" "Pass1234" professional 12');
    process.exit(1);
  }

  const [tenant_key, company_name, admin_email, admin_name, admin_password, plan_key, subscription_months] = args;

  registerTenant({
    tenant_key,
    company_name,
    admin_email,
    admin_name,
    admin_password,
    plan_key: plan_key || 'basic',
    subscription_months: parseInt(subscription_months) || 12
  }).catch(error => {
    console.error('خطا:', error);
    process.exit(1);
  });
}

module.exports = { registerTenant };