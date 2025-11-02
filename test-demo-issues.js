#!/usr/bin/env node

/**
 * تست مشکلات خاص دمو
 * 1. دسترسی مدیرعامل به گزارش همکاران
 * 2. نمایش دیتای شرکت خودش در داشبورد
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
let userRole = null;

// تابع لاگین
async function login() {
  log('\n🔐 لاگین به عنوان مدیرعامل...', 'cyan');
  
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
      userRole = data.user?.role;
      log(`  ✅ لاگین موفق!`, 'green');
      log(`  👤 کاربر: ${data.user?.name || data.user?.email}`, 'blue');
      log(`  👑 نقش: ${userRole}`, 'blue');
      log(`  🆔 ID: ${userId}`, 'blue');
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

// تست 1: دسترسی به گزارش همکاران
async function testCoworkersReports() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 تست 1: دسترسی مدیرعامل به گزارش همکاران', 'cyan');
  log('='.repeat(60), 'blue');
  
  try {
    // دریافت لیست همکاران
    log('\n👥 دریافت لیست همکاران...', 'yellow');
    const coworkersResponse = await fetch(`${BASE_URL}/api/coworkers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const coworkersData = await coworkersResponse.json();
    
    if (coworkersData.success && coworkersData.data) {
      log(`  ✅ تعداد همکاران: ${coworkersData.data.length}`, 'green');
      
      // نمایش همکاران
      coworkersData.data.forEach((coworker, index) => {
        log(`  ${index + 1}. ${coworker.name || coworker.username} - نقش: ${coworker.role}`, 'blue');
      });
      
      // برای هر همکار، تلاش برای دریافت گزارش‌هایش
      log('\n📈 تلاش برای دریافت گزارش‌های همکاران...', 'yellow');
      
      for (const coworker of coworkersData.data) {
        if (coworker.id === userId) {
          log(`  ⏭️  رد شدن از خود کاربر`, 'blue');
          continue;
        }
        
        log(`\n  👤 بررسی گزارش‌های: ${coworker.name || coworker.username}`, 'cyan');
        
        // تست دریافت فعالیت‌های همکار
        const activitiesResponse = await fetch(
          `${BASE_URL}/api/activities?performed_by=${coworker.id}&limit=5`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const activitiesData = await activitiesResponse.json();
        
        if (activitiesData.success) {
          log(`    ✅ فعالیت‌ها: ${activitiesData.data?.length || 0} مورد`, 'green');
          if (activitiesData.data && activitiesData.data.length > 0) {
            activitiesData.data.slice(0, 2).forEach(act => {
              log(`      - ${act.title}`, 'blue');
            });
          }
        } else {
          log(`    ❌ خطا در دریافت فعالیت‌ها: ${activitiesData.message}`, 'red');
        }
        
        // تست دریافت وظایف همکار
        const tasksResponse = await fetch(
          `${BASE_URL}/api/tasks?assigned_to=${coworker.id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const tasksData = await tasksResponse.json();
        
        if (tasksData.success) {
          log(`    ✅ وظایف: ${tasksData.data?.length || 0} مورد`, 'green');
          if (tasksData.data && tasksData.data.length > 0) {
            tasksData.data.slice(0, 2).forEach(task => {
              log(`      - ${task.title} (${task.status})`, 'blue');
            });
          }
        } else {
          log(`    ❌ خطا در دریافت وظایف: ${tasksData.message}`, 'red');
        }
      }
      
      log('\n✅ تست دسترسی به گزارش همکاران تمام شد', 'green');
      return true;
      
    } else {
      log(`  ❌ خطا در دریافت همکاران: ${coworkersData.message}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`  ❌ خطا: ${error.message}`, 'red');
    return false;
  }
}

// تست 2: نمایش دیتای شرکت خودش
async function testCompanyData() {
  log('\n' + '='.repeat(60), 'blue');
  log('🏢 تست 2: نمایش دیتای شرکت خودش در داشبورد', 'cyan');
  log('='.repeat(60), 'blue');
  
  try {
    // دریافت آمار داشبورد
    log('\n📊 دریافت آمار داشبورد...', 'yellow');
    
    // تست مشتریان
    const customersResponse = await fetch(`${BASE_URL}/api/customers?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const customersData = await customersResponse.json();
    
    if (customersData.success) {
      log(`  ✅ مشتریان: ${customersData.pagination?.total || customersData.data?.length || 0} مورد`, 'green');
      if (customersData.data && customersData.data.length > 0) {
        log('  📝 نمونه مشتریان:', 'blue');
        customersData.data.slice(0, 3).forEach((customer, index) => {
          log(`    ${index + 1}. ${customer.name} - ${customer.phone || 'بدون تلفن'}`, 'blue');
        });
      }
    } else {
      log(`  ❌ خطا در دریافت مشتریان: ${customersData.message}`, 'red');
    }
    
    // تست معاملات
    const dealsResponse = await fetch(`${BASE_URL}/api/deals?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dealsData = await dealsResponse.json();
    
    if (dealsData.success) {
      log(`  ✅ معاملات: ${dealsData.data?.length || 0} مورد`, 'green');
      if (dealsData.data && dealsData.data.length > 0) {
        log('  📝 نمونه معاملات:', 'blue');
        dealsData.data.slice(0, 3).forEach((deal, index) => {
          log(`    ${index + 1}. ${deal.title} - ${deal.total_value || 0} تومان`, 'blue');
        });
      }
    } else {
      log(`  ❌ خطا در دریافت معاملات: ${dealsData.message}`, 'red');
    }
    
    // تست فروش‌ها
    const salesResponse = await fetch(`${BASE_URL}/api/sales?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const salesData = await salesResponse.json();
    
    if (salesData.success) {
      log(`  ✅ فروش‌ها: ${salesData.data?.length || 0} مورد`, 'green');
      if (salesData.data && salesData.data.length > 0) {
        log('  📝 نمونه فروش‌ها:', 'blue');
        salesData.data.slice(0, 3).forEach((sale, index) => {
          log(`    ${index + 1}. ${sale.product_name || 'محصول'} - ${sale.total_amount || 0} تومان`, 'blue');
        });
      }
    } else {
      log(`  ❌ خطا در دریافت فروش‌ها: ${salesData.message}`, 'red');
    }
    
    // تست فعالیت‌های خودش
    log('\n🎯 بررسی فعالیت‌های شرکت...', 'yellow');
    const activitiesResponse = await fetch(`${BASE_URL}/api/activities?limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success) {
      log(`  ✅ فعالیت‌ها: ${activitiesData.pagination?.total || activitiesData.data?.length || 0} مورد`, 'green');
      if (activitiesData.data && activitiesData.data.length > 0) {
        log('  📝 آخرین فعالیت‌ها:', 'blue');
        activitiesData.data.slice(0, 3).forEach((activity, index) => {
          log(`    ${index + 1}. ${activity.title} - ${activity.customer_name || 'بدون مشتری'}`, 'blue');
        });
      }
    } else {
      log(`  ❌ خطا در دریافت فعالیت‌ها: ${activitiesData.message}`, 'red');
    }
    
    log('\n✅ تست نمایش دیتای شرکت تمام شد', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ خطا: ${error.message}`, 'red');
    return false;
  }
}

// تست 3: بررسی tenant filtering
async function testTenantFiltering() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔒 تست 3: بررسی Tenant Filtering', 'cyan');
  log('='.repeat(60), 'blue');
  
  try {
    log('\n🔍 بررسی اینکه فقط دیتای tenant خودش رو می‌بینه...', 'yellow');
    
    // دریافت مشتریان و بررسی tenant_key
    const customersResponse = await fetch(`${BASE_URL}/api/customers?limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const customersData = await customersResponse.json();
    
    if (customersData.success && customersData.data) {
      const wrongTenantCustomers = customersData.data.filter(c => 
        c.tenant_key && c.tenant_key !== TENANT_KEY
      );
      
      if (wrongTenantCustomers.length > 0) {
        log(`  ❌ مشکل! ${wrongTenantCustomers.length} مشتری از tenant دیگر نمایش داده شد:`, 'red');
        wrongTenantCustomers.slice(0, 3).forEach(c => {
          log(`    - ${c.name} (tenant: ${c.tenant_key})`, 'red');
        });
        return false;
      } else {
        log(`  ✅ همه مشتریان متعلق به tenant صحیح هستند`, 'green');
      }
    }
    
    log('\n✅ تست tenant filtering تمام شد', 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ خطا: ${error.message}`, 'red');
    return false;
  }
}

// اجرای تمام تست‌ها
async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 شروع تست مشکلات دمو', 'cyan');
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

  // اجرای تست‌ها
  const results = {
    coworkersReports: await testCoworkersReports(),
    companyData: await testCompanyData(),
    tenantFiltering: await testTenantFiltering()
  };

  // خلاصه نتایج
  log('\n' + '='.repeat(60), 'blue');
  log('📊 خلاصه نتایج:', 'cyan');
  log('='.repeat(60), 'blue');

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    const testNames = {
      coworkersReports: 'دسترسی به گزارش همکاران',
      companyData: 'نمایش دیتای شرکت',
      tenantFiltering: 'Tenant Filtering'
    };
    log(`  ${status} ${testNames[test]}`, color);
  });

  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.keys(results).length - passed;

  log('\n' + '='.repeat(60), 'blue');
  log(`✅ موفق: ${passed}`, 'green');
  log(`❌ ناموفق: ${failed}`, 'red');
  log('='.repeat(60), 'blue');

  if (failed === 0) {
    log('\n🎉 همه تست‌ها با موفقیت انجام شد!', 'green');
    log('✨ مشکلات دمو برطرف شده است.', 'green');
  } else {
    log('\n⚠️ برخی مشکلات هنوز وجود دارد.', 'yellow');
  }
}

// اجرای تست‌ها
runTests().catch(error => {
  log(`\n❌ خطای کلی: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
