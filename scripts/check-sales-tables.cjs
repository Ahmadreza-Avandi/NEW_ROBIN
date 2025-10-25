#!/usr/bin/env node

/**
 * بررسی ساختار جداول فروش
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

async function checkSalesTables() {
  let connection;
  
  try {
    console.log('🔍 بررسی ساختار جداول فروش...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    const tables = ['sales', 'deals'];
    
    for (const table of tables) {
      try {
        console.log(`📋 ساختار جدول ${table}:`);
        const [columns] = await connection.query(`DESCRIBE ${table}`);
        
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // نمونه داده
        const [sample] = await connection.query(`SELECT * FROM ${table} LIMIT 1`);
        if (sample.length > 0) {
          console.log('   نمونه داده:');
          Object.keys(sample[0]).forEach(key => {
            console.log(`     ${key}: ${sample[0][key]}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ جدول ${table}: ${error.message}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSalesTables();