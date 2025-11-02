#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function checkTenantColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
  });

  try {
    console.log('🔍 بررسی ستون tenant_key در جداول...\n');

    const tables = ['products', 'sales', 'customers', 'activities', 'users'];

    for (const table of tables) {
      console.log(`📋 جدول: ${table}`);
      
      // بررسی ساختار جدول
      const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
      const hasTenantKey = columns.some(col => col.Field === 'tenant_key');
      
      if (hasTenantKey) {
        console.log(`  ✅ ستون tenant_key وجود دارد`);
        
        // شمارش رکوردها بر اساس tenant_key
        const [counts] = await connection.query(`
          SELECT tenant_key, COUNT(*) as count 
          FROM ${table} 
          WHERE tenant_key IS NOT NULL
          GROUP BY tenant_key
        `);
        
        if (counts.length > 0) {
          console.log(`  📊 توزیع داده‌ها:`);
          counts.forEach(row => {
            console.log(`     - ${row.tenant_key}: ${row.count} رکورد`);
          });
        }
        
        // بررسی رکوردهای بدون tenant_key
        const [nullCount] = await connection.query(`
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE tenant_key IS NULL
        `);
        
        if (nullCount[0].count > 0) {
          console.log(`  ⚠️  ${nullCount[0].count} رکورد بدون tenant_key`);
        }
      } else {
        console.log(`  ❌ ستون tenant_key وجود ندارد`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkTenantColumns();
