const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'crm_system'
};

// همه محصولات تنانت rabin
const products = [
  {
    id: '05f357d8-cf49-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'خردکن',
    description: null,
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
    description: null,
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
  },
  {
    id: '281bdfb9-cf47-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'خمیرکن',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMb001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '2bae6a08-cf49-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'سرخ کن',
    description: null,
    category: 'ماشین آلات',
    price: -1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMf001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '345b82aa-cf8a-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهپاد s20 پلاس بیست لیتری',
    description: '1 میلیارد و 375 میلیون \nهر باتری 93 میلیون تومان',
    category: 'پهپاد کشاورزی',
    price: 1375000000.00,
    currency: 'IRR',
    status: 'active',
    sku: null,
    created_by: '3cbba416-c557-11f0-adb4-7a654ee49283'
  },
  {
    id: '37a9326c-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'میز کار الکترونیک',
    description: null,
    category: 'میز کارگاهی',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RTe01',
    created_by: 'ceo-001'
  },
  {
    id: '46cc89fb-ce1b-11f0-8238-d2bc93e1fc48',
    tenant_id: 'rabin',
    name: 'پلت زن',
    description: 'دستگاه پلت زن مخصوص خوراک دام و طیور\nبا ظرفیت تحویل یک تن در ساعت',
    category: 'ماشین آلات',
    price: 2900000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RMc010',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '47278702-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'میزکار برق',
    description: null,
    category: 'میز کارگاهی',
    price: 396999999.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RTe002',
    created_by: 'ceo-001'
  },
  {
    id: '4a5cb255-cf47-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهن کن',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMb002',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '583e90e3-cf49-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'دستگاه بسته بندی',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMp001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '64406351-cf47-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'تنور',
    description: null,
    category: 'ماشین آلات ',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMb003',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '72b8171d-cf89-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهپاد کشاورزی s10 ده لیتری',
    description: 'این قیمت 11 آبان 1404 ثبت شد\n\nنوع استاندارد 940 میلیون تومان با 4 باتری \n\nنوع اقتصادی 605 میلیون تومان قیمت هر باتری 55 میلیون تومان\n',
    category: 'پهپاد کشاورزی',
    price: 605000000.00,
    currency: 'IRR',
    status: 'active',
    sku: null,
    created_by: '3cbba416-c557-11f0-adb4-7a654ee49283'
  },
  {
    id: '74bb058a-cf8a-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهپاد s30 pro سی لیتری',
    description: '1 میلیارد و485 میلیون تومان با 4 باتری \n',
    category: 'پهپاد کشاورزی',
    price: 1475000000.00,
    currency: 'IRR',
    status: 'active',
    sku: null,
    created_by: '3cbba416-c557-11f0-adb4-7a654ee49283'
  },
  {
    id: '778fe834-c5e0-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'دستگاه تولید کراکت خرمایی',
    description: null,
    category: 'ماشین آلات',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMt010',
    created_by: 'ceo-001'
  },
  {
    id: '793b0bdb-ce1b-11f0-8238-d2bc93e1fc48',
    tenant_id: 'rabin',
    name: 'آسیاب صنعتی',
    description: 'آسیاب صنعتی\nتک فاز\nموتور ۳ اسب بخار\n۲۸۴۰ دور بر ساعت ',
    category: 'ماشین آلات',
    price: 650000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RMx003',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '83055a1e-c5e0-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'دستگاه تولید خمیر خرما',
    description: null,
    category: 'ماشین آلات',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMt020',
    created_by: 'ceo-001'
  },
  {
    id: '8931f50b-c5cb-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'پهپاد سمپاش 10 لیتری',
    description: null,
    category: 'پهپاد کشاورزی',
    price: 700000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RDsd010',
    created_by: 'ceo-001'
  },
  {
    id: '91d6dfb6-cf48-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'آبگیر صنعتی',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMwc001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '97781e63-cf47-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'آبلیمو گیری',
    description: null,
    category: 'ماشین آلات',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMl001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: '9b769990-c5cb-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'پهپاد سمپاش 20 لیتری',
    description: null,
    category: 'پهپاد کشاورزی',
    price: 1100000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RDsd020',
    created_by: 'ceo-001'
  },
  {
    id: 'a2a66b02-cf45-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'دستگاه تولید سس خرما',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMt030',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: 'abb035c9-c5cb-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'پهپاد سمپاش 30 لیتری',
    description: null,
    category: 'پهپاد کشاورزی',
    price: 1499999900.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RDsd030',
    created_by: 'ceo-001'
  },
  {
    id: 'bfccd89f-cf45-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'دستگاه تولید شکلات خرما',
    description: null,
    category: 'ماشین آلات',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMt040',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: 'c051587f-cf8a-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهپاد s50 pro پنجاه لیتری',
    description: null,
    category: 'پهپاد کشاورزی',
    price: 1825000000.00,
    currency: 'IRR',
    status: 'active',
    sku: null,
    created_by: '3cbba416-c557-11f0-adb4-7a654ee49283'
  },
  {
    id: 'c6bfb079-c5d4-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'موتور دریفت تک نفره',
    description: null,
    category: 'موتور',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RDt001',
    created_by: 'ceo-001'
  },
  {
    id: 'cc1d5c9e-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'میز کار آهنگری',
    description: null,
    category: 'میز کارگاهی',
    price: 234000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RTb001',
    created_by: 'ceo-001'
  },
  {
    id: 'd303285e-c5d4-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'موتور دریفت دو نفره',
    description: null,
    category: 'موتور',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RDt002',
    created_by: 'ceo-001'
  },
  {
    id: 'd663bc3b-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'صندلی گردان',
    description: 'سایز بزرگ',
    category: 'صندلی کارگاهی',
    price: 125000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RCr01',
    created_by: 'ceo-001'
  },
  {
    id: 'df631dee-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'صندلی چهارگوش',
    description: null,
    category: 'صندلی کارگاهی',
    price: 127000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RCs01',
    created_by: 'ceo-001'
  },
  {
    id: 'e0541cf7-cf48-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'نوار شستشو',
    description: null,
    category: 'ماشین آلات',
    price: 1.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RMwt001',
    created_by: 'e4c86d62-cdcd-11f0-8238-d2bc93e1fc48'
  },
  {
    id: 'e56fc855-c5ce-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'ترولی صنعتی',
    description: null,
    category: 'میز کارگاهی',
    price: 130000000.00,
    currency: 'IRR',
    status: 'active',
    sku: 'RTt001',
    created_by: 'ceo-001'
  },
  {
    id: 'e57797bb-cf89-11f0-b141-c274cc12da08',
    tenant_id: 'rabin',
    name: 'پهپاد s20 بیست لیتری',
    description: 'ورژن استاندارد 1.135 میلیون تومان\nورژن اقتصادی 735 میلیون تومان قیمت هر باتری 77 میلیون تومان\n',
    category: 'پهپاد کشاورزی',
    price: 735000000.00,
    currency: 'IRR',
    status: 'active',
    sku: null,
    created_by: '3cbba416-c557-11f0-adb4-7a654ee49283'
  },
  {
    id: 'e6d689ec-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'صندلی صنعتی 3',
    description: 'سایز کوچک',
    category: 'صندلی کارگاهی',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RCr02',
    created_by: 'ceo-001'
  },
  {
    id: 'f4c5a90b-c5cc-11f0-adb4-7a654ee49283',
    tenant_id: 'rabin',
    name: 'میر کار مونتاژ',
    description: null,
    category: 'میز کارگاهی',
    price: 2.00,
    currency: 'IRR',
    status: 'inactive',
    sku: 'RTa01',
    created_by: 'ceo-001'
  }
];

async function importAllProducts() {
  let connection;
  
  try {
    console.log('اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log(`شروع ایمپورت ${products.length} محصول...`);
    
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
        console.log(`✅ ${successCount}/${products.length} - ${product.name}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ خطا در محصول ${product.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 ایمپورت محصولات تمام شد!');
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ خطا: ${errorCount}`);
    
    // نمایش آمار نهایی
    const [productCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM products WHERE tenant_id = ?', 
      ['rabin']
    );
    
    console.log(`\n📊 تعداد کل محصولات تنانت rabin: ${productCount[0].count}`);
    
  } catch (error) {
    console.error('❌ خطا در ایمپورت محصولات:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// اجرای اسکریپت
importAllProducts();