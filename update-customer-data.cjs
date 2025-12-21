const mysql = require('mysql2/promise');

async function updateCustomerData() {
  let connection;
  
  try {
    // اتصال به دیتابیس
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // به‌روزرسانی وضعیت مشتریان
    await connection.query(`
      UPDATE customers 
      SET 
        status = CASE 
          WHEN name LIKE '%رابین%' THEN 'active'
          WHEN name LIKE '%ارشاد%' THEN 'follow_up'
          ELSE 'active'
        END,
        segment = CASE 
          WHEN name LIKE '%رابین%' THEN 'enterprise'
          WHEN name LIKE '%ارشاد%' THEN 'small_business'
          ELSE 'individual'
        END,
        priority = CASE 
          WHEN name LIKE '%رابین%' THEN 'high'
          WHEN name LIKE '%ارشاد%' THEN 'medium'
          ELSE 'low'
        END,
        satisfaction_score = CASE 
          WHEN name LIKE '%رابین%' THEN 4.5
          WHEN name LIKE '%ارشاد%' THEN 3.8
          ELSE 4.0
        END,
        potential_value = CASE 
          WHEN name LIKE '%رابین%' THEN 50000000
          WHEN name LIKE '%ارشاد%' THEN 25000000
          ELSE 10000000
        END,
        actual_value = CASE 
          WHEN name LIKE '%رابین%' THEN 30000000
          WHEN name LIKE '%ارشاد%' THEN 15000000
          ELSE 5000000
        END,
        industry = CASE 
          WHEN name LIKE '%رابین%' THEN 'فناوری اطلاعات'
          WHEN name LIKE '%ارشاد%' THEN 'تجارت'
          ELSE 'خدمات'
        END,
        company_size = CASE 
          WHEN name LIKE '%رابین%' THEN '51-200'
          WHEN name LIKE '%ارشاد%' THEN '11-50'
          ELSE '1-10'
        END,
        city = CASE 
          WHEN name LIKE '%رابین%' THEN 'تهران'
          WHEN name LIKE '%ارشاد%' THEN 'سنندج'
          ELSE 'اصفهان'
        END,
        last_interaction = NOW() - INTERVAL FLOOR(RAND() * 30) DAY
      WHERE tenant_key = 'rabin'
    `);

    console.log('✅ وضعیت مشتریان به‌روزرسانی شد');

    // اضافه کردن چند مشتری نمونه بیشتر
    const sampleCustomers = [
      {
        name: 'علی احمدی',
        email: 'ali.ahmadi@example.com',
        phone: '09121234567',
        company_name: 'شرکت نوآوری پارس',
        status: 'active',
        segment: 'enterprise',
        priority: 'high',
        satisfaction_score: 4.2,
        potential_value: 75000000,
        actual_value: 45000000,
        industry: 'صنعت',
        city: 'تهران'
      },
      {
        name: 'فاطمه کریمی',
        email: 'fateme.karimi@example.com',
        phone: '09131234567',
        company_name: 'فروشگاه آنلاین کریمی',
        status: 'follow_up',
        segment: 'small_business',
        priority: 'medium',
        satisfaction_score: 3.9,
        potential_value: 20000000,
        actual_value: 8000000,
        industry: 'تجارت الکترونیک',
        city: 'شیراز'
      },
      {
        name: 'محمد رضایی',
        email: 'mohammad.rezaei@example.com',
        phone: '09141234567',
        status: 'inactive',
        segment: 'individual',
        priority: 'low',
        satisfaction_score: 2.5,
        potential_value: 5000000,
        actual_value: 0,
        industry: 'خدمات',
        city: 'مشهد'
      }
    ];

    for (const customer of sampleCustomers) {
      await connection.query(`
        INSERT INTO customers (
          tenant_key, name, email, phone, company_name, status, segment, priority,
          satisfaction_score, potential_value, actual_value, industry, city,
          created_by, created_at, updated_at, last_interaction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW() - INTERVAL FLOOR(RAND() * 15) DAY)
      `, [
        'rabin', customer.name, customer.email, customer.phone, customer.company_name || null,
        customer.status, customer.segment, customer.priority, customer.satisfaction_score,
        customer.potential_value, customer.actual_value, customer.industry, customer.city,
        'ceo-001'
      ]);
    }

    console.log('✅ مشتریان نمونه اضافه شدند');

    // نمایش آمار جدید
    const [newStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
        COUNT(CASE WHEN status = 'follow_up' THEN 1 END) as follow_up_customers,
        COUNT(CASE WHEN segment = 'enterprise' THEN 1 END) as enterprise_customers,
        AVG(COALESCE(satisfaction_score, 0)) as avg_satisfaction,
        SUM(COALESCE(potential_value, 0)) as total_potential_value,
        SUM(COALESCE(actual_value, 0)) as total_actual_value
      FROM customers 
      WHERE tenant_key = 'rabin'
    `);

    console.log('\n📊 آمار جدید مشتریان:');
    console.log('  کل مشتریان:', newStats[0].total_customers);
    console.log('  فعال:', newStats[0].active_customers);
    console.log('  غیرفعال:', newStats[0].inactive_customers);
    console.log('  نیاز به پیگیری:', newStats[0].follow_up_customers);
    console.log('  سازمانی:', newStats[0].enterprise_customers);
    console.log('  میانگین رضایت:', parseFloat(newStats[0].avg_satisfaction).toFixed(1));
    console.log('  ارزش کل بالقوه:', (newStats[0].total_potential_value / 1000000).toFixed(1), 'میلیون تومان');
    console.log('  ارزش کل واقعی:', (newStats[0].total_actual_value / 1000000).toFixed(1), 'میلیون تومان');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

updateCustomerData();