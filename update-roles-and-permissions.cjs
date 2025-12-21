const mysql = require('mysql2/promise');

async function updateRolesAndPermissions() {
  console.log('🔄 به‌روزرسانی نقش‌ها و دسترسی‌ها...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
  });

  try {
    // 1. نمایش نقش‌های فعلی
    console.log('1️⃣ نقش‌های فعلی در سیستم:');
    const [currentRoles] = await connection.query(
      'SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
    );
    
    currentRoles.forEach(role => {
      console.log(`   - ${role.role}: ${role.count} کاربر`);
    });

    // 2. تعریف نقش‌های جدید و دسترسی‌های پیش‌فرض
    const rolePermissions = {
      'ceo': [], // به همه چیز دسترسی دارد
      'sales_manager': [
        'dashboard', 'customers', 'contacts', 'products', 'sales', 'deals', 
        'activities', 'reports', 'coworkers', 'tasks', 'calendar', 'chat'
      ],
      'sales_specialist': [
        'dashboard', 'customers', 'contacts', 'products', 'sales', 'deals',
        'activities', 'tasks', 'calendar', 'chat'
      ],
      'technical_specialist': [
        'dashboard', 'customers', 'contacts', 'products', 'activities', 
        'tasks', 'calendar', 'documents', 'feedback', 'chat'
      ],
      'team_manager': [
        'dashboard', 'customers', 'contacts', 'products', 'activities', 
        'coworkers', 'tasks', 'calendar', 'documents', 'reports', 'feedback', 'chat'
      ]
    };

    console.log('\n2️⃣ نقش‌های جدید و دسترسی‌های پیش‌فرض:');
    Object.entries(rolePermissions).forEach(([role, permissions]) => {
      const roleNames = {
        'ceo': 'مدیرعامل - می‌پرسه چرا نفروختید؟',
        'sales_manager': 'مدیر فروش - مجبور می‌کنه بفروشن',
        'sales_specialist': 'کارشناس فروش - واقعاً می‌فروشه',
        'technical_specialist': 'کارشناس فنی - باعث میشه فروش شدنی باشه',
        'team_manager': 'مدیر تیم تخصصی - نگهبان کیفیت و تحویل وعده'
      };
      
      console.log(`   ${roleNames[role]}`);
      if (permissions.length > 0) {
        console.log(`     دسترسی‌ها: ${permissions.join(', ')}`);
      } else {
        console.log(`     دسترسی‌ها: همه ماژول‌ها`);
      }
    });

    // 3. اضافه کردن دسترسی‌های پیش‌فرض برای کاربران موجود
    console.log('\n3️⃣ اضافه کردن دسترسی‌های پیش‌فرض...');
    
    for (const [role, moduleNames] of Object.entries(rolePermissions)) {
      if (moduleNames.length === 0) continue; // CEO به همه چیز دسترسی دارد
      
      // پیدا کردن کاربران با این نقش
      const [users] = await connection.query(
        'SELECT id, name, email FROM users WHERE role = ? AND status = "active"',
        [role]
      );

      if (users.length === 0) {
        console.log(`   ⚠️ هیچ کاربری با نقش ${role} یافت نشد`);
        continue;
      }

      console.log(`   📝 پردازش ${users.length} کاربر با نقش ${role}...`);

      for (const user of users) {
        // حذف دسترسی‌های قبلی
        await connection.query(
          'DELETE FROM user_module_permissions WHERE user_id = ?',
          [user.id]
        );

        // اضافه کردن دسترسی‌های جدید
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
          }
        }

        console.log(`     ✅ ${user.name} (${user.email})`);
      }
    }

    // 4. نمایش خلاصه
    console.log('\n4️⃣ خلاصه تغییرات:');
    const [updatedStats] = await connection.query(`
      SELECT 
        u.role,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT ump.module_id) as permission_count
      FROM users u
      LEFT JOIN user_module_permissions ump ON u.id = ump.user_id AND ump.granted = 1
      WHERE u.status = 'active'
      GROUP BY u.role
      ORDER BY user_count DESC
    `);

    updatedStats.forEach(stat => {
      const roleNames = {
        'ceo': 'مدیرعامل',
        'sales_manager': 'مدیر فروش',
        'sales_specialist': 'کارشناس فروش',
        'technical_specialist': 'کارشناس فنی',
        'team_manager': 'مدیر تیم تخصصی',
        'agent': 'نماینده',
        'manager': 'مدیر',
        'employee': 'کارمند'
      };
      
      const roleName = roleNames[stat.role] || stat.role;
      console.log(`   ${roleName}: ${stat.user_count} کاربر، ${stat.permission_count} دسترسی`);
    });

    console.log('\n🎉 به‌روزرسانی نقش‌ها و دسترسی‌ها کامل شد!');
    console.log('\n💡 نکات مهم:');
    console.log('   - مدیرعامل به همه ماژول‌ها دسترسی دارد (بدون نیاز به تعریف دسترسی خاص)');
    console.log('   - سایر نقش‌ها دسترسی‌های پیش‌فرض دریافت کردند');
    console.log('   - می‌توانید از طریق پنل همکاران دسترسی‌ها را تغییر دهید');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

updateRolesAndPermissions();