async function testCEOMenuComplete() {
  console.log('🧪 تست کامل منوی CEO...\n');
  
  try {
    // 1. لاگین کردن
    console.log('1️⃣ لاگین به عنوان CEO...');
    const loginData = {
      email: 'Robintejarat@gmail.com',
      password: 'admin123',
      tenant_key: 'rabin'
    };
    
    const loginResponse = await fetch('http://localhost:3000/api/tenant/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Key': 'rabin'
      },
      body: JSON.stringify(loginData)
    });
    
    if (!loginResponse.ok) {
      console.log('❌ خطا در لاگین');
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ لاگین موفق');
    console.log(`   نقش کاربر: ${loginResult.user.role}`);
    
    // 2. تست API permissions
    console.log('\n2️⃣ تست API permissions...');
    const permissionsResponse = await fetch('http://localhost:3000/api/auth/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'rabin',
        'Cookie': `tenant_token=${token}`
      }
    });
    
    console.log(`   📡 Status: ${permissionsResponse.status}`);
    
    if (permissionsResponse.ok) {
      const permissionsResult = await permissionsResponse.json();
      console.log('✅ Permissions API Success');
      console.log(`   تعداد permissions: ${permissionsResult.data?.length || 0}`);
      
      if (permissionsResult.data && permissionsResult.data.length > 0) {
        console.log('\n📋 لیست permissions:');
        permissionsResult.data.forEach((perm, index) => {
          console.log(`   ${index + 1}. ${perm.module || perm.name || 'نامشخص'}`);
        });
      } else {
        console.log('⚠️ هیچ permission یافت نشد - این برای CEO طبیعی است');
      }
      
      // 3. بررسی ساختار منوی مورد انتظار
      console.log('\n3️⃣ ساختار منوی مورد انتظار:');
      const expectedMenu = [
        'داشبورد',
        'مدیریت فروش',
        '  - محصولات',
        '  - فروش‌ها',
        'مدیریت تجربه مشتری',
        '  - مشتریان',
        '  - مخاطبین',
        '  - باشگاه مشتریان',
        '  - بازخوردها',
        'مدیریت همکاران',
        '  - همکاران',
        '  - فعالیت‌ها',
        '  - تقویم',
        '  - وظایف',
        '  - مدیریت اسناد',
        '  - گزارش‌گیری',
        'مدیریت وظایف',
        'مانیتورینگ سیستم',
        'چت',
        'باشگاه مشتریان',
        'صدای رابین'
      ];
      
      expectedMenu.forEach(item => {
        console.log(`   ${item}`);
      });
      
      console.log('\n🎯 نتیجه‌گیری:');
      console.log('   ✅ لاگین CEO موفق');
      console.log('   ✅ API permissions در دسترس');
      console.log('   ✅ منوی سایدبار باید ساختار بالا را نمایش دهد');
      
    } else {
      const errorText = await permissionsResponse.text();
      console.log('❌ Permissions API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

testCEOMenuComplete();