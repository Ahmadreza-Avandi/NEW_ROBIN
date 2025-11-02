#!/usr/bin/env node

/**
 * تست کامل API های دمو
 * این اسکریپت تمام API های مربوط به وظایف، فعالیت‌ها و اسناد رو تست می‌کنه
 */

const BASE_URL = 'http://localhost:3000';
const TENANT_KEY = 'rabin';

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

let authToken = null;
let userId = null;

// تابع لاگین
async function login() {
  log('\n🔐 تست لاگین...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/tenant/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Key': TENANT_KEY
      },
      body: JSON.stringify({
        email: 'Robintejarat@gmail.com',
        password: 'admin123',
        tenant_key: TENANT_KEY
      })
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      authToken = data.token;
      userId = data.user?.id;
      log(`  ✅ لاگین موفق! Token: ${authToken.substring(0, 30)}...`, 'green');
      log(`  👤 کاربر: ${data.user?.name || data.user?.email}`, 'blue');
      log(`  👑 نقش: ${data.user?.role}`, 'blue');
      return true;
    } else {
      log(`  ❌ لاگین ناموفق: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در لاگین: ${error.message}`, 'red');
    return false;
  }
}

// تست دریافت وظایف
async function testGetTasks() {
  log('\n📋 تست دریافت وظایف (GET /api/tasks)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ تعداد وظایف: ${data.data?.length || 0}`, 'green');
      if (data.data && data.data.length > 0) {
        log('  📝 نمونه وظایف:', 'blue');
        data.data.slice(0, 3).forEach((task, index) => {
          log(`    ${index + 1}. ${task.title} - وضعیت: ${task.status}`, 'blue');
        });
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// تست ایجاد وظیفه
async function testCreateTask() {
  log('\n📋 تست ایجاد وظیفه (POST /api/tasks)...', 'cyan');
  
  try {
    const taskData = {
      title: 'تست وظیفه - ' + new Date().toLocaleString('fa-IR'),
      description: 'این یک وظیفه تستی است',
      assigned_to: [userId],
      priority: 'high',
      category: 'follow_up',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ وظیفه ایجاد شد! ID: ${data.data?.id}`, 'green');
      return data.data?.id;
    } else {
      log(`  ❌ خطا: ${data.message}`, 'red');
      log(`  📄 Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return null;
  }
}

// تست دریافت فعالیت‌ها
async function testGetActivities() {
  log('\n🎯 تست دریافت فعالیت‌ها (GET /api/activities)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/activities?page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ تعداد فعالیت‌ها: ${data.data?.length || 0}`, 'green');
      if (data.pagination) {
        log(`  📄 صفحه ${data.pagination.page} از ${data.pagination.totalPages}`, 'blue');
        log(`  📊 کل: ${data.pagination.total}`, 'blue');
      }
      if (data.data && data.data.length > 0) {
        log('  📝 نمونه فعالیت‌ها:', 'blue');
        data.data.slice(0, 3).forEach((activity, index) => {
          log(`    ${index + 1}. ${activity.title} - نوع: ${activity.type}`, 'blue');
        });
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// تست ایجاد فعالیت
async function testCreateActivity() {
  log('\n🎯 تست ایجاد فعالیت (POST /api/activities)...', 'cyan');
  
  try {
    // ابتدا یک مشتری پیدا کنیم
    const customersResponse = await fetch(`${BASE_URL}/api/customers?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const customersData = await customersResponse.json();
    
    if (!customersData.success || !customersData.data || customersData.data.length === 0) {
      log('  ⚠️ هیچ مشتری‌ای برای تست یافت نشد', 'yellow');
      return false;
    }

    const customerId = customersData.data[0].id;
    log(`  📌 استفاده از مشتری: ${customersData.data[0].name}`, 'blue');

    const activityData = {
      customer_id: customerId,
      type: 'call',
      title: 'تست فعالیت - ' + new Date().toLocaleString('fa-IR'),
      description: 'این یک فعالیت تستی است',
      outcome: 'completed',
      start_time: new Date().toISOString(),
      notes: 'یادداشت تستی'
    };

    const response = await fetch(`${BASE_URL}/api/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ فعالیت ایجاد شد! ID: ${data.data?.id}`, 'green');
      return data.data?.id;
    } else {
      log(`  ❌ خطا: ${data.message}`, 'red');
      log(`  📄 Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return null;
  }
}

// تست دریافت اسناد
async function testGetDocuments() {
  log('\n📄 تست دریافت اسناد (GET /api/documents)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/documents?page=1&limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.documents) {
      log(`  ✅ تعداد اسناد: ${data.documents?.length || 0}`, 'green');
      if (data.pagination) {
        log(`  📄 صفحه ${data.pagination.page} از ${data.pagination.totalPages}`, 'blue');
        log(`  📊 کل: ${data.pagination.total}`, 'blue');
      }
      if (data.documents && data.documents.length > 0) {
        log('  📝 نمونه اسناد:', 'blue');
        data.documents.slice(0, 3).forEach((doc, index) => {
          log(`    ${index + 1}. ${doc.title} - نوع: ${doc.mime_type}`, 'blue');
        });
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.error || 'خطای نامشخص'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// تست آپلود سند
async function testUploadDocument() {
  log('\n📄 تست آپلود سند (POST /api/documents)...', 'cyan');
  
  try {
    // ایجاد یک فایل تستی
    const testContent = 'این یک فایل تستی است - ' + new Date().toISOString();
    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'test-document.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'سند تستی - ' + new Date().toLocaleString('fa-IR'));
    formData.append('description', 'این یک سند تستی است');
    formData.append('accessLevel', 'private');
    formData.append('tags', 'تست,دمو');

    const response = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ سند آپلود شد! ID: ${data.document?.id}`, 'green');
      log(`  📁 نام فایل: ${data.document?.filename}`, 'blue');
      log(`  📏 حجم: ${data.document?.size} بایت`, 'blue');
      return data.document?.id;
    } else {
      log(`  ❌ خطا: ${data.error || data.message}`, 'red');
      log(`  📄 Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return null;
  }
}

// تست دریافت همکاران
async function testGetCoworkers() {
  log('\n👥 تست دریافت همکاران (GET /api/coworkers)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/coworkers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success) {
      log(`  ✅ تعداد همکاران: ${data.data?.length || 0}`, 'green');
      if (data.data && data.data.length > 0) {
        log('  📝 لیست همکاران:', 'blue');
        data.data.forEach((coworker, index) => {
          log(`    ${index + 1}. ${coworker.name} - نقش: ${coworker.role}`, 'blue');
        });
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// تست دریافت گزارش‌ها
async function testGetReports() {
  log('\n📈 تست دریافت گزارش‌ها (GET /api/reports)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/reports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success || data.reports) {
      log(`  ✅ گزارش‌ها دریافت شد`, 'green');
      if (data.reports) {
        log(`  📊 تعداد گزارش‌ها: ${data.reports.length}`, 'blue');
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.message || data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// تست دریافت داشبورد
async function testGetDashboard() {
  log('\n📊 تست دریافت داشبورد (GET /api/dashboard/stats)...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    log(`  📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (data.success || data.stats) {
      log(`  ✅ آمار داشبورد دریافت شد`, 'green');
      if (data.stats) {
        log(`  👥 مشتریان: ${data.stats.customers || 0}`, 'blue');
        log(`  💼 معاملات: ${data.stats.deals || 0}`, 'blue');
        log(`  💰 فروش‌ها: ${data.stats.sales || 0}`, 'blue');
      }
      return true;
    } else {
      log(`  ❌ خطا: ${data.message || data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return false;
  }
}

// اجرای تمام تست‌ها
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 شروع تست کامل API های دمو', 'cyan');
  log('='.repeat(60), 'blue');
  log(`📍 URL: ${BASE_URL}`, 'blue');
  log(`🔑 Tenant: ${TENANT_KEY}`, 'blue');
  log('='.repeat(60), 'blue');

  // لاگین
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ لاگین ناموفق بود. تست‌ها متوقف شد.', 'red');
    return;
  }

  // تست‌های مختلف
  const results = {
    getTasks: await testGetTasks(),
    createTask: await testCreateTask(),
    getActivities: await testGetActivities(),
    createActivity: await testCreateActivity(),
    getDocuments: await testGetDocuments(),
    uploadDocument: await testUploadDocument(),
    getCoworkers: await testGetCoworkers(),
    getReports: await testGetReports(),
    getDashboard: await testGetDashboard()
  };

  // خلاصه نتایج
  log('\n' + '='.repeat(60), 'blue');
  log('📊 خلاصه نتایج تست‌ها:', 'cyan');
  log('='.repeat(60), 'blue');

  const passed = Object.values(results).filter(r => r === true || r !== null && r !== false).length;
  const failed = Object.keys(results).length - passed;

  Object.entries(results).forEach(([test, result]) => {
    const status = result === true || (result !== null && result !== false) ? '✅' : '❌';
    const color = result === true || (result !== null && result !== false) ? 'green' : 'red';
    log(`  ${status} ${test}`, color);
  });

  log('\n' + '='.repeat(60), 'blue');
  log(`✅ موفق: ${passed}`, 'green');
  log(`❌ ناموفق: ${failed}`, 'red');
  log('='.repeat(60), 'blue');

  if (failed > 0) {
    log('\n⚠️ برخی تست‌ها ناموفق بودند. لطفاً لاگ‌های بالا را بررسی کنید.', 'yellow');
  } else {
    log('\n🎉 همه تست‌ها با موفقیت انجام شد!', 'green');
  }
}

// اجرای تست‌ها
runAllTests().catch(error => {
  log(`\n❌ خطای کلی: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
