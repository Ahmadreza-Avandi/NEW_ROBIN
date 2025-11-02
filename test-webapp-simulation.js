#!/usr/bin/env node

/**
 * شبیه‌سازی تست وب‌اپ دمو
 * این اسکریپت دقیقاً مثل کاربر واقعی عمل می‌کنه
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
  log('\n🔐 مرحله 1: لاگین به دمو...', 'cyan');
  
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
      log(`  ✅ لاگین موفق!`, 'green');
      log(`  👤 کاربر: ${data.user?.name || data.user?.email}`, 'blue');
      log(`  🔑 Token: ${authToken.substring(0, 30)}...`, 'blue');
      return true;
    } else {
      log(`  ❌ لاگین ناموفق: ${data.message}`, 'red');
      log(`  📄 Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`  ❌ خطا در لاگین: ${error.message}`, 'red');
    return false;
  }
}

// تست افزودن وظیفه
async function testAddTask() {
  log('\n📋 مرحله 2: تست افزودن وظیفه...', 'cyan');
  
  try {
    // ابتدا لیست کاربران را بگیریم
    log('  🔍 دریافت لیست کاربران...', 'yellow');
    const usersResponse = await fetch(`${BASE_URL}/api/tenant/tasks/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Key': TENANT_KEY,
        'Content-Type': 'application/json'
      }
    });

    const usersData = await usersResponse.json();
    
    if (!usersData.success || !usersData.data || usersData.data.length === 0) {
      log('  ⚠️ هیچ کاربری برای محول کردن وظیفه یافت نشد', 'yellow');
      log('  📝 استفاده از user ID فعلی...', 'blue');
    } else {
      log(`  ✅ ${usersData.data.length} کاربر یافت شد`, 'green');
    }

    const assignedUserId = usersData.data && usersData.data.length > 0 
      ? usersData.data[0].id 
      : userId;

    // ایجاد وظیفه
    log('  📝 ایجاد وظیفه جدید...', 'yellow');
    
    const taskData = {
      title: 'تست وظیفه از اسکریپت - ' + new Date().toLocaleString('fa-IR'),
      description: 'این یک وظیفه تستی است که از اسکریپت ایجاد شده',
      assigned_to: [assignedUserId],
      priority: 'high',
      status: 'pending',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    log(`  📤 ارسال درخواست به: ${BASE_URL}/api/tenant/tasks`, 'blue');
    log(`  📦 داده‌های ارسالی:`, 'blue');
    log(`     - عنوان: ${taskData.title}`, 'blue');
    log(`     - محول به: ${assignedUserId}`, 'blue');
    log(`     - اولویت: ${taskData.priority}`, 'blue');

    const response = await fetch(`${BASE_URL}/api/tenant/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Key': TENANT_KEY
      },
      body: JSON.stringify(taskData)
    });

    log(`  📊 Status Code: ${response.status}`, response.status === 200 ? 'green' : 'red');

    const data = await response.json();
    
    if (data.success) {
      log(`  ✅ وظیفه با موفقیت ایجاد شد!`, 'green');
      log(`  🆔 ID: ${data.data?.id}`, 'blue');
      return { success: true, id: data.data?.id };
    } else {
      log(`  ❌ خطا در ایجاد وظیفه: ${data.message}`, 'red');
      log(`  📄 Response کامل:`, 'yellow');
      log(JSON.stringify(data, null, 2), 'yellow');
      return { success: false, error: data.message };
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// تست افزودن فعالیت
async function testAddActivity() {
  log('\n🎯 مرحله 3: تست افزودن فعالیت...', 'cyan');
  
  try {
    // ابتدا یک مشتری پیدا کنیم
    log('  🔍 دریافت لیست مشتریان...', 'yellow');
    const customersResponse = await fetch(`${BASE_URL}/api/tenant/customers-simple?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Key': TENANT_KEY,
        'Content-Type': 'application/json'
      }
    });

    const customersData = await customersResponse.json();
    
    if (!customersData.success || !customersData.data || customersData.data.length === 0) {
      log('  ❌ هیچ مشتری‌ای برای تست یافت نشد', 'red');
      return { success: false, error: 'No customers found' };
    }

    const customer = customersData.data[0];
    log(`  ✅ مشتری یافت شد: ${customer.name}`, 'green');

    // ایجاد فعالیت
    log('  📝 ایجاد فعالیت جدید...', 'yellow');
    
    const activityData = {
      customer_id: customer.id,
      type: 'call',
      title: 'تست فعالیت از اسکریپت - ' + new Date().toLocaleString('fa-IR'),
      description: 'این یک فعالیت تستی است که از اسکریپت ایجاد شده',
      outcome: 'completed',
      start_time: new Date().toISOString()
    };

    log(`  📤 ارسال درخواست به: ${BASE_URL}/api/tenant/activities`, 'blue');
    log(`  📦 داده‌های ارسالی:`, 'blue');
    log(`     - عنوان: ${activityData.title}`, 'blue');
    log(`     - مشتری: ${customer.name}`, 'blue');
    log(`     - نوع: ${activityData.type}`, 'blue');

    const response = await fetch(`${BASE_URL}/api/tenant/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Key': TENANT_KEY
      },
      body: JSON.stringify(activityData)
    });

    log(`  📊 Status Code: ${response.status}`, response.status === 200 ? 'green' : 'red');

    const data = await response.json();
    
    if (data.success) {
      log(`  ✅ فعالیت با موفقیت ایجاد شد!`, 'green');
      log(`  🆔 ID: ${data.data?.id}`, 'blue');
      return { success: true, id: data.data?.id };
    } else {
      log(`  ❌ خطا در ایجاد فعالیت: ${data.message}`, 'red');
      log(`  📄 Response کامل:`, 'yellow');
      log(JSON.stringify(data, null, 2), 'yellow');
      return { success: false, error: data.message };
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// تست آپلود سند
async function testUploadDocument() {
  log('\n📄 مرحله 4: تست آپلود سند...', 'cyan');
  
  try {
    // ایجاد یک فایل تستی
    log('  📝 ایجاد فایل تستی...', 'yellow');
    
    const testContent = 'این یک فایل تستی است - ' + new Date().toISOString();
    const blob = new Blob([testContent], { type: 'text/plain' });
    const file = new File([blob], 'test-document.txt', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'تست سند از اسکریپت - ' + new Date().toLocaleString('fa-IR'));
    formData.append('description', 'این یک سند تستی است که از اسکریپت آپلود شده');
    formData.append('accessLevel', 'private');
    formData.append('tags', 'تست,اسکریپت,دمو');

    log(`  📤 ارسال درخواست به: ${BASE_URL}/api/tenant/documents`, 'blue');
    log(`  📦 اطلاعات فایل:`, 'blue');
    log(`     - نام: test-document.txt`, 'blue');
    log(`     - حجم: ${testContent.length} بایت`, 'blue');
    log(`     - نوع: text/plain`, 'blue');

    const response = await fetch(`${BASE_URL}/api/tenant/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Key': TENANT_KEY
      },
      body: formData
    });

    log(`  📊 Status Code: ${response.status}`, response.status === 200 ? 'green' : 'red');

    const data = await response.json();
    
    if (data.success) {
      log(`  ✅ سند با موفقیت آپلود شد!`, 'green');
      log(`  🆔 ID: ${data.document?.id}`, 'blue');
      log(`  📁 نام فایل: ${data.document?.filename}`, 'blue');
      return { success: true, id: data.document?.id };
    } else {
      log(`  ❌ خطا در آپلود سند: ${data.error || data.message}`, 'red');
      log(`  📄 Response کامل:`, 'yellow');
      log(JSON.stringify(data, null, 2), 'yellow');
      return { success: false, error: data.error || data.message };
    }
  } catch (error) {
    log(`  ❌ خطا در درخواست: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// اجرای تمام تست‌ها
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 شروع شبیه‌سازی تست وب‌اپ دمو', 'cyan');
  log('='.repeat(60), 'blue');
  log(`📍 URL: ${BASE_URL}`, 'blue');
  log(`🔑 Tenant: ${TENANT_KEY}`, 'blue');
  log('='.repeat(60), 'blue');

  // لاگین
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ لاگین ناموفق بود. تست‌ها متوقف شد.', 'red');
    log('\n💡 راه‌حل‌های پیشنهادی:', 'yellow');
    log('  1. مطمئن شوید سرور در حال اجرا است', 'yellow');
    log('  2. اطلاعات لاگین را بررسی کنید', 'yellow');
    log('  3. دیتابیس را بررسی کنید', 'yellow');
    return;
  }

  // تست‌های مختلف
  const results = {
    addTask: await testAddTask(),
    addActivity: await testAddActivity(),
    uploadDocument: await testUploadDocument()
  };

  // خلاصه نتایج
  log('\n' + '='.repeat(60), 'blue');
  log('📊 خلاصه نتایج تست‌ها:', 'cyan');
  log('='.repeat(60), 'blue');

  const testNames = {
    addTask: 'افزودن وظیفه',
    addActivity: 'افزودن فعالیت',
    uploadDocument: 'آپلود سند'
  };

  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`  ${status} ${testNames[test]}`, color);
    if (!result.success && result.error) {
      log(`     خطا: ${result.error}`, 'red');
    }
  });

  const passed = Object.values(results).filter(r => r.success).length;
  const failed = Object.keys(results).length - passed;

  log('\n' + '='.repeat(60), 'blue');
  log(`✅ موفق: ${passed}`, 'green');
  log(`❌ ناموفق: ${failed}`, 'red');
  log('='.repeat(60), 'blue');

  if (failed === 0) {
    log('\n🎉 همه تست‌ها با موفقیت انجام شد!', 'green');
    log('✨ وب‌اپ دمو به درستی کار می‌کند.', 'green');
  } else {
    log('\n⚠️ برخی تست‌ها ناموفق بودند.', 'yellow');
    log('📝 لطفاً خطاهای بالا را بررسی کنید.', 'yellow');
    log('\n💡 برای دیباگ بیشتر:', 'cyan');
    log('  1. فایل TEST-WEBAPP-INSTRUCTIONS.md را مطالعه کنید', 'cyan');
    log('  2. Console مرورگر را بررسی کنید (F12)', 'cyan');
    log('  3. Network Tab را چک کنید', 'cyan');
    log('  4. لاگ‌های سرور را بررسی کنید', 'cyan');
  }
}

// اجرای تست‌ها
runAllTests().catch(error => {
  log(`\n❌ خطای کلی: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
