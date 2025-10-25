#!/usr/bin/env node

/**
 * اضافه کردن همکار تستی برای demo
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

async function addDemoCoworker() {
  console.log('👥 اضافه کردن همکار تستی برای demo...\n');

  try {
    // مرحله 1: لاگین
    console.log('🔐 مرحله 1: لاگین demo...');
    
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

    console.log(`   وضعیت لاگین: ${loginResponse.status}`);

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ لاگین ناموفق');
      console.log(`   پاسخ: ${JSON.stringify(loginResponse.data, null, 2)}`);
      return;
    }

    const token = loginResponse.data.token;
    console.log('   ✅ لاگین موفق\n');

    // مرحله 2: اضافه کردن همکار
    console.log('👤 مرحله 2: اضافه کردن همکار...');
    
    const newCoworker = {
      name: 'علی احمدی',
      email: 'ali.ahmadi@demo.com',
      password: 'ali123456',
      role: 'sales_agent',
      phone: '09123456789',
      department: 'فروش'
    };

    const addUserResponse = await makeRequest(`${BASE_URL}/api/tenant/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'demo'
      },
      body: newCoworker
    });

    console.log(`   وضعیت: ${addUserResponse.status}`);
    console.log(`   پاسخ: ${JSON.stringify(addUserResponse.data, null, 2)}`);

    if (addUserResponse.data.success) {
      console.log('   ✅ همکار با موفقیت اضافه شد');
    } else {
      console.log('   ❌ خطا در اضافه کردن همکار');
    }

    // مرحله 3: بررسی لیست همکاران
    console.log('\n📋 مرحله 3: بررسی لیست همکاران...');
    
    const usersResponse = await makeRequest(`${BASE_URL}/api/tenant/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'demo'
      }
    });

    console.log(`   وضعیت: ${usersResponse.status}`);
    
    if (usersResponse.data.success) {
      const users = usersResponse.data.data || usersResponse.data.users || [];
      console.log(`   تعداد همکاران: ${users.length}`);
      users.forEach(user => {
        console.log(`     - ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log(`   خطا: ${usersResponse.data.message}`);
    }

    console.log('\n✨ عملیات کامل شد!');
    console.log('\n🔗 لینک‌های تست:');
    console.log(`   صفحه همکاران: ${BASE_URL}/demo/dashboard/coworkers`);
    console.log(`   چت: ${BASE_URL}/demo/dashboard/chat`);

  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

addDemoCoworker();