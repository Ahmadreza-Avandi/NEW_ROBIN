#!/usr/bin/env node

/**
 * تست Tenant Filtering در داشبورد
 * مطمئن می‌شیم که فقط دیتای tenant خودش رو نشون میده
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

async function testDashboard() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔍 تست Tenant Filtering در داشبورد', 'cyan');
  log('='.repeat(60), 'blue');

  // لاگین
  log('\n🔐 لاگین...', 'yellow');
  const loginResponse = await fetch(`${BASE_URL}/api/tenant/auth/login`, {
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

  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    log('❌ لاگین ناموفق', 'red');
    return;
  }

  const token = loginData.token;
  log('✅ لاگین موفق', 'green');

  // دریافت داده‌های داشبورد
  log('\n📊 دریافت داده‌های داشبورد...', 'yellow');
  const dashboardResponse = await fetch(`${BASE_URL}/api/tenant/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!dashboardResponse.ok) {
    log(`❌ خطا: ${dashboardResponse.status}`, 'red');
    return;
  }

  const dashboardData = await dashboardResponse.json();

  if (!dashboardData.success) {
    log('❌ دریافت داده‌ها ناموفق', 'red');
    return;
  }

  log('✅ داده‌های داشبورد دریافت شد', 'green');

  // بررسی آمار کلی
  log('\n📈 آمار کلی:', 'cyan');
  const stats = dashboardData.data.quickStats;
  log(`  👥 مشتریان فعال: ${stats.active_customers}`, 'blue');
  log(`  📋 وظایف در انتظار: ${stats.pending_tasks}`, 'blue');
  log(`  💼 معاملات فعال: ${stats.active_deals}`, 'blue');
  log(`  🎫 تیکت‌های باز: ${stats.open_tickets}`, 'blue');

  // بررسی مشتریان اخیر
  log('\n👥 مشتریان اخیر:', 'cyan');
  const customers = dashboardData.data.recentCustomers || [];
  log(`  📊 تعداد: ${customers.length}`, 'blue');
  
  if (customers.length > 0) {
    customers.slice(0, 3).forEach((customer, index) => {
      log(`  ${index + 1}. ${customer.name}`, 'blue');
    });
  }

  // بررسی فعالیت‌های امروز
  log('\n🎯 فعالیت‌های امروز:', 'cyan');
  const activities = dashboardData.data.teamActivities || [];
  log(`  📊 تعداد: ${activities.length}`, 'blue');
  
  if (activities.length > 0) {
    activities.slice(0, 3).forEach((activity, index) => {
      log(`  ${index + 1}. ${activity.title} - ${activity.customer_name || 'بدون مشتری'}`, 'blue');
    });
  }

  // بررسی گزارش کاربران (برای مدیر)
  log('\n👨‍💼 گزارش کاربران:', 'cyan');
  const userReport = dashboardData.data.userActivityReport || [];
  log(`  📊 تعداد: ${userReport.length}`, 'blue');
  
  if (userReport.length > 0) {
    userReport.forEach((user, index) => {
      log(`  ${index + 1}. ${user.name} - نقش: ${user.role}`, 'blue');
      log(`     فعالیت‌های امروز: ${user.activities_today}`, 'blue');
      log(`     وظایف تکمیل شده: ${user.tasks_completed}`, 'blue');
    });
  }

  // حالا بررسی می‌کنیم که آیا داده‌های tenant دیگر وجود دارد
  log('\n🔒 بررسی Tenant Filtering:', 'cyan');
  
  // تست مشتریان
  log('\n  📋 تست مشتریان...', 'yellow');
  const customersResponse = await fetch(`${BASE_URL}/api/tenant/customers-simple?limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY,
      'Content-Type': 'application/json'
    }
  });

  const customersData = await customersResponse.json();
  
  if (customersData.success && customersData.data) {
    const wrongTenantCustomers = customersData.data.filter(c => 
      c.tenant_key && c.tenant_key !== TENANT_KEY
    );
    
    if (wrongTenantCustomers.length > 0) {
      log(`    ❌ ${wrongTenantCustomers.length} مشتری از tenant دیگر یافت شد!`, 'red');
      wrongTenantCustomers.slice(0, 3).forEach(c => {
        log(`      - ${c.name} (tenant: ${c.tenant_key})`, 'red');
      });
    } else {
      log(`    ✅ همه ${customersData.data.length} مشتری متعلق به tenant صحیح هستند`, 'green');
    }
  }

  // تست همکاران
  log('\n  👥 تست همکاران...', 'yellow');
  const coworkersResponse = await fetch(`${BASE_URL}/api/tenant/coworkers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY,
      'Content-Type': 'application/json'
    }
  });

  const coworkersData = await coworkersResponse.json();
  
  if (coworkersData.success && coworkersData.data) {
    const wrongTenantCoworkers = coworkersData.data.filter(c => 
      c.tenant_key && c.tenant_key !== TENANT_KEY
    );
    
    if (wrongTenantCoworkers.length > 0) {
      log(`    ❌ ${wrongTenantCoworkers.length} همکار از tenant دیگر یافت شد!`, 'red');
    } else {
      log(`    ✅ همه ${coworkersData.data.length} همکار متعلق به tenant صحیح هستند`, 'green');
    }
  }

  // تست فعالیت‌ها
  log('\n  🎯 تست فعالیت‌ها...', 'yellow');
  const activitiesResponse = await fetch(`${BASE_URL}/api/tenant/activities?limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY,
      'Content-Type': 'application/json'
    }
  });

  const activitiesData = await activitiesResponse.json();
  
  if (activitiesData.success && activitiesData.data) {
    const wrongTenantActivities = activitiesData.data.filter(a => 
      a.tenant_key && a.tenant_key !== TENANT_KEY
    );
    
    if (wrongTenantActivities.length > 0) {
      log(`    ❌ ${wrongTenantActivities.length} فعالیت از tenant دیگر یافت شد!`, 'red');
    } else {
      log(`    ✅ همه ${activitiesData.data.length} فعالیت متعلق به tenant صحیح هستند`, 'green');
    }
  }

  // تست وظایف
  log('\n  📋 تست وظایف...', 'yellow');
  const tasksResponse = await fetch(`${BASE_URL}/api/tenant/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY,
      'Content-Type': 'application/json'
    }
  });

  const tasksData = await tasksResponse.json();
  
  if (tasksData.success && tasksData.data) {
    const wrongTenantTasks = tasksData.data.filter(t => 
      t.tenant_key && t.tenant_key !== TENANT_KEY
    );
    
    if (wrongTenantTasks.length > 0) {
      log(`    ❌ ${wrongTenantTasks.length} وظیفه از tenant دیگر یافت شد!`, 'red');
    } else {
      log(`    ✅ همه ${tasksData.data.length} وظیفه متعلق به tenant صحیح هستند`, 'green');
    }
  }

  log('\n' + '='.repeat(60), 'blue');
  log('✅ تست Tenant Filtering در داشبورد تمام شد', 'green');
  log('='.repeat(60), 'blue');
}

testDashboard().catch(error => {
  log(`\n❌ خطا: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
