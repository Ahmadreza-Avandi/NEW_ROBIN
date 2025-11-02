#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function checkDemoTejarat() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
  });

  try {
    console.log('🔍 جستجوی "دمو تجارت" در دیتابیس...\n');

    const tables = ['customers', 'sales', 'products', 'activities', 'users'];

    for (const table of tables) {
      console.log(`📋 جدول: ${table}`);
      
      // جستجوی "دمو" یا "تجارت" در تمام ستون‌های متنی
      let query = '';
      let searchColumns = [];
      
      // دریافت ستون‌های جدول
      const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
      
      // فیلتر ستون‌های متنی
      const textColumns = columns
        .filter(col => 
          col.Type.includes('varchar') || 
          col.Type.includes('text') || 
          col.Type.includes('char')
        )
        .map(col => col.Field);
      
      if (textColumns.length > 0) {
        const conditions = textColumns.map(col => `${col} LIKE '%دمو%' OR ${col} LIKE '%تجارت%'`).join(' OR ');
        query = `SELECT * FROM ${table} WHERE ${conditions}`;
        
        const [results] = await connection.query(query);
        
        if (results.length > 0) {
          console.log(`  ⚠️  ${results.length} رکورد حاوی "دمو" یا "تجارت" یافت شد:`);
          
          results.forEach((row, index) => {
            console.log(`\n  ${index + 1}. ID: ${row.id}`);
            console.log(`     tenant_key: ${row.tenant_key || 'NULL'}`);
            
            // نمایش فیلدهای مهم
            if (row.name) console.log(`     name: ${row.name}`);
            if (row.title) console.log(`     title: ${row.title}`);
            if (row.company_name) console.log(`     company_name: ${row.company_name}`);
            if (row.customer_name) console.log(`     customer_name: ${row.customer_name}`);
            if (row.email) console.log(`     email: ${row.email}`);
            if (row.created_at) console.log(`     created_at: ${row.created_at}`);
          });
        } else {
          console.log(`  ✅ هیچ رکوردی یافت نشد`);
        }
      }
      
      console.log('');
    }

    // جستجوی خاص "شرکت دمو تجارت"
    console.log('\n🎯 جستجوی دقیق "شرکت دمو تجارت"...\n');
    
    const [customers] = await connection.query(`
      SELECT * FROM customers 
      WHERE name LIKE '%شرکت دمو تجارت%' 
         OR company_name LIKE '%شرکت دمو تجارت%'
    `);
    
    if (customers.length > 0) {
      console.log(`✅ ${customers.length} مشتری با نام "شرکت دمو تجارت" یافت شد:\n`);
      customers.forEach(customer => {
        console.log(`ID: ${customer.id}`);
        console.log(`Name: ${customer.name}`);
        console.log(`Company: ${customer.company_name}`);
        console.log(`Tenant Key: ${customer.tenant_key}`);
        console.log(`Created: ${customer.created_at}`);
        console.log('---');
      });
    } else {
      console.log('❌ هیچ مشتری با این نام یافت نشد');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkDemoTejarat();
