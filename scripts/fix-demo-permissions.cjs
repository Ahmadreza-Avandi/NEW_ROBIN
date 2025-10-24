#!/usr/bin/env node

/**
 * تنظیم permissions و modules برای کاربر demo
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

async function fixDemoPermissions() {
  let connection;
  
  try {
    console.log('🔧 تنظیم permissions برای کاربر demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر demo
    const [users] = await connection.query(
      'SELECT id, name, email, role, tenant_key FROM users WHERE email = ? OR tenant_key = ?',
      ['demo@gmail.com', 'demo']
    );

    if (users.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = users[0];
    console.log(`✅ کاربر demo یافت شد: ${demoUser.name} (${demoUser.email})`);
    console.log(`   Role: ${demoUser.role}, Tenant: ${demoUser.tenant_key}\n`);

    // بررسی وجود جدول modules
    const [modulesTables] = await connection.query("SHOW TABLES LIKE 'modules'");
    
    if (modulesTables.length === 0) {
      console.log('📋 ایجاد جدول modules...');
      await connection.query(`
        CREATE TABLE modules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(200) NOT NULL,
          route VARCHAR(200) NOT NULL,
          icon VARCHAR(100) DEFAULT 'LayoutDashboard',
          sort_order INT DEFAULT 0,
          parent_id INT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES modules(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ جدول modules ایجاد شد\n');
    }

    // بررسی وجود جدول user_module_permissions
    const [permissionsTables] = await connection.query("SHOW TABLES LIKE 'user_module_permissions'");
    
    if (permissionsTables.length === 0) {
      console.log('📋 ایجاد جدول user_module_permissions...');
      await connection.query(`
        CREATE TABLE user_module_permissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          module_id INT NOT NULL,
          granted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_module (user_id, module_id),
          FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ جدول user_module_permissions ایجاد شد\n');
    }

    // تعریف modules پایه
    const baseModules = [
      { name: 'dashboard', display_name: 'داشبورد', route: '/dashboard', icon: 'LayoutDashboard', sort_order: 1 },
      { name: 'customers', display_name: 'مشتریان', route: '/dashboard/customers', icon: 'Users', sort_order: 2 },
      { name: 'contacts', display_name: 'مخاطبین', route: '/dashboard/contacts', icon: 'UserCheck', sort_order: 3 },
      { name: 'activities', display_name: 'فعالیت‌ها', route: '/dashboard/activities', icon: 'Activity', sort_order: 4 },
      { name: 'coworkers', display_name: 'همکاران', route: '/dashboard/coworkers', icon: 'Users2', sort_order: 5 },
      { name: 'tasks', display_name: 'وظایف', route: '/dashboard/tasks', icon: 'Target', sort_order: 6 },
      { name: 'calendar', display_name: 'تقویم', route: '/dashboard/calendar', icon: 'Calendar', sort_order: 7 },
      { name: 'sales', display_name: 'فروش‌ها', route: '/dashboard/sales', icon: 'TrendingUp', sort_order: 8 },
      { name: 'deals', display_name: 'معاملات', route: '/dashboard/deals', icon: 'Briefcase', sort_order: 9 },
      { name: 'products', display_name: 'محصولات', route: '/dashboard/products', icon: 'Package', sort_order: 10 },
      { name: 'reports', display_name: 'گزارش‌ها', route: '/dashboard/reports', icon: 'BarChart3', sort_order: 11 },
      { name: 'documents', display_name: 'مدیریت اسناد', route: '/dashboard/documents', icon: 'FileText', sort_order: 12 },
      { name: 'chat', display_name: 'چت', route: '/dashboard/chat', icon: 'MessageCircle', sort_order: 13 },
      { name: 'customer-club', display_name: 'باشگاه مشتریان', route: '/dashboard/customer-club', icon: 'Users', sort_order: 14 },
      { name: 'feedback', display_name: 'بازخوردها', route: '/dashboard/feedback', icon: 'MessageCircle2', sort_order: 15 }
    ];

    // اضافه کردن modules
    console.log('📋 اضافه کردن modules...');
    for (const module of baseModules) {
      await connection.query(`
        INSERT INTO modules (name, display_name, route, icon, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        route = VALUES(route),
        icon = VALUES(icon),
        sort_order = VALUES(sort_order)
      `, [module.name, module.display_name, module.route, module.icon, module.sort_order]);
      console.log(`   ✅ ${module.display_name}`);
    }

    // دریافت IDs modules
    const [modules] = await connection.query('SELECT id, name FROM modules WHERE is_active = TRUE');
    const moduleMap = {};
    modules.forEach(m => {
      moduleMap[m.name] = m.id;
    });

    // اضافه کردن permissions برای کاربر demo (CEO دسترسی کامل)
    console.log('\n🔐 تنظیم permissions برای کاربر demo...');
    
    // حذف permissions قبلی
    await connection.query('DELETE FROM user_module_permissions WHERE user_id = ?', [demoUser.id]);
    
    // اضافه کردن permissions جدید
    for (const module of baseModules) {
      const moduleId = moduleMap[module.name];
      if (moduleId) {
        await connection.query(`
          INSERT INTO user_module_permissions (user_id, module_id, granted)
          VALUES (?, ?, TRUE)
        `, [demoUser.id, moduleId]);
        console.log(`   ✅ ${module.display_name}`);
      }
    }

    // بررسی نهایی
    console.log('\n📊 بررسی نهایی permissions:');
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

    console.log(`   کل permissions: ${finalCheck.length}`);
    finalCheck.forEach(p => {
      console.log(`   - ${p.display_name} (${p.route})`);
    });

    console.log('\n✨ تنظیمات با موفقیت انجام شد!');
    console.log('🔄 لطفاً صفحه را refresh کنید تا تغییرات اعمال شود.');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDemoPermissions();