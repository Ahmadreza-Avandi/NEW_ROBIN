#!/usr/bin/env node

/**
 * اضافه کردن محصولات تستی برای demo
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

async function addDemoProducts() {
  let connection;
  
  try {
    console.log('📦 اضافه کردن محصولات تستی برای demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر demo
    const [demoUsers] = await connection.query('SELECT id, name FROM users WHERE tenant_key = "demo"');
    
    if (demoUsers.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = demoUsers[0];
    console.log(`✅ کاربر demo: ${demoUser.name} (${demoUser.id})`);

    // محصولات تستی
    const products = [
      {
        id: 'demo-product-1',
        name: 'نرم‌افزار CRM پایه',
        description: 'نرم‌افزار مدیریت ارتباط با مشتری برای کسب‌وکارهای کوچک',
        sku: 'CRM-BASIC-001',
        category: 'نرم‌افزار',
        price: 5000000,
        stock_quantity: 100,
        reorder_level: 10
      },
      {
        id: 'demo-product-2',
        name: 'پکیج آموزش CRM',
        description: 'دوره جامع آموزش استفاده از سیستم CRM',
        sku: 'TRN-CRM-001',
        category: 'آموزش',
        price: 2000000,
        stock_quantity: 50,
        reorder_level: 5
      },
      {
        id: 'demo-product-3',
        name: 'خدمات پشتیبانی ماهانه',
        description: 'پشتیبانی فنی و نگهداری سیستم CRM',
        sku: 'SUP-MONTHLY-001',
        category: 'خدمات',
        price: 1500000,
        stock_quantity: 999,
        reorder_level: 0
      }
    ];

    console.log('\n📝 اضافه کردن محصولات:');
    
    for (const product of products) {
      try {
        await connection.query(`
          INSERT INTO products (
            id, tenant_key, name, description, sku, category,
            price, currency, status, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          description = VALUES(description),
          price = VALUES(price)
        `, [
          product.id,
          'demo',
          product.name,
          product.description,
          product.sku,
          product.category,
          product.price,
          'IRR',
          'active',
          demoUser.id
        ]);
        
        console.log(`   ✅ ${product.name} - ${product.price.toLocaleString()} تومان`);
      } catch (error) {
        console.log(`   ❌ خطا در ${product.name}: ${error.message}`);
      }
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی:');
    const [finalProducts] = await connection.query(`
      SELECT 
        name,
        category,
        price,
        status
      FROM products
      WHERE tenant_key = 'demo'
      ORDER BY created_at DESC
    `);

    console.log(`   ✅ کل محصولات: ${finalProducts.length}`);
    finalProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category}) - ${product.price.toLocaleString()} تومان - وضعیت: ${product.status}`);
    });

    console.log('\n✨ محصولات تستی با موفقیت اضافه شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDemoProducts();