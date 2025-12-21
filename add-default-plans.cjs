const mysql = require('mysql2/promise');

async function addDefaultPlans() {
  console.log('📋 اضافه کردن پلن‌های پیش‌فرض...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master'
  });

  try {
    // بررسی وجود پلن‌ها
    const [existingPlans] = await connection.execute('SELECT COUNT(*) as count FROM subscription_plans');
    
    if (existingPlans[0].count > 0) {
      console.log('✅ پلن‌ها قبلاً وجود دارند');
      return;
    }

    // اضافه کردن پلن‌های پیش‌فرض
    const plans = [
      {
        plan_key: 'basic',
        plan_name: 'پایه',
        description: 'پلن پایه برای شرکت‌های کوچک',
        price_monthly: 50000,
        price_yearly: 500000,
        max_users: 5,
        max_customers: 100,
        max_storage_mb: 1024,
        features: JSON.stringify(['customers', 'products', 'sales', 'basic_reports'])
      },
      {
        plan_key: 'professional',
        plan_name: 'حرفه‌ای',
        description: 'پلن حرفه‌ای برای شرکت‌های متوسط',
        price_monthly: 100000,
        price_yearly: 1000000,
        max_users: 15,
        max_customers: 500,
        max_storage_mb: 5120,
        features: JSON.stringify(['customers', 'products', 'sales', 'advanced_reports', 'calendar', 'tasks'])
      },
      {
        plan_key: 'enterprise',
        plan_name: 'سازمانی',
        description: 'پلن سازمانی برای شرکت‌های بزرگ',
        price_monthly: 200000,
        price_yearly: 2000000,
        max_users: -1, // نامحدود
        max_customers: -1, // نامحدود
        max_storage_mb: -1, // نامحدود
        features: JSON.stringify(['customers', 'products', 'sales', 'advanced_reports', 'calendar', 'tasks', 'chat', 'documents', 'api_access'])
      }
    ];

    for (const plan of plans) {
      await connection.execute(`
        INSERT INTO subscription_plans (
          plan_key, plan_name, description, price_monthly, price_yearly,
          max_users, max_customers, max_storage_mb, features, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        plan.plan_key, plan.plan_name, plan.description,
        plan.price_monthly, plan.price_yearly,
        plan.max_users, plan.max_customers, plan.max_storage_mb,
        plan.features
      ]);
      
      console.log(`✅ پلن ${plan.plan_name} اضافه شد`);
    }

    console.log('\n🎉 تمام پلن‌های پیش‌فرض اضافه شدند!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

addDefaultPlans();