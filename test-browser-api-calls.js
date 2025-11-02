#!/usr/bin/env node

/**
 * تست برای شبیه‌سازی دقیق درخواست‌های مرورگر
 * این اسکریپت دقیقا مثل مرورگر عمل میکنه
 */

const BASE_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBrowserAPICalls() {
  log('\n' + '='.repeat(60), 'blue');
  log('🌐 تست شبیه‌سازی درخواست‌های مرورگر', 'cyan');
  log('='.repeat(60), 'blue');

  // مرحله 1: لاگین
  log('\n🔐 مرحله 1: لاگین با tenant rabin...', 'yellow');
  const loginResponse = await fetch(`${BASE_URL}/api/tenant/auth/login`, {
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

  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    log('❌ لاگین ناموفق', 'red');
    return;
  }

  const token = loginData.token;
  log('✅ لاگین موفق', 'green');
  log(`   Token: ${token.substring(0, 20)}...`, 'blue');

  // مرحله 2: تست Activities API (مثل مرورگر)
  log('\n🎯 مرحله 2: درخواست Activities (شبیه‌سازی مرورگر)...', 'yellow');
  
  // درخواست بدون هیچ فیلتری (مثل اولین بار که صفحه باز میشه)
  const activitiesResponse = await fetch(`${BASE_URL}/api/tenant/activities`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // شبیه‌سازی header های مرورگر
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': `${BASE_URL}/rabin/dashboard/activities`
    }
  });

  log(`   Status: ${activitiesResponse.status}`, 'blue');
  
  const activitiesData = await activitiesResponse.json();
  
  if (activitiesData.success) {
    const activities = activitiesData.data || [];
    log(`   ✅ دریافت ${activities.length} فعالیت`, 'green');
    
    // بررسی دقیق tenant_key
    log('\n📊 تحلیل tenant_key فعالیت‌ها:', 'cyan');
    
    const tenantGroups = {};
    activities.forEach(activity => {
      const tenant = activity.tenant_key || 'NULL';
      if (!tenantGroups[tenant]) {
        tenantGroups[tenant] = [];
      }
      tenantGroups[tenant].push(activity);
    });
    
    Object.keys(tenantGroups).forEach(tenant => {
      const count = tenantGroups[tenant].length;
      const color = tenant === 'rabin' ? 'green' : 'red';
      log(`   ${tenant}: ${count} فعالیت`, color);
      
      // نمایش نمونه‌ها
      if (tenant !== 'rabin') {
        log(`   ⚠️  فعالیت‌های اشتباه:`, 'yellow');
        tenantGroups[tenant].slice(0, 3).forEach(a => {
          log(`      - ${a.title} (customer: ${a.customer_name}, tenant: ${a.tenant_key})`, 'red');
        });
      }
    });
    
    // نمایش همه فعالیت‌ها برای دیباگ
    if (activities.length <= 10) {
      log('\n📋 لیست کامل فعالیت‌ها:', 'cyan');
      activities.forEach((a, index) => {
        log(`   ${index + 1}. ${a.title} - ${a.customer_name} (tenant: ${a.tenant_key})`, 'blue');
      });
    }
  } else {
    log(`   ❌ خطا: ${activitiesData.message}`, 'red');
  }

  // مرحله 3: تست با فیلتر customer_id
  log('\n🔍 مرحله 3: تست با فیلتر customer_id...', 'yellow');
  
  // ابتدا لیست مشتریان رو بگیریم
  const customersResponse = await fetch(`${BASE_URL}/api/tenant/customers-simple?limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  });
  
  const customersData = await customersResponse.json();
  if (customersData.success && customersData.data && customersData.data.length > 0) {
    const firstCustomer = customersData.data[0];
    log(`   تست با مشتری: ${firstCustomer.name} (id: ${firstCustomer.id})`, 'blue');
    
    const filteredActivitiesResponse = await fetch(
      `${BASE_URL}/api/tenant/activities?customer_id=${firstCustomer.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Key': 'rabin',
          'Content-Type': 'application/json'
        }
      }
    );
    
    const filteredActivitiesData = await filteredActivitiesResponse.json();
    if (filteredActivitiesData.success) {
      const filtered = filteredActivitiesData.data || [];
      log(`   ✅ دریافت ${filtered.length} فعالیت برای این مشتری`, 'green');
      
      // بررسی tenant_key
      const wrongTenant = filtered.filter(a => a.tenant_key !== 'rabin');
      if (wrongTenant.length > 0) {
        log(`   ❌ ${wrongTenant.length} فعالیت از tenant دیگر!`, 'red');
      } else {
        log(`   ✅ همه فعالیت‌ها متعلق به tenant rabin هستند`, 'green');
      }
    }
  }

  log('\n' + '='.repeat(60), 'blue');
  log('✅ تست تمام شد', 'green');
  log('='.repeat(60), 'blue');
}

testBrowserAPICalls().catch(error => {
  log(`\n❌ خطا: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
