async function testRabinLogin() {
  console.log('🧪 تست صفحه login tenant rabin...\n');
  
  try {
    // 1. تست دسترسی به صفحه login
    console.log('1️⃣ تست دسترسی به صفحه login...');
    const loginPageResponse = await fetch('http://localhost:3000/rabin/login');
    console.log(`   📡 Status: ${loginPageResponse.status}`);
    
    if (loginPageResponse.ok) {
      console.log('   ✅ صفحه login در دسترس است');
      const html = await loginPageResponse.text();
      if (html.includes('rabin')) {
        console.log('   ✅ tenant key در صفحه نمایش داده می‌شود');
      } else {
        console.log('   ⚠️ tenant key در صفحه یافت نشد');
      }
    } else {
      const errorText = await loginPageResponse.text();
      console.log('   ❌ خطا در دسترسی به صفحه login:', errorText.substring(0, 200));
    }
    
    // 2. تست API login
    console.log('\n2️⃣ تست API login...');
    const loginData = {
      email: 'Robintejarat@gmail.com',
      password: 'admin123', // رمز عبور صحیح
      tenant_key: 'rabin'
    };
    
    console.log('   📝 ارسال داده‌های login:', {
      email: loginData.email,
      tenant_key: loginData.tenant_key,
      password: '***'
    });
    
    const loginResponse = await fetch('http://localhost:3000/api/tenant/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Key': 'rabin'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`   📡 Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('   ✅ Login API Success:');
      console.log('   📊 Response:', JSON.stringify(loginResult, null, 2));
    } else {
      const errorText = await loginResponse.text();
      console.log('   ❌ Login API Error:', errorText);
    }
    
    // 3. تست dashboard redirect
    console.log('\n3️⃣ تست redirect به dashboard...');
    const dashboardResponse = await fetch('http://localhost:3000/rabin/dashboard');
    console.log(`   📡 Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 302 || dashboardResponse.status === 307) {
      console.log('   ✅ Redirect به login (طبیعی است)');
    } else if (dashboardResponse.ok) {
      console.log('   ✅ Dashboard در دسترس است');
    } else {
      console.log('   ❌ مشکل در دسترسی به dashboard');
    }
    
    console.log('\n🎉 تست‌های rabin login کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

testRabinLogin();