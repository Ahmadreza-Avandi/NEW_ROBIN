const fetch = require('node-fetch');

async function testAPIEndpoints() {
  const baseURL = 'http://localhost:3000';
  
  // شبیه‌سازی توکن (باید از مرورگر کپی کنی)
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // توکن واقعی رو اینجا بذار
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'X-Tenant-Key': 'rabin',
    'Content-Type': 'application/json'
  };

  console.log('🧪 تست API های مشتریان...\n');

  try {
    // تست API آمار
    console.log('📊 تست API آمار مشتریان...');
    const statsResponse = await fetch(`${baseURL}/api/tenant/customers/stats`, {
      headers
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ API آمار کار می‌کند:');
      console.log('  کل مشتریان:', statsData.data?.total_customers || 0);
      console.log('  فعال:', statsData.data?.active_customers || 0);
      console.log('  نیاز به پیگیری:', statsData.data?.follow_up_customers || 0);
      console.log('  سازمانی:', statsData.data?.enterprise_customers || 0);
      console.log('  میانگین رضایت:', statsData.data?.avg_satisfaction || 0);
      console.log('  ارزش کل:', (statsData.data?.total_potential_value || 0) / 1000000, 'میلیون تومان');
    } else {
      console.log('❌ API آمار خطا داد:', statsResponse.status);
      const errorText = await statsResponse.text();
      console.log('خطا:', errorText.substring(0, 200));
    }

    console.log('\n👥 تست API لیست مشتریان...');
    const customersResponse = await fetch(`${baseURL}/api/tenant/customers?page=1&limit=5`, {
      headers
    });
    
    if (customersResponse.ok) {
      const customersData = await customersResponse.json();
      console.log('✅ API لیست مشتریان کار می‌کند:');
      console.log('  تعداد مشتریان در صفحه:', customersData.customers?.length || 0);
      console.log('  کل صفحات:', customersData.pagination?.totalPages || 0);
      
      if (customersData.customers && customersData.customers.length > 0) {
        console.log('  نمونه مشتری اول:');
        const firstCustomer = customersData.customers[0];
        console.log(`    نام: ${firstCustomer.name}`);
        console.log(`    وضعیت: ${firstCustomer.status}`);
        console.log(`    بخش: ${firstCustomer.segment}`);
        console.log(`    اولویت: ${firstCustomer.priority}`);
      }
    } else {
      console.log('❌ API لیست مشتریان خطا داد:', customersResponse.status);
      const errorText = await customersResponse.text();
      console.log('خطا:', errorText.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
    console.log('\n💡 نکته: مطمئن شو که:');
    console.log('  1. سرور Next.js روی پورت 3000 در حال اجراست');
    console.log('  2. توکن معتبر در متغیر authToken قرار داده‌ای');
    console.log('  3. دیتابیس MySQL در حال اجراست');
  }
}

testAPIEndpoints();