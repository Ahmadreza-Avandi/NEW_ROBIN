const mysql = require('mysql2/promise');

async function testCEOMenuStructure() {
  console.log('🔍 تست ساختار منوی CEO...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
  });

  try {
    // 1. بررسی کاربر CEO
    const [users] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE role = "ceo" AND status = "active" LIMIT 1'
    );

    if (users.length === 0) {
      console.log('❌ هیچ کاربر CEO فعالی یافت نشد');
      return;
    }

    const ceoUser = users[0];
    console.log('✅ کاربر CEO یافت شد:');
    console.log(`   نام: ${ceoUser.name}`);
    console.log(`   ایمیل: ${ceoUser.email}`);
    console.log(`   نقش: ${ceoUser.role}\n`);

    // 2. بررسی ماژول‌های موجود
    const [modules] = await connection.query(
      'SELECT name, display_name, route FROM modules WHERE is_active = 1 ORDER BY sort_order'
    );

    console.log(`✅ تعداد ماژول‌های فعال: ${modules.length}\n`);

    // 3. ساختار منوی مورد انتظار
    const expectedMenuStructure = [
      'داشبورد',
      'مدیریت فروش',
      '  - محصولات',
      '  - فروش‌ها',
      'مدیریت تجربه مشتری',
      '  - مشتریان',
      '  - مخاطبین',
      '  - باشگاه مشتریان',
      '  - بازخوردها',
      'مدیریت همکاران',
      '  - همکاران',
      '  - فعالیت‌ها',
      '  - تقویم',
      '  - وظایف',
      '  - مدیریت اسناد',
      '  - گزارش‌گیری',
      'مدیریت وظایف',
      'مانیتورینگ سیستم',
      'چت',
      'باشگاه مشتریان',
      'صدای رابین'
    ];

    console.log('📋 ساختار منوی مورد انتظار برای CEO:');
    expectedMenuStructure.forEach(item => {
      console.log(`   ${item}`);
    });

    console.log('\n🎯 نتیجه‌گیری:');
    console.log('   - کاربر CEO باید به تمام ماژول‌ها دسترسی داشته باشد');
    console.log('   - منوی سایدبار باید ساختار بالا را نمایش دهد');
    console.log('   - هر آیتم منو باید به مسیر صحیح لینک شود');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

testCEOMenuStructure();