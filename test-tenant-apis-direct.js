#!/usr/bin/env node

/**
 * تست مستقیم API های tenant برای بررسی فیلتر tenant_key
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

async function testTenantAPIs() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔍 تست مستقیم API های Tenant', 'cyan');
  log('='.repeat(60), 'blue');

  // لاگین با tenant rabin
  log('\n🔐 لاگین با tenant rabin...', 'yellow');
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

  // تست Products API
  log('\n📦 تست Products API...', 'yellow');
  const productsResponse = await fetch(`${BASE_URL}/api/tenant/products`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  });

  const productsData = await productsResponse.json();
  if (productsData.success) {
    const products = productsData.data || [];
    log(`  ✅ دریافت ${products.length} محصول`, 'green');
    
    // بررسی tenant_key
    const wrongTenantProducts = products.filter(p => p.tenant_key && p.tenant_key !== 'rabin');
    if (wrongTenantProducts.length > 0) {
      log(`  ❌ ${wrongTenantProducts.length} محصول از tenant دیگر یافت شد!`, 'red');
      wrongTenantProducts.slice(0, 3).forEach(p => {
        log(`     - ${p.name} (tenant: ${p.tenant_key})`, 'red');
      });
    } else {
      log(`  ✅ همه محصولات متعلق به tenant rabin هستند`, 'green');
    }
    
    // نمایش چند محصول نمونه
    if (products.length > 0) {
      log(`  📋 نمونه محصولات:`, 'cyan');
      products.slice(0, 3).forEach(p => {
        log(`     - ${p.name} (tenant: ${p.tenant_key})`, 'blue');
      });
    }
  } else {
    log(`  ❌ خطا: ${productsData.message}`, 'red');
  }

  // تست Sales API
  log('\n💰 تست Sales API...', 'yellow');
  const salesResponse = await fetch(`${BASE_URL}/api/tenant/sales`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  });

  const salesData = await salesResponse.json();
  if (salesData.success) {
    const sales = salesData.sales || salesData.data || [];
    log(`  ✅ دریافت ${sales.length} فروش`, 'green');
    
    // بررسی tenant_key
    const wrongTenantSales = sales.filter(s => s.tenant_key && s.tenant_key !== 'rabin');
    if (wrongTenantSales.length > 0) {
      log(`  ❌ ${wrongTenantSales.length} فروش از tenant دیگر یافت شد!`, 'red');
      wrongTenantSales.slice(0, 3).forEach(s => {
        log(`     - ${s.customer_name} (tenant: ${s.tenant_key})`, 'red');
      });
    } else {
      log(`  ✅ همه فروش‌ها متعلق به tenant rabin هستند`, 'green');
    }
    
    // نمایش چند فروش نمونه
    if (sales.length > 0) {
      log(`  📋 نمونه فروش‌ها:`, 'cyan');
      sales.slice(0, 3).forEach(s => {
        log(`     - ${s.customer_name} - ${s.total_amount} (tenant: ${s.tenant_key})`, 'blue');
      });
    }
  } else {
    log(`  ❌ خطا: ${salesData.message}`, 'red');
  }

  // تست Customers API
  log('\n👥 تست Customers API...', 'yellow');
  const customersResponse = await fetch(`${BASE_URL}/api/tenant/customers?limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  });

  const customersData = await customersResponse.json();
  if (customersData.success) {
    const customers = customersData.customers || customersData.data || [];
    log(`  ✅ دریافت ${customers.length} مشتری`, 'green');
    
    // بررسی tenant_key
    const wrongTenantCustomers = customers.filter(c => c.tenant_key && c.tenant_key !== 'rabin');
    if (wrongTenantCustomers.length > 0) {
      log(`  ❌ ${wrongTenantCustomers.length} مشتری از tenant دیگر یافت شد!`, 'red');
      wrongTenantCustomers.slice(0, 3).forEach(c => {
        log(`     - ${c.name} (tenant: ${c.tenant_key})`, 'red');
      });
    } else {
      log(`  ✅ همه مشتریان متعلق به tenant rabin هستند`, 'green');
    }
    
    // نمایش چند مشتری نمونه
    if (customers.length > 0) {
      log(`  📋 نمونه مشتریان:`, 'cyan');
      customers.slice(0, 3).forEach(c => {
        log(`     - ${c.name} (tenant: ${c.tenant_key})`, 'blue');
      });
    }
  } else {
    log(`  ❌ خطا: ${customersData.message}`, 'red');
  }

  // تست Activities API
  log('\n🎯 تست Activities API...', 'yellow');
  const activitiesResponse = await fetch(`${BASE_URL}/api/tenant/activities?limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  });

  const activitiesData = await activitiesResponse.json();
  if (activitiesData.success) {
    const activities = activitiesData.data || [];
    log(`  ✅ دریافت ${activities.length} فعالیت`, 'green');
    
    // بررسی tenant_key
    const wrongTenantActivities = activities.filter(a => a.tenant_key && a.tenant_key !== 'rabin');
    if (wrongTenantActivities.length > 0) {
      log(`  ❌ ${wrongTenantActivities.length} فعالیت از tenant دیگر یافت شد!`, 'red');
      wrongTenantActivities.slice(0, 3).forEach(a => {
        log(`     - ${a.title} (tenant: ${a.tenant_key})`, 'red');
      });
    } else {
      log(`  ✅ همه فعالیت‌ها متعلق به tenant rabin هستند`, 'green');
    }
    
    // نمایش چند فعالیت نمونه
    if (activities.length > 0) {
      log(`  📋 نمونه فعالیت‌ها:`, 'cyan');
      activities.slice(0, 3).forEach(a => {
        log(`     - ${a.title} - ${a.customer_name} (tenant: ${a.tenant_key})`, 'blue');
      });
    }
  } else {
    log(`  ❌ خطا: ${activitiesData.message}`, 'red');
  }

  log('\n' + '='.repeat(60), 'blue');
  log('✅ تست تمام شد', 'green');
  log('='.repeat(60), 'blue');
}

testTenantAPIs().catch(error => {
  log(`\n❌ خطا: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
