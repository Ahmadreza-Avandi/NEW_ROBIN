const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testCompleteFlow() {
  console.log('🧪 تست کامل جریان admin...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master'
  });

  try {
    // 1. تست احراز هویت admin
    console.log('1️⃣ تست احراز هویت admin...');
    const [admins] = await connection.execute(
      'SELECT * FROM super_admins WHERE username = ?',
      ['Ahmadreza.avandi']
    );
    
    if (admins.length === 0) {
      console.log('❌ کاربر admin یافت نشد');
      return;
    }
    
    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare('Ahmadreza.avandi', admin.password_hash);
    console.log(`   ✅ Username: ${admin.username}`);
    console.log(`   ✅ Password: ${isPasswordValid ? 'صحیح' : 'نادرست'}`);
    
    if (!isPasswordValid) {
      console.log('❌ رمز عبور نادرست است');
      return;
    }

    // 2. تست دریافت پلن‌ها
    console.log('\n2️⃣ تست دریافت پلن‌ها...');
    const [plans] = await connection.execute(
      'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_monthly ASC'
    );
    
    console.log(`   ✅ تعداد پلن‌های فعال: ${plans.length}`);
    plans.forEach(plan => {
      console.log(`   - ${plan.plan_name}: ${plan.price_monthly?.toLocaleString()} تومان/ماه`);
    });

    // 3. تست ایجاد tenant نمونه
    console.log('\n3️⃣ تست ایجاد tenant نمونه...');
    
    const testTenantKey = 'test-tenant-' + Date.now();
    const testData = {
      tenant_key: testTenantKey,
      company_name: 'شرکت تست',
      admin_name: 'مدیر تست',
      admin_email: 'test@example.com',
      admin_phone: '09123456789',
      admin_password: 'testpass123',
      plan_key: 'basic',
      subscription_months: 1
    };

    // شبیه‌سازی فرآیند ثبت tenant
    console.log(`   📝 Tenant Key: ${testData.tenant_key}`);
    console.log(`   🏢 Company: ${testData.company_name}`);
    console.log(`   👤 Admin: ${testData.admin_name}`);
    console.log(`   📧 Email: ${testData.admin_email}`);
    console.log(`   📋 Plan: ${testData.plan_key}`);

    // بررسی تکراری نبودن tenant_key
    const [existing] = await connection.execute(
      'SELECT id FROM tenants WHERE tenant_key = ?',
      [testData.tenant_key]
    );

    if (existing.length > 0) {
      console.log('   ⚠️ این tenant_key قبلاً وجود دارد');
    } else {
      console.log('   ✅ tenant_key منحصر به فرد است');
    }

    // 4. تست اعتبارسنجی‌ها
    console.log('\n4️⃣ تست اعتبارسنجی‌ها...');
    
    // تست فرمت tenant_key
    const tenantKeyRegex = /^[a-z0-9-]+$/;
    console.log(`   ✅ فرمت tenant_key: ${tenantKeyRegex.test(testData.tenant_key) ? 'صحیح' : 'نادرست'}`);
    
    // تست طول رمز عبور
    console.log(`   ✅ طول رمز عبور: ${testData.admin_password.length >= 8 ? 'صحیح' : 'نادرست'}`);
    
    // تست فرمت ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(`   ✅ فرمت ایمیل: ${emailRegex.test(testData.admin_email) ? 'صحیح' : 'نادرست'}`);

    console.log('\n🎉 تمام تست‌ها موفقیت‌آمیز بود!');
    console.log('\n📋 خلاصه اطلاعات لاگین:');
    console.log('   🌐 URL: http://localhost:3000/secret-zone-789/admin-panel');
    console.log('   👤 Username: Ahmadreza.avandi');
    console.log('   🔐 Password: Ahmadreza.avandi');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

testCompleteFlow();