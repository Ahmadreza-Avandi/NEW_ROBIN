#!/usr/bin/env node

/**
 * اضافه کردن داده‌های فروش و معامله برای demo
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

async function addDemoSalesData() {
  let connection;
  
  try {
    console.log('💰 اضافه کردن داده‌های فروش برای demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر و مشتریان demo
    const [demoUsers] = await connection.query('SELECT id, name FROM users WHERE tenant_key = "demo"');
    const [demoCustomers] = await connection.query('SELECT id, name FROM customers WHERE tenant_key = "demo"');
    const [demoProducts] = await connection.query('SELECT id, name, price FROM products WHERE tenant_key = "demo"');

    if (demoUsers.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = demoUsers[0];
    console.log(`✅ کاربر demo: ${demoUser.name}`);
    console.log(`✅ مشتریان: ${demoCustomers.length}`);
    console.log(`✅ محصولات: ${demoProducts.length}\n`);

    // اضافه کردن فروش‌های تستی
    console.log('💰 اضافه کردن فروش‌های تستی:');
    
    const sales = [
      {
        id: 'demo-sale-1',
        customer_id: demoCustomers[0]?.id,
        total_amount: 5000000,
        payment_status: 'paid',
        sale_date: new Date(),
        invoice_number: 'INV-DEMO-001',
        description: 'فروش نرم‌افزار CRM پایه'
      },
      {
        id: 'demo-sale-2', 
        customer_id: demoCustomers[1]?.id,
        total_amount: 2000000,
        payment_status: 'pending',
        sale_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 روز پیش
        invoice_number: 'INV-DEMO-002',
        description: 'فروش پکیج آموزش CRM'
      }
    ];

    for (const sale of sales) {
      try {
        await connection.query(`
          INSERT INTO sales (
            id, tenant_key, customer_id, customer_name, total_amount, 
            payment_status, sale_date, invoice_number, title,
            sales_person_id, sales_person_name, currency,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
          total_amount = VALUES(total_amount),
          title = VALUES(title)
        `, [
          sale.id, 'demo', sale.customer_id, 
          demoCustomers.find(c => c.id === sale.customer_id)?.name || 'نامشخص',
          sale.total_amount, sale.payment_status, sale.sale_date,
          sale.invoice_number, sale.description, demoUser.id, demoUser.name, 'IRR'
        ]);
        
        console.log(`   ✅ ${sale.description} - ${sale.total_amount.toLocaleString()} تومان`);
      } catch (error) {
        console.log(`   ❌ خطا در ${sale.description}: ${error.message}`);
      }
    }

    // اضافه کردن معاملات تستی (اگر جدول deals وجود داشته باشد)
    console.log('\n🤝 اضافه کردن معاملات تستی:');
    
    try {
      // بررسی وجود جدول deals
      const [dealsTable] = await connection.query("SHOW TABLES LIKE 'deals'");
      
      if (dealsTable.length > 0) {
        const deals = [
          {
            id: 'demo-deal-1',
            title: 'قرارداد نرم‌افزار CRM شرکت دمو',
            customer_id: demoCustomers[0]?.id,
            total_value: 10000000,
            probability: 80,
            expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز آینده
            stage: 'negotiation',
            description: 'قرارداد سالانه نرم‌افزار CRM با پشتیبانی کامل'
          },
          {
            id: 'demo-deal-2',
            title: 'پروژه پیاده‌سازی CRM',
            customer_id: demoCustomers[1]?.id,
            total_value: 15000000,
            probability: 60,
            expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 روز آینده
            stage: 'proposal_sent',
            description: 'پیاده‌سازی و راه‌اندازی سیستم CRM'
          }
        ];

        for (const deal of deals) {
          try {
            await connection.query(`
              INSERT INTO deals (
                id, tenant_key, title, customer_id, assigned_to, 
                total_value, probability, expected_close_date, stage,
                description, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
              ON DUPLICATE KEY UPDATE 
              total_value = VALUES(total_value),
              probability = VALUES(probability)
            `, [
              deal.id, 'demo', deal.title, deal.customer_id, demoUser.id,
              deal.total_value, deal.probability, deal.expected_close_date,
              deal.stage, deal.description
            ]);
            
            console.log(`   ✅ ${deal.title} - ${deal.total_value.toLocaleString()} تومان (${deal.probability}%)`);
          } catch (error) {
            console.log(`   ❌ خطا در ${deal.title}: ${error.message}`);
          }
        }
      } else {
        console.log('   ℹ️  جدول deals وجود ندارد');
      }
    } catch (error) {
      console.log(`   ❌ خطا در بررسی جدول deals: ${error.message}`);
    }

    // اضافه کردن مخاطبین تستی
    console.log('\n📞 اضافه کردن مخاطبین تستی:');
    
    try {
      const contacts = [
        {
          id: 'demo-contact-1',
          first_name: 'محمد',
          last_name: 'رضایی',
          email: 'mohammad.rezaei@demo-company.com',
          phone: '02133445566',
          job_title: 'مدیر IT',
          company_id: demoCustomers[0]?.id,
          is_primary: true
        },
        {
          id: 'demo-contact-2',
          first_name: 'فاطمه',
          last_name: 'احمدی',
          email: 'fateme.ahmadi@demo.com',
          phone: '09123456789',
          job_title: 'مدیر خرید',
          company_id: demoCustomers[1]?.id,
          is_primary: true
        }
      ];

      for (const contact of contacts) {
        try {
          await connection.query(`
            INSERT INTO contacts (
              id, tenant_key, first_name, last_name, email, phone,
              job_title, company_id, is_primary, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            email = VALUES(email),
            phone = VALUES(phone)
          `, [
            contact.id, 'demo', contact.first_name, contact.last_name,
            contact.email, contact.phone, contact.job_title,
            contact.company_id, contact.is_primary
          ]);
          
          console.log(`   ✅ ${contact.first_name} ${contact.last_name} (${contact.job_title})`);
        } catch (error) {
          console.log(`   ❌ خطا در ${contact.first_name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ خطا در اضافه کردن مخاطبین: ${error.message}`);
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی:');
    
    const tables = ['sales', 'deals', 'contacts'];
    
    for (const table of tables) {
      try {
        const [count] = await connection.query(`
          SELECT COUNT(*) as count FROM ${table} WHERE tenant_key = 'demo'
        `);
        console.log(`   ${table}: ${count[0].count} رکورد`);
      } catch (error) {
        console.log(`   ${table}: جدول وجود ندارد`);
      }
    }

    console.log('\n✨ داده‌های فروش با موفقیت اضافه شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDemoSalesData();