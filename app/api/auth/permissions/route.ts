import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import jwt from 'jsonwebtoken';

// GET /api/auth/permissions - Get user's permissions and sidebar menu
export async function GET(req: NextRequest) {
  try {
    // دریافت tenant_key از headers (set شده توسط middleware)
    const tenantKey = req.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // دریافت token از cookies
    const token = req.cookies.get('tenant_token')?.value ||
      req.cookies.get('auth-token')?.value;

    if (!token) {
      console.warn('❌ No token found in cookies');
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    if (!decoded || !decoded.userId) {
      console.warn('❌ Invalid token payload');
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    // دریافت pool به tenant database
    const pool = await getTenantConnection(tenantKey);
    const connection = await pool.getConnection();

    try {
      // دریافت اطلاعات کاربر
      const [users] = await connection.query(
        'SELECT id, name, email, role, avatar_url FROM users WHERE id = ? AND status = "active"',
        [decoded.userId]
      ) as any[];

      if (users.length === 0) {
        console.warn(`❌ User not found: ${decoded.userId}`);
        return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
      }

      const user = users[0];

      // دریافت permissions از database
      let menuItems: any[] = [];
      
      // اگر کاربر CEO است، همه ماژول‌های فعال را برگردان
      if (user.role === 'ceo') {
        console.log('🔍 CEO detected - fetching all active modules');
        const [allModules] = await connection.query(
          `SELECT 
            id,
            name,
            display_name,
            route,
            icon,
            sort_order,
            parent_id
           FROM modules 
           WHERE is_active = 1 
           ORDER BY sort_order`,
          []
        ) as any[];

        menuItems = allModules.map(m => ({
          id: m.id,
          name: m.name,
          display_name: m.display_name,
          route: m.route,
          icon: m.icon,
          sort_order: m.sort_order,
          parent_id: m.parent_id,
          can_view: 1,
          can_create: 1,
          can_edit: 1,
          can_delete: 1
        }));
        
        console.log(`✅ CEO has access to ${menuItems.length} modules`);
      } else {
        // برای سایر نقش‌ها، permissions خاص را بررسی کن
        try {
          const [modulePermissions] = await connection.query(
            `SELECT 
              m.id,
              m.name,
              m.display_name,
              m.route,
              m.icon,
              m.sort_order,
              m.parent_id,
              ump.granted as can_view
             FROM user_module_permissions ump
             JOIN modules m ON ump.module_id = m.id
             WHERE ump.user_id = ? AND ump.granted = 1 AND m.is_active = 1
             ORDER BY m.sort_order`,
            [decoded.userId]
          ) as any[];

          if (modulePermissions.length > 0) {
            menuItems = modulePermissions.map(p => ({
              id: p.id,
              name: p.name,
              display_name: p.display_name,
              route: p.route,
              icon: p.icon,
              sort_order: p.sort_order,
              parent_id: p.parent_id,
              can_view: 1,
              can_create: 1,
              can_edit: 1,
              can_delete: 1
            }));
          } else {
            // Fallback to default permissions
            menuItems = getDefaultPermissions(user.role);
          }
        } catch (error) {
          console.warn('Could not fetch permissions from database:', error);
          // Use default permissions based on role
          menuItems = getDefaultPermissions(user.role);
        }
      }

      return NextResponse.json({
        success: true,
        data: menuItems,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get permissions API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت دسترسی‌ها' },
      { status: 500 }
    );
  }
}

// دریافت دسترسی‌های پیش‌فرض براساس نقش
function getDefaultPermissions(role: string): any[] {
  const defaultPermissions: Record<string, any[]> = {
    // مدیرعامل - به همه چیز دسترسی دارد (در بالا handle می‌شود)
    'ceo': [],
    
    // مدیر فروش - مجبور می‌کنه بفروشن
    'sales_manager': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'products', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'sales', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'deals', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'reports', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'coworkers', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
      { module: 'tasks', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'calendar', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'chat', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ],
    
    // کارشناس فروش - واقعاً می‌فروشه
    'sales_specialist': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'products', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'sales', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'deals', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'tasks', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'calendar', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'chat', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ],
    
    // کارشناس فنی - باعث میشه فروش شدنی باشه
    'technical_specialist': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'products', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'tasks', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'calendar', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'documents', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'feedback', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'chat', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ],
    
    // مدیر تیم تخصصی - نگهبان کیفیت و تحویل وعده
    'team_manager': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'products', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'coworkers', can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 },
      { module: 'tasks', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'calendar', can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 },
      { module: 'documents', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'reports', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'feedback', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'chat', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ],
    
    // نقش‌های قدیمی برای سازگاری
    'manager': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'sales', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'reports', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
    ],
    'employee': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 },
      { module: 'contacts', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
      { module: 'customers', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
    ],
    'agent': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ],
    'user': [
      { module: 'dashboard', can_view: 1, can_create: 0, can_edit: 0, can_delete: 0 },
      { module: 'activities', can_view: 1, can_create: 1, can_edit: 0, can_delete: 0 },
    ]
  };

  return defaultPermissions[role] || defaultPermissions['user'] || [];
}