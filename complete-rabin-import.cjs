const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'crm_system'
};

console.log('🚀 شروع ایمپورت کامل داده‌های تنانت رابین...');
console.log('📋 شامل: کاربران (بدون مهندس کریمی و احمدرضا آوندی) + همه محصولات');

async function completeImport() {
  let connection;
  
  try {
    console.log('\n🔌 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ اتصال برقرار شد');
    
    // بررسی وجود جداول
    console.log('\n🔍 بررسی وجود جداول...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.error('❌ جدول users وجود ندارد!');
      return;
    }
    
    const [productTables] = await connection.execute("SHOW TABLES LIKE 'products'");
    if (productTables.length === 0) {
      console.error('❌ جدول products وجود ندارد!');
      return;
    }
    
    console.log('✅ جداول موجود هستند');
    
    // ایمپورت کاربران
    console.log('\n👥 شروع ایمپورت کاربران...');
    await importUsers(connection);
    
    // ایمپورت محصولات
    console.log('\n📦 شروع ایمپورت محصولات...');
    await importProducts(connection);
    
    // نمایش آمار نهایی
    await showFinalStats(connection);
    
  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

async function importUsers(connection) {
  const users = [
    {
      id: '362bb74f-3810-4ae4-ab26-ef93fce6c05f',
      email: 'rameshk.kosar@gmail.com',
      name: 'کوثر رامشک',
      username: 'rameshk.kosar@gmail.com',
      password: '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq',
      role: 'agent',
      status: 'active',
      phone: '09172087848',
      tenant_key: 'rabin'
    },
    {
      id: 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f',
      email: 'alirezasahafi77@gmail.com',
      name: 'علیرضا صحافی',
      username: 'alirezasahafi77@gmail.com',
      password: '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq',
      role: 'sales_agent',
      status: 'active',
      phone: '09332107233',
      tenant_key: 'rabin'
    },
    {
      id: '3cbba416-c557-11f0-adb4-7a654ee49283',
      email: 'zalireza034@gmail.com',
      name: 'علی رضا حسنی',
      username: 'zalireza034@gmail.com',
      password: '$2a$10$MVyksUJ7Uu4d6RO/HsBuFOggPrPTFT1iqVdQWpM091EdqTZkfnBeG',
      role: 'sales_manager',
      status: 'active',
      tenant_key: 'rabin'
    },
    {
      id: '7ba67f8b-c557-11f0-adb4-7a654ee49283',
      email: 'M.razizi076@gmail.com',
      name: 'مهندس عزیزی',
      username: 'M.razizi076@gmail.com',
      password: '$2a$10$gaqyEEPhmqp3KiPULZb99.FsXexXIeRaJcN8CGG3JuQJ7f7mMj0fm',
      role: 'sales_agent',
      status: 'active',
      tenant_key: 'rabin'
    },
    {
      id: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48',
      email: 'Mahdineyestani7@gmail.com',
      name: 'مهدی نیستانی',
      username: 'Mahdineyestani7@gmail.com',
      password: '$2a$10$Bfa4XgvhrwgFcIYP507kKOOnfVTr8CAc/CBuUnTq1S1M3yMwIrtO2',
      role: 'sales_agent',
      status: 'active',
      phone: '09059699792',
      tenant_key: 'rabin'
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    try {
      const insertUserQuery = `
        INSERT INTO users (
          id, email, name, username, password, role, 
          department, status, phone, tenant_key,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          role = VALUES(role),
          status = VALUES(status),
          phone = VALUES(phone),
          updated_at = NOW()
      `;
      
      await connection.execute(insertUserQuery, [
        user.id,
        user.email,
        user.name,
        user.username,
        user.password,
        user.role,
        null, // department
        user.status,
        user.phone || null,
        user.tenant_key
      ]);
      
      successCount++;
      console.log(`✅ ${successCount}/${users.length} - ${user.name}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ خطا در کاربر ${user.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 نتیجه کاربران: ✅ ${successCount} موفق، ❌ ${errorCount} خطا`);
}

async function importProducts(connection) {
  // لیست کامل محصولات (همان محصولاتی که قبلاً تعریف کردیم)
  const products = [
    { id: '05f357d8-cf49-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'خردکن', description: null, category: 'ماشین آلات', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RMcu001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '0b3199ca-cf48-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'میز کار', description: null, category: 'میز کارگاهی', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RTw001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '146bdbbf-bc9b-11f0-8607-581122e4f0be', tenant_id: 'rabin', name: 'محصول رابین', description: 'نزیز', category: 'رابین', price: 20000000.00, currency: 'IRR', status: 'active', sku: '432', created_by: 'ceo-001' },
    { id: '281bdfb9-cf47-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'خمیرکن', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMb001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '2bae6a08-cf49-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'سرخ کن', description: null, category: 'ماشین آلات', price: -1.00, currency: 'IRR', status: 'inactive', sku: 'RMf001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '345b82aa-cf8a-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهپاد s20 پلاس بیست لیتری', description: '1 میلیارد و 375 میلیون \nهر باتری 93 میلیون تومان', category: 'پهپاد کشاورزی', price: 1375000000.00, currency: 'IRR', status: 'active', sku: null, created_by: '3cbba416-c557-11f0-adb4-7a654ee49283' },
    { id: '37a9326c-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'میز کار الکترونیک', description: null, category: 'میز کارگاهی', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RTe01', created_by: 'ceo-001' },
    { id: '46cc89fb-ce1b-11f0-8238-d2bc93e1fc48', tenant_id: 'rabin', name: 'پلت زن', description: 'دستگاه پلت زن مخصوص خوراک دام و طیور\nبا ظرفیت تحویل یک تن در ساعت', category: 'ماشین آلات', price: 2900000000.00, currency: 'IRR', status: 'active', sku: 'RMc010', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '47278702-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'میزکار برق', description: null, category: 'میز کارگاهی', price: 396999999.00, currency: 'IRR', status: 'active', sku: 'RTe002', created_by: 'ceo-001' },
    { id: '4a5cb255-cf47-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهن کن', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMb002', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '583e90e3-cf49-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'دستگاه بسته بندی', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMp001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '64406351-cf47-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'تنور', description: null, category: 'ماشین آلات ', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMb003', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '72b8171d-cf89-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهپاد کشاورزی s10 ده لیتری', description: 'این قیمت 11 آبان 1404 ثبت شد\n\nنوع استاندارد 940 میلیون تومان با 4 باتری \n\nنوع اقتصادی 605 میلیون تومان قیمت هر باتری 55 میلیون تومان\n', category: 'پهپاد کشاورزی', price: 605000000.00, currency: 'IRR', status: 'active', sku: null, created_by: '3cbba416-c557-11f0-adb4-7a654ee49283' },
    { id: '74bb058a-cf8a-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهپاد s30 pro سی لیتری', description: '1 میلیارد و485 میلیون تومان با 4 باتری \n', category: 'پهپاد کشاورزی', price: 1475000000.00, currency: 'IRR', status: 'active', sku: null, created_by: '3cbba416-c557-11f0-adb4-7a654ee49283' },
    { id: '778fe834-c5e0-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'دستگاه تولید کراکت خرمایی', description: null, category: 'ماشین آلات', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RMt010', created_by: 'ceo-001' },
    { id: '793b0bdb-ce1b-11f0-8238-d2bc93e1fc48', tenant_id: 'rabin', name: 'آسیاب صنعتی', description: 'آسیاب صنعتی\nتک فاز\nموتور ۳ اسب بخار\n۲۸۴۰ دور بر ساعت ', category: 'ماشین آلات', price: 650000000.00, currency: 'IRR', status: 'active', sku: 'RMx003', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '83055a1e-c5e0-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'دستگاه تولید خمیر خرما', description: null, category: 'ماشین آلات', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RMt020', created_by: 'ceo-001' },
    { id: '8931f50b-c5cb-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'پهپاد سمپاش 10 لیتری', description: null, category: 'پهپاد کشاورزی', price: 700000000.00, currency: 'IRR', status: 'active', sku: 'RDsd010', created_by: 'ceo-001' },
    { id: '91d6dfb6-cf48-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'آبگیر صنعتی', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMwc001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '97781e63-cf47-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'آبلیمو گیری', description: null, category: 'ماشین آلات', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RMl001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: '9b769990-c5cb-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'پهپاد سمپاش 20 لیتری', description: null, category: 'پهپاد کشاورزی', price: 1100000000.00, currency: 'IRR', status: 'active', sku: 'RDsd020', created_by: 'ceo-001' },
    { id: 'a2a66b02-cf45-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'دستگاه تولید سس خرما', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMt030', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: 'abb035c9-c5cb-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'پهپاد سمپاش 30 لیتری', description: null, category: 'پهپاد کشاورزی', price: 1499999900.00, currency: 'IRR', status: 'active', sku: 'RDsd030', created_by: 'ceo-001' },
    { id: 'bfccd89f-cf45-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'دستگاه تولید شکلات خرما', description: null, category: 'ماشین آلات', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RMt040', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: 'c051587f-cf8a-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهپاد s50 pro پنجاه لیتری', description: null, category: 'پهپاد کشاورزی', price: 1825000000.00, currency: 'IRR', status: 'active', sku: null, created_by: '3cbba416-c557-11f0-adb4-7a654ee49283' },
    { id: 'c6bfb079-c5d4-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'موتور دریفت تک نفره', description: null, category: 'موتور', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RDt001', created_by: 'ceo-001' },
    { id: 'cc1d5c9e-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'میز کار آهنگری', description: null, category: 'میز کارگاهی', price: 234000000.00, currency: 'IRR', status: 'active', sku: 'RTb001', created_by: 'ceo-001' },
    { id: 'd303285e-c5d4-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'موتور دریفت دو نفره', description: null, category: 'موتور', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RDt002', created_by: 'ceo-001' },
    { id: 'd663bc3b-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'صندلی گردان', description: 'سایز بزرگ', category: 'صندلی کارگاهی', price: 125000000.00, currency: 'IRR', status: 'active', sku: 'RCr01', created_by: 'ceo-001' },
    { id: 'df631dee-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'صندلی چهارگوش', description: null, category: 'صندلی کارگاهی', price: 127000000.00, currency: 'IRR', status: 'active', sku: 'RCs01', created_by: 'ceo-001' },
    { id: 'e0541cf7-cf48-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'نوار شستشو', description: null, category: 'ماشین آلات', price: 1.00, currency: 'IRR', status: 'inactive', sku: 'RMwt001', created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48' },
    { id: 'e56fc855-c5ce-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'ترولی صنعتی', description: null, category: 'میز کارگاهی', price: 130000000.00, currency: 'IRR', status: 'active', sku: 'RTt001', created_by: 'ceo-001' },
    { id: 'e57797bb-cf89-11f0-b141-c274cc12da08', tenant_id: 'rabin', name: 'پهپاد s20 بیست لیتری', description: 'ورژن استاندارد 1.135 میلیون تومان\nورژن اقتصادی 735 میلیون تومان قیمت هر باتری 77 میلیون تومان\n', category: 'پهپاد کشاورزی', price: 735000000.00, currency: 'IRR', status: 'active', sku: null, created_by: '3cbba416-c557-11f0-adb4-7a654ee49283' },
    { id: 'e6d689ec-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'صندلی صنعتی 3', description: 'سایز کوچک', category: 'صندلی کارگاهی', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RCr02', created_by: 'ceo-001' },
    { id: 'f4c5a90b-c5cc-11f0-adb4-7a654ee49283', tenant_id: 'rabin', name: 'میر کار مونتاژ', description: null, category: 'میز کارگاهی', price: 2.00, currency: 'IRR', status: 'inactive', sku: 'RTa01', created_by: 'ceo-001' }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
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
        product.description,
        product.category,
        product.price,
        product.currency,
        product.status,
        product.sku,
        null, // image_url
        null, // specifications
        product.created_by
      ]);
      
      successCount++;
      if (successCount % 5 === 0 || successCount === products.length) {
        console.log(`✅ ${successCount}/${products.length} محصول ایمپورت شد`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ خطا در محصول ${product.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 نتیجه محصولات: ✅ ${successCount} موفق، ❌ ${errorCount} خطا`);
}

async function showFinalStats(connection) {
  console.log('\n📊 آمار نهایی:');
  
  try {
    const [userCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = ?', 
      ['rabin']
    );
    
    const [productCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE tenant_id = ?', 
      ['rabin']
    );
    
    const [activeProducts] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE tenant_id = ? AND status = ?', 
      ['rabin', 'active']
    );
    
    console.log(`👥 کاربران تنانت rabin: ${userCount[0].count}`);
    console.log(`📦 محصولات تنانت rabin: ${productCount[0].count}`);
    console.log(`🟢 محصولات فعال: ${activeProducts[0].count}`);
    console.log(`🔴 محصولات غیرفعال: ${productCount[0].count - activeProducts[0].count}`);
    
    // نمایش کاربران
    const [users] = await connection.execute(
      'SELECT name, role, email FROM users WHERE tenant_id = ? ORDER BY role, name', 
      ['rabin']
    );
    
    console.log('\n👥 لیست کاربران ایمپورت شده:');
    users.forEach(user => {
      console.log(`   • ${user.name} (${user.role}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ خطا در نمایش آمار:', error.message);
  }
}

// اجرای اسکریپت
completeImport().then(() => {
  console.log('\n🎉 ایمپورت کامل انجام شد!');
}).catch(error => {
  console.error('\n💥 خطای کلی در اجرا:', error);
});