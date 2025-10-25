#!/usr/bin/env node

/**
 * تست APIهای خاص: فعالیت‌ها، فروش، محصولات
 */

const https = require('https');
const http = require('http');

// تنظیمات
const BASE_URL = 'http://localhost:3000';
const DEMO_EMAIL = 'demo@gmail.com';
const DEMO_PASSWORD = 'admin123';

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

async function testSpecificApis() {
  console.log('🧪 تست APIهای خاص برای demo...\n');

  try {
    // مرحله 1: لاگین
    console.log('🔐 لاگین demo...');
    
    const loginResponse = await makeRequest(`${BASE_URL}/api/tenant/auth/login`, {
      method: 'POST',
      headers: {
        'X-Tenant-Key': 'demo'
      },
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

    // تست APIهای مختلف
    const apisToTest = [
      {
        name: '📋 فعالیت‌ها',
        url: '/api/tenant/activities',
        expectedField: 'data'
      },
      {
        name: '📦 محصولات',
        url: '/api/tenant/products',
        expectedField: 'data'
      },
      {
        name: '💰 فروش‌ها',
        url: '/api/tenant/sales',
        expectedField: 'data'
      },
      {
        name: '🤝 معاملات',
        url: '/api/tenant/deals',
        expectedField: 'data'
      },
      {
        name: '✅ وظایف',
        url: '/api/tenant/tasks',
        expectedField: 'data'
      },
      {
        name: '📞 مخاطبین',
        url: '/api/tenant/contacts',
        expectedField: 'data'
      }
    ];

    for (const api of apisToTest) {
      console.log(`${api.name}:`);
      
      try {
        const response = await makeRequest(`${BASE_URL}${api.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Key': 'demo'
          }
        });

        console.log(`   وضعیت: ${response.status}`);
        
        if (response.status === 200 && response.data.success) {
          const items = response.data[api.expectedField] || response.data.customers || response.data.activities || [];
          console.log(`   تعداد: ${items.length}`);
          
          // نمایش نمونه داده‌ها
          items.slice(0, 3).forEach((item, index) => {
            const name = item.title || item.name || item.description || item.id;
            const tenant = item.tenant_key || 'نامشخص';
            console.log(`     ${index + 1}. ${name} (tenant: ${tenant})`);
          });
          
          // بررسی tenant isolation
          const nonDemoItems = items.filter(item => item.tenant_key && item.tenant_key !== 'demo');
          if (nonDemoItems.length > 0) {
            console.log(`   ⚠️  ${nonDemoItems.length} آیتم متعلق به tenant های دیگر!`);
            nonDemoItems.slice(0, 2).forEach(item => {
              console.log(`     - ${item.title || item.name} (tenant: ${item.tenant_key})`);
            });
          } else {
            console.log(`   ✅ همه آیتم‌ها متعلق به demo هستند`);
          }
          
        } else if (response.status === 404) {
          console.log(`   ℹ️  API موجود نیست`);
        } else {
          console.log(`   ❌ خطا: ${response.data.message || 'نامشخص'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ خطا در درخواست: ${error.message}`);
      }
      
      console.log('');
    }

    // تست اضافی: بررسی dashboard stats
    console.log('📊 آمار داشبورد:');
    try {
      const statsResponse = await makeRequest(`${BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Key': 'demo'
        }
      });

      console.log(`   وضعیت: ${statsResponse.status}`);
      if (statsResponse.status === 200 && statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log(`   مشتریان: ${stats.customers?.[0]?.total_customers || 0}`);
        console.log(`   فعالیت‌ها: ${stats.recentActivities?.length || 0}`);
        console.log(`   معاملات: ${stats.deals?.[0]?.total_deals || 0}`);
      }
    } catch (error) {
      console.log(`   ❌ خطا: ${error.message}`);
    }

    console.log('\n✨ تست کامل شد!');

  } catch (error) {
    console.error('❌ خطا کلی:', error.message);
  }
}

testSpecificApis();