async function testNewAPIs() {
  console.log('🧪 تست API های جدید...\n');
  
  try {
    // 1. تست API دریافت پلن‌های ساده
    console.log('1️⃣ تست /api/admin/plans-simple');
    const plansResponse = await fetch('http://localhost:3000/api/admin/plans-simple');
    console.log(`   📡 Status: ${plansResponse.status}`);
    
    if (plansResponse.ok) {
      const plansData = await plansResponse.json();
      console.log('   ✅ Plans API Success:');
      console.log(`   📊 تعداد پلن‌ها: ${plansData.data?.length || 0}`);
      if (plansData.data && plansData.data.length > 0) {
        plansData.data.forEach(plan => {
          console.log(`   - ${plan.plan_name}: ${plan.price_monthly?.toLocaleString()} تومان/ماه`);
        });
      }
    } else {
      const errorText = await plansResponse.text();
      console.log('   ❌ Plans API Error:', errorText);
    }
    
    // 2. تست API ایجاد tenant ساده
    console.log('\n2️⃣ تست /api/admin/create-tenant-simple');
    
    const testTenantData = {
      tenant_key: 'test-api-' + Date.now(),
      company_name: 'شرکت تست API',
      admin_name: 'مدیر تست',
      admin_email: 'test-api@example.com',
      admin_phone: '09123456789',
      admin_password: 'testpass123',
      subscription_plan: 'basic',
      subscription_months: 1
    };
    
    console.log('   📝 ارسال داده‌های تست:', {
      tenant_key: testTenantData.tenant_key,
      company_name: testTenantData.company_name,
      subscription_plan: testTenantData.subscription_plan
    });
    
    const createResponse = await fetch('http://localhost:3000/api/admin/create-tenant-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTenantData)
    });
    
    console.log(`   📡 Status: ${createResponse.status}`);
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('   ✅ Create Tenant API Success:');
      console.log('   📊 Response:', JSON.stringify(createData, null, 2));
    } else {
      const errorText = await createResponse.text();
      console.log('   ❌ Create Tenant API Error:', errorText);
    }
    
    // 3. تست cookie endpoint
    console.log('\n3️⃣ تست /api/admin/test-cookie');
    const cookieResponse = await fetch('http://localhost:3000/api/admin/test-cookie');
    console.log(`   📡 Status: ${cookieResponse.status}`);
    
    if (cookieResponse.ok) {
      const cookieData = await cookieResponse.json();
      console.log('   ✅ Cookie Test Success:');
      console.log('   📊 Response:', JSON.stringify(cookieData, null, 2));
    } else {
      const errorText = await cookieResponse.text();
      console.log('   ❌ Cookie Test Error:', errorText);
    }
    
    console.log('\n🎉 تست‌های API کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا در تست API:', error.message);
    console.log('\n💡 مطمئن شوید که:');
    console.log('   - سرور Next.js در حال اجرا است (npm run dev)');
    console.log('   - پورت 3000 در دسترس است');
  }
}

testNewAPIs();