const mysql = require('mysql2/promise');

async function fixPlanPrices() {
  console.log('💰 تصحیح قیمت‌های پلن‌ها...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master'
  });

  try {
    // به‌روزرسانی قیمت‌های صحیح
    const correctPrices = [
      { plan_key: 'basic', price_monthly: 50000, price_yearly: 500000 },
      { plan_key: 'professional', price_monthly: 100000, price_yearly: 1000000 },
      { plan_key: 'enterprise', price_monthly: 200000, price_yearly: 2000000 }
    ];

    for (const plan of correctPrices) {
      await connection.execute(`
        UPDATE subscription_plans 
        SET price_monthly = ?, price_yearly = ?
        WHERE plan_key = ?
      `, [plan.price_monthly, plan.price_yearly, plan.plan_key]);
      
      console.log(`✅ ${plan.plan_key}: ${plan.price_monthly.toLocaleString()} تومان/ماه`);
    }

    // نمایش قیمت‌های به‌روزرسانی شده
    console.log('\n📊 قیمت‌های جدید:');
    const [plans] = await connection.execute(
      'SELECT plan_key, plan_name, price_monthly, price_yearly FROM subscription_plans ORDER BY price_monthly ASC'
    );
    
    plans.forEach(plan => {
      console.log(`   ${plan.plan_name}: ${plan.price_monthly.toLocaleString()} تومان/ماه`);
    });

    console.log('\n🎉 قیمت‌ها تصحیح شدند!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

fixPlanPrices();