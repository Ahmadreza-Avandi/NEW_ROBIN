const mysql = require('mysql2/promise');

async function checkUserRole() {
  console.log('🔍 بررسی نقش کاربر Ahmadreza.avandi@gmail.com...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
  });

  try {
    // 1. بررسی کاربر در tenant rabin
    console.log('1️⃣ بررسی کاربر در tenant rabin...');
    const [users] = await connection.query(
      'SELECT id, name, email, role, status, tenant_key FROM users WHERE email = ? AND tenant_key = "rabin"',
      ['Ahmadreza.avandi@gmail.com']
    );

    if (users.length === 0) {
      console.log('❌ کاربر یافت نشد در tenant rabin');
      
      // بررسی در همه tenant ها
      console.log('\n2️⃣ جستجو در همه tenant ها...');
      const [allUsers] = await connection.query(
        'SELECT id, name, email, role, status, tenant_key FROM users WHERE email = ?',
        ['Ahmadreza.avandi@gmail.com']
      );
      
      if (allUsers.length > 0) {
        console.log('✅ کاربر در tenant های زیر یافت شد:');
        allUsers.forEach(user => {
          console.log(`   - Tenant: ${user.tenant_key}, Role: ${user.role}, Status: ${user.status}`);
        });
      } else {
        console.log('❌ کاربر در هیچ tenant یافت نشد');
      }
      return;
    }

    const user = users[0];
    console.log('✅ کاربر یافت شد:');
    console.log(`   نام: ${user.name}`);
    console.log(`   ایمیل: ${user.email}`);
    console.log(`   نقش: ${user.role}`);
    console.log(`   وضعیت: ${user.status}`);
    console.log(`   Tenant: ${user.tenant_key}`);

    // 2. بررسی دسترسی‌های تعریف شده
    console.log('\n3️⃣ بررسی دسترسی‌های تعریف شده...');
    const [permissions] = await connection.query(
      'SELECT COUNT(*) as count FROM user_module_permissions WHERE user_id = ?',
      [user.id]
    );

    console.log(`   تعداد دسترسی‌های تعریف شده: ${permissions[0].count}`);

    if (permissions[0].count > 0) {
      const [userPermissions] = await connection.query(
        `SELECT m.name, m.display_name, ump.granted 
         FROM user_module_permissions ump
         JOIN modules m ON ump.module_id = m.id
         WHERE ump.user_id = ?
         ORDER BY m.name`,
        [user.id]
      );

      console.log('\n📋 دسترسی‌های کاربر:');
      userPermissions.forEach(perm => {
        const status = perm.granted ? '✅' : '❌';
        console.log(`   ${status} ${perm.display_name} (${perm.name})`);
      });
    }

    // 3. تحلیل چرا به همه چیز دسترسی دارد
    console.log('\n🎯 تحلیل دسترسی:');
    if (user.role === 'ceo') {
      console.log('   ✅ کاربر نقش CEO دارد - به همه ماژول‌ها دسترسی دارد');
    } else if (permissions[0].count === 0) {
      console.log('   ⚠️ هیچ دسترسی خاصی تعریف نشده - از permissions پیش‌فرض استفاده می‌شود');
    } else {
      console.log('   ✅ دسترسی‌های خاص تعریف شده');
    }

    // 4. پیشنهاد راه‌حل
    console.log('\n💡 راه‌حل:');
    if (user.role === 'ceo') {
      console.log('   - برای محدود کردن دسترسی، نقش کاربر را تغییر دهید');
      console.log('   - یا منطق CEO را در API تغییر دهید');
    } else {
      console.log('   - دسترسی‌های خاص برای این کاربر تعریف کنید');
      console.log('   - یا نقش کاربر را به نقش مناسب تغییر دهید');
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserRole();