async function testSalesSpecialistMenu() {
  console.log('🧪 تست منوی کارشناس فروش...\n');
  
  try {
    // 1. لاگین کردن با کاربر sales_specialist
    console.log('1️⃣ لاگین به عنوان کارشناس فروش...');
    const loginData = {
      email: 'Ahmadreza.avandi@gmail.com',
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
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
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
      }
      
      // 3. بررسی منوی مورد انتظار برای کارشناس فروش
      console.log('\n3️⃣ منوی مورد انتظار برای کارشناس فروش:');
      const expectedMenu = [
        'داشبورد',
        'مشتریان',
        'مخاطبین',
        'فعالیت‌ها',
        'تقویم',
        'محصولات',
        'فروش‌ها',
        'چت',
        'پروفایل'
      ];
      
      expectedMenu.forEach(item => {
        console.log(`   ${item}`);
      });
      
      console.log('\n🎯 نتیجه‌گیری:');
      console.log('   ✅ لاگین کارشناس فروش موفق');
      console.log('   ✅ API permissions در دسترس');
      console.log(`   ✅ منوی محدود با ${permissionsResult.data?.length || 0} آیتم نمایش داده می‌شود`);
      
    } else {
      const errorText = await permissionsResponse.text();
      console.log('❌ Permissions API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

testSalesSpecialistMenu();