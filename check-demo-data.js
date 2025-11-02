#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function checkDemoData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
  });

  try {
    console.log('🔍 بررسی داده‌های demo در دیتابیس...\n');

    const tables = ['products', 'sales', 'customers', 'activities'];

    for (const table of tables) {
      console.log(`📋 جدول: ${table}`);
      
      // شمارش رکوردهای demo
      const [demoCount] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM ${table} 
        WHERE tenant_key = 'demo'
      `);
      
      if (demoCount[0].count > 0) {
        console.log(`  ⚠️  ${demoCount[0].count} رکورد با tenant_key='demo' یافت شد`);
        
        // نمایش چند نمونه
        const [samples] = await connection.query(`
          SELECT * FROM ${table} 
          WHERE tenant_key = 'demo'
          LIMIT 3
        `);
        
        console.log(`  📊 نمونه‌ها:`);
        samples.forEach((row, index) => {
          const name = row.name || row.title || row.customer_name || row.id;
          console.log(`     ${index + 1}. ${name}`);
        });
      } else {
        console.log(`  ✅ هیچ رکورد demo یافت نشد`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkDemoData();
