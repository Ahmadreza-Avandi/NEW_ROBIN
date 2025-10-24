#!/usr/bin/env node

/**
 * تنظیم کامل کاربر demo با permissions درست
 */

const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'crm_system'
};

async function setupDemoComplete() {
  let connection;
  
  try {
    console.log('🚀 تنظیم کامل کاربر demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر demo
    const [users] = await connection.query(
      'SELECT id, name, email, role, tenant_key FROM users WHERE tenant_key = ?',
      ['demo']
    );

    if (users.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = users[0];
    console.log(`✅ کاربر demo: ${demoUser.name} (${demoUser.email})`);

    // پاک کردن داده‌های قبلی
    console.log('\n🧹 پاک کردن داده‌های قبلی...');
    await connection.query('DELETE FROM user_module_permissions WHERE user_id = ?', [demoUser.id]);
    await connection.query('DELETE FROM modules WHERE id NOT LIKE "mod-%"');
    console.log('✅ داده‌های قبلی پاک شد');

    // تعریف modules جدید با IDs منحصر به فرد
    const modules = [
      { id: 'demo-001', name: 'dashboard', display_name: 'داشبورد', route: '/dashboard', icon: 'LayoutDashboard', sort_order: 1 },
      { id: 'demo-002', name: 'customers', display_name: 'مشتریان', route: '/dashboard/customers', icon: 'Users', sort_order: 2 },
      { id: 'demo-003', name: 'contacts', display_name: 'مخاطبین', route: '/dashboard/contacts', icon: 'UserCheck', sort_order: 3 },
      { id: 'demo-004', name: 'activities', display_name: 'فعالیت‌ها', route: '/dashboard/activities', icon: 'Activity', sort_order: 4 },
      { id: 'demo-005', name: 'coworkers', display_name: 'همکاران', route: '/dashboard/coworkers', icon: 'Users2', sort_order: 5 },
      { id: 'demo-006', name: 'tasks', display_name: 'وظایف', route: '/dashboard/tasks', icon: 'Target', sort_order: 6 },
      { id: 'demo-007', name: 'calendar', display_name: 'تقویم', route: '/dashboard/calendar', icon: 'Calendar', sort_order: 7 },
      { id: 'demo-008', name: 'sales', display_name: 'فروش‌ها', route: '/dashboard/sales', icon: 'TrendingUp', sort_order: 8 },
      { id: 'demo-009', name: 'deals', display_name: 'معاملات', route: '/dashboard/deals', icon: 'Briefcase', sort_order: 9 },
      { id: 'demo-010', name: 'products', display_name: 'محصولات', route: '/dashboard/products', icon: 'Package', sort_order: 10 },
      { id: 'demo-011', name: 'reports', display_name: 'گزارش‌ها', route: '/dashboard/reports', icon: 'BarChart3', sort_order: 11 },
      { id: 'demo-012', name: 'documents', display_name: 'مدیریت اسناد', route: '/dashboard/documents', icon: 'FileText', sort_order: 12 },
      { id: 'demo-013', name: 'chat', display_name: 'چت', route: '/dashboard/chat', icon: 'MessageCircle', sort_order: 13 },
      { id: 'demo-014', name: 'customer-club', display_name: 'باشگاه مشتریان', route: '/dashboard/customer-club', icon: 'Users', sort_order: 14 },
      { id: 'demo-015', name: 'feedback', display_name: 'بازخوردها', route: '/dashboard/feedback', icon: 'MessageCircle2', sort_order: 15 }
    ];

    // اضافه کردن modules
    console.log('\n📋 اضافه کردن modules جدید...');
    for (const module of modules) {
      await connection.query(`
        INSERT INTO modules (id, name, display_name, route, icon, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        route = VALUES(route),
        icon = VALUES(icon),
        sort_order = VALUES(sort_order)
      `, [module.id, module.name, module.display_name, module.route, module.icon, module.sort_order]);
      console.log(`   ✅ ${module.display_name}`);
    }

    // اضافه کردن permissions
    console.log('\n🔐 اضافه کردن permissions...');
    for (const module of modules) {
      await connection.query(`
        INSERT INTO user_module_permissions (user_id, module_id, granted)
        VALUES (?, ?, TRUE)
        ON DUPLICATE KEY UPDATE granted = TRUE
      `, [demoUser.id, module.id]);
      console.log(`   ✅ ${module.display_name}`);
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی:');
    const [finalCheck] = await connection.query(`
      SELECT 
        m.name,
        m.display_name,
        m.route,
        ump.granted
      FROM user_module_permissions ump
      JOIN modules m ON ump.module_id = m.id
      WHERE ump.user_id = ? AND ump.granted = TRUE
      ORDER BY m.sort_order
    `, [demoUser.id]);

    console.log(`   ✅ کل permissions: ${finalCheck.length}`);
    finalCheck.forEach(p => {
      console.log(`   - ${p.display_name} (${p.route})`);
    });

    // اضافه کردن داده‌های تستی برای tenant demo
    console.log('\n📝 اضافه کردن داده‌های تستی...');
    
    // مشتری تستی
    await connection.query(`
      INSERT INTO customers (id, name, email, phone, company, status, tenant_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `, ['demo-customer-1', 'مشتری دمو', 'customer@demo.com', '09123456789', 'شرکت دمو', 'active', 'demo']);

    // فعالیت تستی
    await connection.query(`
      INSERT INTO activities (id, type, title, description, user_id, customer_id, tenant_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, ['demo-activity-1', 'call', 'تماس با مشتری دمو', 'تماس تستی برای بررسی وضعیت', demoUser.id, 'demo-customer-1', 'demo']);

    // وظیفه تستی
    await connection.query(`
      INSERT INTO tasks (id, title, description, assigned_to, status, tenant_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, ['demo-task-1', 'وظیفه تستی دمو', 'این یک وظیفه تستی برای کاربر دمو است', demoUser.id, 'pending', 'demo']);

    console.log('   ✅ مشتری تستی اضافه شد');
    console.log('   ✅ فعالیت تستی اضافه شد');
    console.log('   ✅ وظیفه تستی اضافه شد');

    console.log('\n✨ تنظیمات کامل با موفقیت انجام شد!');
    console.log('🌐 لینک دسترسی: http://localhost:3000/demo/dashboard');
    console.log('🔄 لطفاً صفحه را refresh کنید تا تغییرات اعمال شود.');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDemoComplete();