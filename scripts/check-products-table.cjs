#!/usr/bin/env node

/**
 * بررسی ساختار جدول products
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

async function checkProductsTable() {
  let connection;
  
  try {
    console.log('🔍 بررسی ساختار جدول products...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // بررسی ساختار جدول
    console.log('📋 ستون‌های جدول products:');
    const [columns] = await connection.query('DESCRIBE products');
    
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // نمونه داده‌های موجود
    console.log('\n📊 نمونه داده‌های موجود:');
    const [samples] = await connection.query('SELECT * FROM products LIMIT 3');
    
    if (samples.length > 0) {
      console.log('   ستون‌های پر شده:');
      Object.keys(samples[0]).forEach(key => {
        console.log(`   - ${key}: ${samples[0][key]}`);
      });
    } else {
      console.log('   هیچ داده‌ای موجود نیست');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkProductsTable();