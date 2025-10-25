#!/usr/bin/env node

/**
 * تست درخواست‌های واقعی API
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

async function testRealApiCalls() {
  console.log('🌐 تست درخواست‌های واقعی API...\n');

  try {
    // مرحله 1: تست لاگین
    console.log('🔐 مرحله 1: تست لاگین demo...');
    
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
    console.log(`   پاسخ: ${JSON.stringify(loginResponse.data, null, 2)}`);

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ لاگین ناموفق - ادامه با token فرضی');
      // ادامه با token فرضی برای تست
    }

    // استخراج token از response یا cookie
    let token = null;
    if (loginResponse.data.token) {
      token = loginResponse.data.token;
    } else if (loginResponse.headers['set-cookie']) {
      const cookies = loginResponse.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.includes('tenant_token='));
      if (tokenCookie) {
        token = tokenCookie.split('tenant_token=')[1].split(';')[0];
      }
    }

    console.log(`   Token: ${token ? 'موجود' : 'یافت نشد'}\n`);

    // مرحله 2: تست API مشتریان
    console.log('👥 مرحله 2: تست API مشتریان...');
    
    const customersResponse = await makeRequest(`${BASE_URL}/api/tenant/customers`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Tenant-Key': 'demo'
      }
    });

    console.log(`   وضعیت: ${customersResponse.status}`);
    if (customersResponse.data.success) {
      const customers = customersResponse.data.customers || customersResponse.data.data || [];
      console.log(`   تعداد مشتریان: ${customers.length}`);
      customers.slice(0, 3).forEach(customer => {
        console.log(`     - ${customer.name} (tenant: ${customer.tenant_key})`);
      });
    } else {
      console.log(`   خطا: ${customersResponse.data.message}`);
    }

    // مرحله 3: تست API چت
    console.log('\n💬 مرحله 3: تست API چت...');
    
    const chatUsersResponse = await makeRequest(`${BASE_URL}/api/chat/users`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Tenant-Key': 'demo'
      }
    });

    console.log(`   وضعیت: ${chatUsersResponse.status}`);
    if (chatUsersResponse.data.success) {
      const users = chatUsersResponse.data.data || [];
      console.log(`   تعداد کاربران: ${users.length}`);
      users.slice(0, 3).forEach(user => {
        console.log(`     - ${user.name} (${user.email})`);
      });
    } else {
      console.log(`   خطا: ${chatUsersResponse.data.message}`);
    }

    // مرحله 4: تست API فعالیت‌ها
    console.log('\n📋 مرحله 4: تست API فعالیت‌ها...');
    
    const activitiesResponse = await makeRequest(`${BASE_URL}/api/tenant/activities`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Tenant-Key': 'demo'
      }
    });

    console.log(`   وضعیت: ${activitiesResponse.status}`);
    if (activitiesResponse.data.success) {
      const activities = activitiesResponse.data.data || [];
      console.log(`   تعداد فعالیت‌ها: ${activities.length}`);
      activities.slice(0, 3).forEach(activity => {
        console.log(`     - ${activity.title} (مشتری: ${activity.customer_name})`);
      });
    } else {
      console.log(`   خطا: ${activitiesResponse.data.message}`);
    }

    // مرحله 5: تست API وظایف
    console.log('\n✅ مرحله 5: تست API وظایف...');
    
    const tasksResponse = await makeRequest(`${BASE_URL}/api/tenant/tasks`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Tenant-Key': 'demo'
      }
    });

    console.log(`   وضعیت: ${tasksResponse.status}`);
    if (tasksResponse.data.success) {
      const tasks = tasksResponse.data.data || [];
      console.log(`   تعداد وظایف: ${tasks.length}`);
      tasks.slice(0, 3).forEach(task => {
        console.log(`     - ${task.title} (وضعیت: ${task.status})`);
      });
    } else {
      console.log(`   خطا: ${tasksResponse.data.message}`);
    }

    console.log('\n✨ تست کامل شد!');

  } catch (error) {
    console.error('❌ خطا در تست:', error.message);
  }
}

testRealApiCalls();