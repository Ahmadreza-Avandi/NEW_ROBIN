const mysql = require('mysql2/promise');

async function testCEOPermissionsDirect() {
  console.log('🔍 تست مستقیم دسترسی‌های CEO...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    const userId = '1337dd2e-aba8-4d95-ac96-a540979a17cd'; // مهندس کریمی
    
    // 1. بررسی کاربر
    console.log('1️⃣ بررسی کاربر...');
    const [users] = await connection.execute(
      'SELECT id, name, role, status FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log('❌ کاربر یافت نشد');
      return;
    }
    
    const user = users[0];
    console.log(`✅ کاربر: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    
    // 2. دریافت همه ماژول‌ها (چون CEO است)
    console.log('\n2️⃣ دریافت ماژول‌های فعال...');
    const [modules] = await connection.execute(`
      SELECT 
        id, name, display_name, description, route, icon, sort_order, parent_id
      FROM modules 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);
    
    console.log(`✅ تعداد ماژول‌های فعال: ${modules.length}`);
    
    // گروه‌بندی ماژول‌ها بر اساس دسته
    const modulesByCategory = {};
    modules.forEach(module => {
      const category = getModuleCategory(module.route);
      if (!modulesByCategory[category]) {
        modulesByCategory[category] = [];
      }
      modulesByCategory[category].push(module);
    });
    
    console.log('\n📋 ماژول‌ها بر اساس دسته:');
    Object.keys(modulesByCategory).forEach(category => {
      console.log(`\n   ${category}:`);
      modulesByCategory[category].forEach(module => {
        console.log(`   - ${module.display_name} (${module.route})`);
      });
    });
    
    // 3. بررسی دسترسی‌های موجود در user_module_permissions
    console.log('\n3️⃣ بررسی دسترسی‌های تعریف شده...');
    const [permissions] = await connection.execute(`
      SELECT ump.*, m.display_name, m.route 
      FROM user_module_permissions ump 
      LEFT JOIN modules m ON ump.module_id = m.id 
      WHERE ump.user_id = ?
    `, [userId]);
    
    if (permissions.length === 0) {
      console.log('❌ هیچ دسترسی خاصی تعریف نشده (طبیعی است برای CEO)');
    } else {
      console.log(`✅ تعداد دسترسی‌های تعریف شده: ${permissions.length}`);
      permissions.forEach(perm => {
        console.log(`   - ${perm.display_name}: ${perm.granted ? '✅' : '❌'}`);
      });
    }
    
    console.log('\n🎯 نتیجه‌گیری:');
    console.log(`   - کاربر ${user.name} با نقش ${user.role} باید به تمام ${modules.length} ماژول دسترسی داشته باشد`);
    console.log('   - چون نقش CEO است، نیازی به تعریف دسترسی خاص ندارد');
    console.log('   - سیستم باید به صورت خودکار همه ماژول‌ها را در منو نمایش دهد');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

function getModuleCategory(route) {
  if (!route) return 'سایر';
  
  if (route.includes('/dashboard/insights/')) return 'تحلیل و گزارش‌گیری';
  if (route.includes('/reports') || route.includes('/daily-reports')) return 'گزارش‌ها';
  if (route.includes('/customers') || route.includes('/contacts') || route.includes('/customer-club')) return 'مدیریت مشتریان';
  if (route.includes('/sales') || route.includes('/deals') || route.includes('/products')) return 'فروش و محصولات';
  if (route.includes('/coworkers') || route.includes('/settings') || route.includes('/system-monitoring')) return 'مدیریت سیستم';
  if (route.includes('/activities') || route.includes('/tasks') || route.includes('/calendar')) return 'فعالیت‌ها و وظایف';
  if (route.includes('/chat') || route.includes('/feedback') || route.includes('/documents')) return 'ارتباطات و اسناد';
  if (route === '/dashboard' || route.includes('/profile')) return 'اصلی';
  
  return 'سایر';
}

testCEOPermissionsDirect();