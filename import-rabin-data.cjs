const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'crm_system'
};

// کاربران برای تنانت rabin (بدون مهندس کریمی و احمدرضا آوندی)
const users = [
  {
    id: '362bb74f-3810-4ae4-ab26-ef93fce6c05f',
    email: 'rameshk.kosar@gmail.com',
    name: 'کوثر رامشک',
    display_name: 'کوثر رامشک',
    username: 'rameshk.kosar@gmail.com',
    password: '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq',
    role: 'agent',
    status: 'active',
    phone: '09172087848',
    tenant_id: 'rabin'
  },
  {
    id: 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f',
    email: 'alirezasahafi77@gmail.com',
    name: 'علیرضا صحافی',
    display_name: 'علیرضا صحافی',
    username: 'alirezasahafi77@gmail.com',
    password: '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq',
    role: 'sales_agent',
    status: 'active',
    phone: '09332107233',
    tenant_id: 'rabin'
  },
  {
    id: '3cbba416-c557-11f0-adb4-7a654ee49283',
    email: 'zalireza034@gmail.com',
    name: 'علی رضا حسنی',
    display_name: 'علی رضا حسنی',
    username: 'zalireza034@gmail.com',
    password: '$2a$10$MVyksUJ7Uu4d6RO/HsBuFOggPrPTFT1iqVdQWpM091EdqTZkfnBeG',
    role: 'sales_manager',
    status: 'active',
    tenant_id: 'rabin'
  },
  {
    id: '7ba67f8b-c557-11f0-adb4-7a654ee49283',
    email: 'M.razizi076@gmail.com',
    name: 'مهندس عزیزی',
    display_name: 'مهندس عزیزی',
    username: 'M.razizi076@gmail.com',
    password: '$2a$10$gaqyEEPhmqp3KiPULZb99.FsXexXIeRaJcN8CGG3JuQJ7f7mMj0fm',
    role: 'sales_agent',
    status: 'active',
    tenant_id: 'rabin'
  },
  {
    id: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48',
    email: 'Mahdineyestani7@gmail.com',
    name: 'مهدی نیستانی',
    display_name: 'مهدی نیستانی',
    username: 'Mahdineyestani7@gmail.com',
    password: '$2a$10$Bfa4XgvhrwgFcIYP507kKOOnfVTr8CAc/CBuUnTq1S1M3yMwIrtO2',
    role: 'sales_agent',
    status: 'active',
    phone: '09059699792',
    tenant_id: 'rabin'
  }
];

// محصولات برای تنانت rabin
const products = [
  {
    id: '05f357d8-cf49-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'خردکن',
    category: 'ماشین آلات',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMcu001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '0b3199ca-cf48-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'میز کار',
    category: 'میز کارگاهی',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RTw001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '146bdbbf-bc9b-11f0-8607-581122e4f0be',
    tenant_id: 'rabin',
    name: 'محصول رابین',
    description: 'نزیز',
    category: 'رابین',
    price: 20000000.00,
    currency: 'IRR',
    status: 'active',
    sku: '432',
    created_by: 'ceo-001'
  }
];

async function importData() {
  let connection;
  
  try {
    console.log('اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('شروع ایمپورت کاربران...');
    
    // ایمپورت کاربران
    for (const user of users) {
      try {
        const insertUserQuery = `
          INSERT INTO users (
            id, email, name, display_name, username, password, role, 
            department, manager_id, status, avatar, bio, phone, 
            last_login, created_at, updated_at, deleted_at, tenant_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            display_name = VALUES(display_name),
            role = VALUES(role),
            status = VALUES(status),
            phone = VALUES(phone),
            updated_at = NOW()
        `;
        
        await connection.execute(insertUserQuery, [
          user.id,
          user.email,
          user.name,
          user.display_name,
          user.username,
          user.password,
          user.role,
          null, // department
          null, // manager_id
          user.status,
          null, // avatar
          null, // bio
          user.phone || null,
          null, // last_login
          null, // deleted_at
          user.tenant_id
        ]);
        
        console.log(`✅ کاربر ${user.name} اضافه شد`);
      } catch (error) {
        console.error(`❌ خطا در اضافه کردن کاربر ${user.name}:`, error.message);
      }
    }
    
    console.log('\nشروع ایمپورت محصولات...');
    
    // ایمپورت محصولات (فقط تعداد محدودی برای تست)
    const limitedProducts = products.slice(0, 10); // فقط 10 محصول اول برای تست
    
    for (const product of limitedProducts) {
      try {
        const insertProductQuery = `
          INSERT INTO products (
            id, tenant_id, name, description, category, price, currency, 
            status, sku, image_url, specifications, created_by, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            category = VALUES(category),
            price = VALUES(price),
            status = VALUES(status),
            updated_at = NOW()
        `;
        
        await connection.execute(insertProductQuery, [
          product.id,
          product.tenant_id,
          product.name,
          product.description || null,
          product.category,
          product.price,
          product.currency,
          product.status,
          product.sku || null,
          null, // image_url
          null, // specifications
          product.created_by
        ]);
        
        console.log(`✅ محصول ${product.name} اضافه شد`);
      } catch (error) {
        console.error(`❌ خطا در اضافه کردن محصول ${product.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 ایمپورت داده‌ها با موفقیت انجام شد!');
    
    // نمایش آمار
    const [userCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = ?', 
      ['rabin']
    );
    
    const [productCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE tenant_id = ?', 
      ['rabin']
    );
    
    console.log(`\n📊 آمار نهایی:`);
    console.log(`- تعداد کاربران تنانت rabin: ${userCount[0].count}`);
    console.log(`- تعداد محصولات تنانت rabin: ${productCount[0].count}`);
    
  } catch (error) {
    console.error('❌ خطا در ایمپورت داده‌ها:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای اسکریپت
importData();