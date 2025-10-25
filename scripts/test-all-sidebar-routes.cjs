#!/usr/bin/env node

/**
 * تست کامل همه روت‌های sidebar
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const DEMO_EMAIL = 'demo@gmail.com';
const DEMO_PASSWORD = 'admin123';

// لیست کامل روت‌های sidebar
const sidebarRoutes = [
  { name: 'داشبورد', path: '/dashboard', api: '/api/tenant/dashboard' },
  { name: 'مشتریان', path: '/dashboard/customers', api: '/api/tenant/customers' },
  { name: 'مخاطبین', path: '/dashboard/contacts', api: '/api/tenant/contacts' },
  { name: 'فعالیت‌ها', path: '/dashboard/activities', api: '/api/tenant/activities' },
  { name: 'همکاران', path: '/dashboard/coworkers', api: '/api/tenant/users' },
  { name: 'وظایف', path: '/dashboard/tasks', api: '/api/tenant/tasks' },
  { name: 'تقویم', path: '/dashboard/calendar', api: null }, // فرانت‌اند
  { name: 'فروش‌ها', path: '/dashboard/sales', api: '/api/tenant/sales' },
  { name: 'معاملات', path: '/dashboard/deals', api: '/api/tenant/deals' },
  { name: 'محصولات', path: '/dashboard/products', api: '/api/tenant/products' },
  { name: 'گزارش‌گیری', path: '/dashboard/reports', api: '/api/tenant/reports' },
  { name: 'مدیریت اسناد', path: '/dashboard/documents', api: '/api/tenant/documents' },
  { name: 'چت', path: '/dashboard/chat', api: '/api/chat/users' },
  { name: 'باشگاه مشتریان', path: '/dashboard/customer-club', api: null },
  { name: 'مانیتورینگ سیستم', path: '/dashboard/system-monitoring', api: '/api/tenant/monitoring' },
  { name: 'پروفایل', path: '/dashboard/profile', api: '/api/tenant/profile' },
];

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Script',
        ...options.headers
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testAllSidebarRoutes() {
  console.log('🧪 تست کامل همه روت‌های Sidebar...\n');

  try {
    // لاگین
    console.log('🔐 لاگین...');
    const loginResponse = await makeRequest(`${BASE_URL}/api/tenant/auth/login`, {
      method: 'POST',
      headers: { 'X-Tenant-Key': 'demo' },
      body: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        tenant_key: 'demo'
      }
    });

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ لاگین ناموفق');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ لاگین موفق\n');

    // تست هر روت
    const results = {
      success: [],
      failed: [],
      noApi: []
    };

    for (const route of sidebarRoutes) {
      console.log(`📍 ${route.name} (${route.path})`);

      if (!route.api) {
        console.log('   ℹ️  فقط فرانت‌اند (بدون API)\n');
        results.noApi.push(route.name);
        continue;
      }

      try {
        const response = await makeRequest(`${BASE_URL}${route.api}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Key': 'demo'
          }
        });

        console.log(`   وضعیت: ${response.status}`);

        if (response.status === 200) {
          if (response.data.success !== false) {
            // بررسی tenant isolation
            const data = response.data.data || response.data.customers || 
                        response.data.users || response.data.activities || [];
            
            if (Array.isArray(data)) {
              const nonDemoItems = data.filter(item => 
                item.tenant_key && item.tenant_key !== 'demo'
              );

              if (nonDemoItems.length > 0) {
                console.log(`   ⚠️  ${nonDemoItems.length} آیتم از tenant های دیگر!`);
                results.failed.push({
                  name: route.name,
                  reason: 'cross-tenant contamination'
                });
              } else {
                console.log(`   ✅ موفق - ${data.length} آیتم (فقط demo)`);
                results.success.push(route.name);
              }
            } else {
              console.log(`   ✅ موفق`);
              results.success.push(route.name);
            }
          } else {
            console.log(`   ❌ خطا: ${response.data.message}`);
            results.failed.push({
              name: route.name,
              reason: response.data.message
            });
          }
        } else if (response.status === 404) {
          console.log(`   ⚠️  API موجود نیست`);
          results.failed.push({
            name: route.name,
            reason: 'API not found'
          });
        } else {
          console.log(`   ❌ خطا: ${response.status}`);
          results.failed.push({
            name: route.name,
            reason: `HTTP ${response.status}`
          });
        }

      } catch (error) {
        console.log(`   ❌ خطا: ${error.message}`);
        results.failed.push({
          name: route.name,
          reason: error.message
        });
      }

      console.log('');
    }

    // خلاصه نهایی
    console.log('═══════════════════════════════════════');
    console.log('📊 خلاصه نتایج:');
    console.log('═══════════════════════════════════════\n');

    console.log(`✅ موفق: ${results.success.length}`);
    results.success.forEach(name => {
      console.log(`   ✓ ${name}`);
    });

    if (results.noApi.length > 0) {
      console.log(`\nℹ️  فقط فرانت‌اند: ${results.noApi.length}`);
      results.noApi.forEach(name => {
        console.log(`   - ${name}`);
      });
    }

    if (results.failed.length > 0) {
      console.log(`\n❌ ناموفق: ${results.failed.length}`);
      results.failed.forEach(item => {
        console.log(`   ✗ ${item.name}: ${item.reason}`);
      });
    }

    console.log('\n═══════════════════════════════════════');
    const totalTested = results.success.length + results.failed.length;
    const successRate = totalTested > 0 ? 
      ((results.success.length / totalTested) * 100).toFixed(1) : 0;
    
    console.log(`📈 نرخ موفقیت: ${successRate}% (${results.success.length}/${totalTested})`);
    console.log('═══════════════════════════════════════\n');

    if (results.failed.length === 0) {
      console.log('🎉 همه روت‌های Sidebar با موفقیت تست شدند!');
      console.log('✅ سیستم Multi-Tenant کامل و آماده است');
    } else {
      console.log('⚠️  برخی روت‌ها نیاز به بررسی دارند');
    }

  } catch (error) {
    console.error('❌ خطا کلی:', error.message);
  }
}

testAllSidebarRoutes();