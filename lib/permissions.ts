import { executeQuery } from '@/lib/database';

export interface UserPermissions {
  userId: string;
  role: string;
  modules: string[];
}

/**
 * دریافت دسترسی‌های کاربر
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    // دریافت اطلاعات کاربر
    const users = await executeQuery(
      'SELECT id, role FROM users WHERE id = ? AND status = "active"',
      [userId]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // اگر کاربر مدیر عامل است، به همه ماژول‌ها دسترسی دارد
    if (user.role === 'ceo') {
      const allModules = await executeQuery(
        'SELECT name FROM modules WHERE is_active = 1'
      );
      return {
        userId: user.id,
        role: user.role,
        modules: allModules.map(m => m.name)
      };
    }

    // دریافت دسترسی‌های خاص کاربر
    const permissions = await executeQuery(`
      SELECT m.name
      FROM user_module_permissions ump
      JOIN modules m ON ump.module_id = m.id
      WHERE ump.user_id = ? AND ump.granted = 1 AND m.is_active = 1
    `, [userId]);

    return {
      userId: user.id,
      role: user.role,
      modules: permissions.map(p => p.name)
    };

  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

/**
 * چک کردن دسترسی کاربر به یک ماژول خاص
 */
export async function hasPermission(userId: string, moduleName: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId);
    if (!permissions) return false;

    // مدیر عامل به همه چیز دسترسی دارد
    if (permissions.role === 'ceo') return true;

    // چک کردن دسترسی خاص
    return permissions.modules.includes(moduleName);

  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * چک کردن دسترسی کاربر به یک مسیر خاص
 */
export async function hasRoutePermission(userId: string, route: string): Promise<boolean> {
  try {
    // مسیرهای عمومی که همه کاربران به آن دسترسی دارند
    const publicRoutes = [
      '/dashboard',
      '/dashboard/profile',
      '/dashboard/chat',
      '/dashboard/tasks',
      '/dashboard/calendar'
    ];

    if (publicRoutes.includes(route)) {
      return true;
    }

    // دریافت اطلاعات کاربر
    const users = await executeQuery(
      'SELECT role FROM users WHERE id = ? AND status = "active"',
      [userId]
    );

    if (users.length === 0) return false;

    const user = users[0];

    // مدیر عامل به همه مسیرها دسترسی دارد
    if (user.role === 'ceo') return true;

    // پیدا کردن ماژول مربوط به مسیر
    const modules = await executeQuery(
      'SELECT id FROM modules WHERE route = ? AND is_active = 1',
      [route]
    );

    if (modules.length === 0) {
      // اگر ماژولی برای این مسیر تعریف نشده، دسترسی آزاد
      return true;
    }

    const moduleId = modules[0].id;

    // چک کردن دسترسی کاربر به این ماژول
    const permissions = await executeQuery(
      'SELECT granted FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    return permissions.length > 0 && permissions[0].granted === 1;

  } catch (error) {
    console.error('Error checking route permission:', error);
    return false;
  }
}

/**
 * دریافت منوی سایدبار بر اساس دسترسی‌های کاربر
 */
export async function getUserSidebarMenu(userId: string) {
  try {
    const permissions = await getUserPermissions(userId);
    if (!permissions) return [];

    // ماژول‌های عمومی که همه کاربران باید ببینند
    const publicModules = await executeQuery(`
      SELECT 
        id, name, display_name, description, route, icon, sort_order, parent_id
      FROM modules 
      WHERE is_active = 1 
        AND name IN ('dashboard', 'chat', 'tasks', 'calendar', 'profile')
      ORDER BY sort_order ASC
    `);

    // اگر مدیر عامل است، همه ماژول‌ها را برگردان
    if (permissions.role === 'ceo') {
      const allModules = await executeQuery(`
        SELECT 
          id, name, display_name, description, route, icon, sort_order, parent_id
        FROM modules 
        WHERE is_active = 1 
        ORDER BY sort_order ASC
      `);
      return allModules;
    }

    // دریافت ماژول‌هایی که کاربر به آنها دسترسی دارد
    const userModules = await executeQuery(`
      SELECT 
        m.id, m.name, m.display_name, m.description, m.route, m.icon, m.sort_order, m.parent_id
      FROM modules m
      JOIN user_module_permissions ump ON m.id = ump.module_id
      WHERE ump.user_id = ? AND ump.granted = 1 AND m.is_active = 1
        AND m.name NOT IN ('dashboard', 'chat', 'tasks', 'calendar', 'profile')
      ORDER BY m.sort_order ASC
    `, [userId]);

    // ترکیب ماژول‌های عمومی و اختصاصی
    const allUserModules = [...publicModules, ...userModules];
    
    // مرتب‌سازی بر اساس sort_order
    return allUserModules.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  } catch (error) {
    console.error('Error getting user sidebar menu:', error);
    return [];
  }
}

/**
 * ماژول‌های پیش‌فرض برای نقش‌های مختلف
 */
export const DEFAULT_PERMISSIONS = {
  ceo: [], // مدیر عامل به همه چیز دسترسی دارد
  sales_manager: [
    'dashboard', 'customers', 'contacts', 'coworkers', 'activities', 'interactions',
    'tasks', 'sales', 'products', 'deals', 'feedback', 'reports', 'daily_reports',
    'chat', 'customer_club', 'calendar', 'projects'
  ],
  sales_agent: [
    'dashboard', 'customers', 'contacts', 'activities', 'interactions',
    'tasks', 'sales', 'products', 'feedback', 'chat', 'calendar'
  ],
  agent: [
    'dashboard', 'customers', 'contacts', 'activities', 'interactions',
    'tasks', 'feedback', 'chat', 'tickets'
  ]
};

/**
 * اعطای دسترسی‌های پیش‌فرض به کاربر جدید
 */
export async function grantDefaultPermissions(userId: string, role: string) {
  try {
    const defaultModules = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || [];
    
    if (defaultModules.length === 0) return; // مدیر عامل نیاز به دسترسی خاص ندارد

    // دریافت شناسه ماژول‌ها
    const modules = await executeQuery(
      `SELECT id, name FROM modules WHERE name IN (${defaultModules.map(() => '?').join(',')}) AND is_active = 1`,
      defaultModules
    );

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // اعطای دسترسی‌ها
    for (const module of modules) {
      const id = 'ump-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
      await executeQuery(
        'INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
        [id, userId, module.id, now, now]
      );
    }

  } catch (error) {
    console.error('Error granting default permissions:', error);
  }
}