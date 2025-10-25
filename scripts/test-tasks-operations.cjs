#!/usr/bin/env node

/**
 * تست عملیات وظایف
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const DEMO_EMAIL = 'demo@gmail.com';
const DEMO_PASSWORD = 'admin123';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
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

async function testTasksOperations() {
  console.log('🧪 تست عملیات وظایف...\n');

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

    if (loginResponse.status !== 200) {
      console.log('❌ لاگین ناموفق');
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ لاگین موفق\n');

    // دریافت لیست کاربران
    console.log('👥 دریافت لیست کاربران...');
    const usersResponse = await makeRequest(`${BASE_URL}/api/tenant/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'demo'
      }
    });
    
    const users = usersResponse.data.data || [];
    console.log(`   ${users.length} کاربر یافت شد`);
    users.forEach(u => console.log(`     - ${u.name} (${u.id})`));

    // ایجاد وظیفه جدید
    console.log('\n✅ ایجاد وظیفه جدید...');
    const newTask = {
      title: 'وظیفه تست ' + Date.now(),
      description: 'این یک وظیفه تستی است',
      assigned_to: users[1]?.id || userId, // اختصاص به کاربر دوم
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const createResponse = await makeRequest(`${BASE_URL}/api/tenant/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'demo'
      },
      body: newTask
    });

    console.log(`   وضعیت: ${createResponse.status}`);
    console.log(`   پاسخ: ${JSON.stringify(createResponse.data, null, 2)}`);

    // دریافت لیست وظایف
    console.log('\n📋 دریافت لیست وظایف...');
    const tasksResponse = await makeRequest(`${BASE_URL}/api/tenant/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Key': 'demo'
      }
    });

    const tasks = tasksResponse.data.data || [];
    console.log(`   ${tasks.length} وظیفه یافت شد`);
    
    // نمایش وظایف بر اساس وضعیت
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');
    
    console.log(`\n   📊 آمار:`);
    console.log(`     - در انتظار: ${pending.length}`);
    console.log(`     - در حال انجام: ${inProgress.length}`);
    console.log(`     - تکمیل شده: ${completed.length}`);

    // تست تغییر وضعیت
    if (tasks.length > 0) {
      const taskToUpdate = tasks[0];
      console.log(`\n🔄 تغییر وضعیت وظیفه "${taskToUpdate.title}"...`);
      
      const updateResponse = await makeRequest(`${BASE_URL}/api/tenant/tasks`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Key': 'demo'
        },
        body: {
          id: taskToUpdate.id,
          status: 'in_progress'
        }
      });

      console.log(`   وضعیت: ${updateResponse.status}`);
      console.log(`   ${updateResponse.data.success ? '✅' : '❌'} ${updateResponse.data.message}`);

      // تست تکمیل وظیفه
      console.log(`\n✅ تکمیل وظیفه...`);
      const completeResponse = await makeRequest(`${BASE_URL}/api/tenant/tasks`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Key': 'demo'
        },
        body: {
          id: taskToUpdate.id,
          status: 'completed'
        }
      });

      console.log(`   وضعیت: ${completeResponse.status}`);
      console.log(`   ${completeResponse.data.success ? '✅' : '❌'} ${completeResponse.data.message}`);
    }

    console.log('\n✨ تست کامل شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testTasksOperations();