#!/usr/bin/env node

/**
 * تست نهایی و جامع از تمام API های tenant
 */

const BASE_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function finalWebTest() {
  log('\n' + '='.repeat(70), 'blue');
  log('🌐 تست نهایی و جامع Tenant Filtering از وب', 'cyan');
  log('='.repeat(70), 'blue');

  // لاگین
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

  const apis = [
    { name: 'Products', endpoint: '/api/tenant/products', key: 'data' },
    { name: 'Sales', endpoint: '/api/tenant/sales', key: 'sales' },
    { name: 'Customers', endpoint: '/api/tenant/customers', key: 'customers' },
    { name: 'Activities', endpoint: '/api/tenant/activities', key: 'data' },
    { name: 'Customers Simple', endpoint: '/api/tenant/customers-simple?limit=100', key: 'data' },
  ];

  let totalRecords = 0;
  let totalWrongTenant = 0;
  const results = [];

  for (const api of apis) {
    log(`\n📡 تست ${api.name} API...`, 'yellow');
    
    try {
      const response = await fetch(`${BASE_URL}${api.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Key': 'rabin',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        log(`   ❌ خطا: ${data.message}`, 'red');
        results.push({ api: api.name, status: 'error', message: data.message });
        continue;
      }

      const records = data[api.key] || data.data || [];
      const count = Array.isArray(records) ? records.length : 0;
      
      log(`   ✅ دریافت ${count} رکورد`, 'green');
      totalRecords += count;

      // بررسی tenant_key
      if (Array.isArray(records) && records.length > 0) {
        const wrongTenant = records.filter(r => r.tenant_key && r.tenant_key !== 'rabin');
        
        if (wrongTenant.length > 0) {
          log(`   ❌ ${wrongTenant.length} رکورد از tenant دیگر!`, 'red');
          totalWrongTenant += wrongTenant.length;
          
          wrongTenant.slice(0, 3).forEach(r => {
            const name = r.name || r.title || r.customer_name || r.id;
            log(`      - ${name} (tenant: ${r.tenant_key})`, 'red');
          });
          
          results.push({ 
            api: api.name, 
            status: 'wrong_tenant', 
            count, 
            wrongCount: wrongTenant.length 
          });
        } else {
          log(`   ✅ همه رکوردها متعلق به tenant rabin هستند`, 'green');
          results.push({ api: api.name, status: 'ok', count });
        }

        // نمایش چند نمونه
        if (records.length > 0 && records.length <= 5) {
          log(`   📋 نمونه‌ها:`, 'cyan');
          records.forEach((r, index) => {
            const name = r.name || r.title || r.customer_name || r.id;
            log(`      ${index + 1}. ${name} (tenant: ${r.tenant_key})`, 'blue');
          });
        }
      }
    } catch (error) {
      log(`   ❌ خطا در درخواست: ${error.message}`, 'red');
      results.push({ api: api.name, status: 'error', message: error.message });
    }
  }

  // خلاصه نهایی
  log('\n' + '='.repeat(70), 'blue');
  log('📊 خلاصه نهایی:', 'cyan');
  log('='.repeat(70), 'blue');

  log(`\n📈 آمار کلی:`, 'magenta');
  log(`   کل رکوردهای دریافت شده: ${totalRecords}`, 'blue');
  log(`   رکوردهای اشتباه: ${totalWrongTenant}`, totalWrongTenant > 0 ? 'red' : 'green');

  log(`\n📋 نتایج تست‌ها:`, 'magenta');
  results.forEach(result => {
    const emoji = result.status === 'ok' ? '✅' : 
                 result.status === 'error' ? '❌' : '⚠️';
    const color = result.status === 'ok' ? 'green' : 
                 result.status === 'error' ? 'red' : 'yellow';
    
    log(`   ${emoji} ${result.api}: ${result.status}`, color);
    if (result.count !== undefined) {
      log(`      رکوردها: ${result.count}`, 'blue');
    }
    if (result.wrongCount !== undefined) {
      log(`      اشتباه: ${result.wrongCount}`, 'red');
    }
    if (result.message) {
      log(`      پیام: ${result.message}`, 'yellow');
    }
  });

  log('\n' + '='.repeat(70), 'blue');
  
  if (totalWrongTenant === 0) {
    log('🎉 نتیجه نهایی: همه چیز درست کار میکنه!', 'green');
    log('   هیچ مشکل Tenant Filtering وجود ندارد.', 'green');
    log('   تمام داده‌ها متعلق به tenant "rabin" هستند.', 'green');
  } else {
    log('⚠️  نتیجه نهایی: مشکل Tenant Filtering وجود دارد!', 'red');
    log(`   ${totalWrongTenant} رکورد از tenant دیگر یافت شد.`, 'red');
  }
  
  log('='.repeat(70), 'blue');
}

finalWebTest().catch(error => {
  log(`\n❌ خطا: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
