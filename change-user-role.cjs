const mysql = require('mysql2/promise');

async function changeUserRole() {
  console.log('🔄 تغییر نقش کاربر...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
  });

  try {
    const userEmail = 'Ahmadreza.avandi@gmail.com';
    const newRole = 'sales_specialist'; // کارشناس فروش - واقعاً می‌فروشه

    // 1. پیدا کردن کاربر
    console.log('1️⃣ پیدا کردن کاربر...');
    const [users] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND tenant_key = "rabin"',
      [userEmail]
    );

    if (users.length === 0) {
      console.log('❌ کاربر یافت نشد');
      return;
    }

    const user = users[0];
    console.log(`✅ کاربر یافت شد: ${user.name}`);
    console.log(`   نقش فعلی: ${user.role}`);
    console.log(`   نقش جدید: ${newRole}`);

    // 2. تغییر نقش کاربر
    console.log('\n2️⃣ تغییر نقش کاربر...');
    await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [newRole, user.id]
    );
    console.log('✅ نقش کاربر تغییر یافت');

    // 3. حذف دسترسی‌های قبلی
    console.log('\n3️⃣ حذف دسترسی‌های قبلی...');
    await connection.query(
      'DELETE FROM user_module_permissions WHERE user_id = ?',
      [user.id]
    );
    console.log('✅ دسترسی‌های قبلی حذف شد');

    // 4. اضافه کردن دسترسی‌های جدید
    console.log('\n4️⃣ اضافه کردن دسترسی‌های جدید...');
    const moduleNames = [
      'dashboard', 'customers', 'contacts', 'products', 'sales', 'deals',
      'activities', 'tasks', 'calendar', 'chat'
    ];

    let addedCount = 0;
    for (const moduleName of moduleNames) {
      // پیدا کردن ماژول
      const [modules] = await connection.query(
        'SELECT id FROM modules WHERE name = ? AND is_active = 1',
        [moduleName]
      );

      if (modules.length > 0) {
        const moduleId = modules[0].id;
        const permissionId = 'ump-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await connection.query(
          'INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
          [permissionId, user.id, moduleId, now, now]
        );
        
        addedCount++;
        console.log(`   ✅ ${moduleName}`);
      } else {
        console.log(`   ⚠️ ماژول ${moduleName} یافت نشد`);
      }
    }

    // 5. تأیید تغییرات
    console.log('\n5️⃣ تأیید تغییرات...');
    const [updatedUser] = await connection.query(
      'SELECT role FROM users WHERE id = ?',
      [user.id]
    );

    const [permissions] = await connection.query(
      'SELECT COUNT(*) as count FROM user_module_permissions WHERE user_id = ? AND granted = 1',
      [user.id]
    );

    console.log(`✅ نقش جدید: ${updatedUser[0].role}`);
    console.log(`✅ تعداد دسترسی‌ها: ${permissions[0].count}`);

    console.log('\n🎉 تغییر نقش کاربر کامل شد!');
    console.log('\n💡 حالا می‌توانید با این کاربر لاگین کنید و منوی محدود را ببینید');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

changeUserRole();