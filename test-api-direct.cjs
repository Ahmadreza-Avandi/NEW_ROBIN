const mysql = require('mysql2/promise');

async function testAPIDirect() {
  console.log('🧪 تست مستقیم API و دیتابیس...\n');
  
  try {
    // 1. تست اتصال به دیتابیس
    console.log('1️⃣ تست اتصال به دیتابیس...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'saas_master'
    });
    
    // 2. تست دریافت پلن‌ها
    console.log('2️⃣ تست دریافت پلن‌ها از دیتابیس...');
    const [plans] = await connection.execute(
      'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_monthly ASC'
    );
    
    console.log(`   ✅ تعداد پلن‌های فعال: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`   - ${plan.plan_name}: ${plan.price_monthly?.toLocaleString()} تومان/ماه`);
    });
    
    // 3. تست دریافت tenants
    console.log('\n3️⃣ تست دریافت tenants از دیتابیس...');
    const [tenants] = await connection.execute(
      'SELECT COUNT(*) as total FROM tenants WHERE is_deleted = false'
    );
    
    console.log(`   ✅ تعداد tenants: ${tenants[0].total}`);
    
    // 4. تست ساختار جداول
    console.log('\n4️⃣ بررسی ساختار جداول...');
    
    const [planColumns] = await connection.execute('DESCRIBE subscription_plans');
    console.log('   📋 ستون‌های جدول subscription_plans:');
    planColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    await connection.end();
    
    // 5. تست HTTP API
    console.log('\n5️⃣ تست HTTP API...');
    
    // ایجاد توکن تست
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    const testToken = jwt.sign(
      { id: 1, email: 'ahmadrezaavandi@gmail.com', name: 'احمدرضا اوندی', role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('   🔐 توکن تست ایجاد شد');
    
    // تست API با fetch
    try {
      const response = await fetch('http://localhost:3000/api/admin/plans', {
        method: 'GET',
        headers: {
          'Cookie': `admin_token=${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   📡 Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API Response:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('   ❌ API Error:', errorText);
      }
      
    } catch (fetchError) {
      console.log('   ❌ Fetch Error:', fetchError.message);
      console.log('   💡 مطمئن شوید که سرور Next.js در حال اجرا است');
    }
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testAPIDirect();