#!/usr/bin/env node

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'crm_user',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'crm_system',
    });

    console.log('\n📋 کاربران CRM System:\n');
    const [users] = await connection.query(
      'SELECT id, name, email, role, tenant_key, status FROM users'
    );
    
    console.table(users);

    console.log('\n🏢 تنانت‌های SaaS Master:\n');
    const saasConnection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'crm_user',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.SAAS_DATABASE_NAME || 'saas_master',
    });

    const [tenants] = await saasConnection.query(
      'SELECT id, tenant_key, company_name, admin_email, subscription_status FROM tenants'
    );
    
    console.table(tenants);

    console.log('\n👑 Super Admins:\n');
    const [admins] = await saasConnection.query(
      'SELECT id, username, email, full_name, is_active FROM super_admins'
    );
    
    console.table(admins);

    await connection.end();
    await saasConnection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkUsers();
