#!/usr/bin/env node

/**
 * تست API لاگین
 */

const testTenantLogin = async () => {
  console.log('\n🔐 تست لاگین Tenant (rabin)...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/tenant/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Key': 'rabin'
      },
      body: JSON.stringify({
        email: 'Robintejarat@gmail.com',
        password: 'admin123',
        tenant_key: 'rabin'
      })
    });

    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ لاگین موفق!');
      console.log('🎫 Token:', data.token?.substring(0, 30) + '...');
    } else {
      console.log('\n❌ لاگین ناموفق:', data.message);
    }
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
};

const testAdminLogin = async () => {
  console.log('\n\n👑 تست لاگین Admin (Super Admin)...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Ahmadreza.avandi',
        password: 'Ahmadreza.avandi'
      })
    });

    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ لاگین موفق!');
    } else {
      console.log('\n❌ لاگین ناموفق:', data.message);
    }
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
};

// اجرای تست‌ها
(async () => {
  console.log('🚀 شروع تست لاگین...');
  console.log('⏳ لطفاً مطمئن شوید سرور در حال اجرا است (npm run dev)');
  console.log('=' .repeat(60));
  
  await testTenantLogin();
  await testAdminLogin();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ تست‌ها تمام شد');
})();
