const mysql = require('mysql2/promise');

async function checkPlansTable() {
  console.log('🔍 بررسی جدول subscription_plans...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master'
  });

  try {
    // بررسی وجود جدول
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'saas_master' AND TABLE_NAME = 'subscription_plans'
    `);
    
    if (tables.length === 0) {
      console.log('❌ جدول subscription_plans وجود ندارد!');
      console.log('📋 ایجاد جدول...');
      
      await connection.execute(`
        CREATE TABLE subscription_plans (
          id int(11) NOT NULL AUTO_INCREMENT,
          plan_key varchar(50) NOT NULL,
          plan_name varchar(100) NOT NULL,
          description text,
          price_monthly decimal(10,2) NOT NULL,
          price_yearly decimal(10,2) NOT NULL,
          max_users int(11) DEFAULT 5,
          max_customers int(11) DEFAULT 100,
          max_storage_mb int(11) DEFAULT 1024,
          features JSON,
          is_active tinyint(1) DEFAULT 1,
          created_at timestamp NOT NULL DEFAULT current_timestamp(),
          updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (id),
          UNIQUE KEY plan_key (plan_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ جدول ایجاد شد');
    } else {
      console.log('✅ جدول subscription_plans وجود دارد');
    }

    // نمایش پلن‌های موجود
    const [plans] = await connection.execute('SELECT * FROM subscription_plans');
    console.log(`📊 تعداد پلن‌های موجود: ${plans.length}`);
    
    if (plans.length === 0) {
      console.log('📋 اضافه کردن پلن‌های پیش‌فرض...');
      
      const defaultPlans = [
        ['basic', 'پایه', 'پلن پایه برای شرکت‌های کوچک', 50000, 500000, 5, 100, 1024, '["customers", "products", "sales"]'],
        ['professional', 'حرفه‌ای', 'پلن حرفه‌ای برای شرکت‌های متوسط', 100000, 1000000, 15, 500, 5120, '["customers", "products", "sales", "reports"]'],
        ['enterprise', 'سازمانی', 'پلن سازمانی برای شرکت‌های بزرگ', 200000, 2000000, -1, -1, -1, '["customers", "products", "sales", "reports", "api"]']
      ];
      
      for (const plan of defaultPlans) {
        await connection.execute(`
          INSERT INTO subscription_plans 
          (plan_key, plan_name, description, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, features)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, plan);
        console.log(`✅ پلن ${plan[1]} اضافه شد`);
      }
    } else {
      console.log('\n📋 پلن‌های موجود:');
      plans.forEach(plan => {
        console.log(`   - ${plan.plan_name} (${plan.plan_key}): ${plan.price_monthly.toLocaleString()} تومان/ماه`);
      });
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkPlansTable();