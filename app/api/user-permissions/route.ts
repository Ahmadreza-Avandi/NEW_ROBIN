import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken, hasModulePermission } from '@/lib/auth';

// GET /api/user-permissions - Get user permissions
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    // اگر کاربر مدیر عامل نیست، فقط دسترسی‌های خودش را ببیند
    if (user.role !== 'ceo' && userId && userId !== user.id) {
      return NextResponse.json({ error: 'دسترسی غیر مجاز' }, { status: 403 });
    }

    const targetUserId = userId || user.id;

    // دریافت فقط ماژول‌های اصلی سایدبار (حذف ماژول‌های اضافی)
    const modules = await executeQuery(`
      SELECT 
        m.id,
        m.name,
        m.display_name,
        m.description,
        m.route,
        m.icon,
        m.sort_order,
        m.parent_id,
        m.is_active,
        COALESCE(ump.granted, 0) as has_permission
      FROM modules m
      LEFT JOIN user_module_permissions ump ON m.id = ump.module_id AND ump.user_id = ?
      WHERE m.is_active = 1 
        AND m.route IS NOT NULL 
        AND m.route != '#'
        AND m.name IN (
          'dashboard', 'customers', 'contacts', 'coworkers', 'activities', 
          'chat', 'customer_club', 'sales', 'feedback', 'reports', 
          'daily_reports', 'insights', 'products', 'calendar', 'settings',
          'documents', 'system_monitoring', 'deals', 'tickets', 'projects',
          'feedback_analysis', 'sales_analysis', 'audio_analysis', 'reports_analysis',
          'customer_journey', 'loyalty_program', 'surveys', 'interactions',
          'tasks', 'touchpoints', 'customer-health', 'alerts', 'voice-of-customer'
        )
      ORDER BY m.sort_order ASC
    `, [targetUserId]);

    return NextResponse.json({
      success: true,
      data: modules
    });

  } catch (error) {
    console.error('Get user permissions error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت دسترسی‌ها' },
      { status: 500 }
    );
  }
}

// POST /api/user-permissions - Update user permissions
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== 'ceo') {
      return NextResponse.json({ error: 'فقط مدیر عامل می‌تواند دسترسی‌ها را تغییر دهد' }, { status: 403 });
    }

    const { userId, moduleId, granted } = await req.json();

    if (!userId || !moduleId) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر و ماژول الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود دسترسی قبلی
    const existingPermission = await executeQuery(
      'SELECT id FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existingPermission.length > 0) {
      // به‌روزرسانی دسترسی موجود
      await executeSingle(
        'UPDATE user_module_permissions SET granted = ?, updated_at = ? WHERE user_id = ? AND module_id = ?',
        [granted ? 1 : 0, now, userId, moduleId]
      );
    } else {
      // ایجاد دسترسی جدید
      const id = 'ump-' + Date.now().toString(36);
      await executeSingle(
        'INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, moduleId, granted ? 1 : 0, now, now]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'دسترسی با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Update user permissions error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی دسترسی‌ها' },
      { status: 500 }
    );
  }
}

// PUT /api/user-permissions - Bulk update permissions
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== 'ceo') {
      return NextResponse.json({ error: 'فقط مدیر عامل می‌تواند دسترسی‌ها را تغییر دهد' }, { status: 403 });
    }

    const { userId, permissions } = await req.json();

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر و لیست دسترسی‌ها الزامی است' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // حذف تمام دسترسی‌های قبلی کاربر
    await executeSingle(
      'DELETE FROM user_module_permissions WHERE user_id = ?',
      [userId]
    );

    // اضافه کردن دسترسی‌های جدید
    for (const permission of permissions) {
      if (permission.granted) {
        const id = 'ump-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
        await executeSingle(
          'INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, userId, permission.moduleId, 1, now, now]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'دسترسی‌ها با موفقیت به‌روزرسانی شدند'
    });

  } catch (error) {
    console.error('Bulk update permissions error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی دسترسی‌ها' },
      { status: 500 }
    );
  }
}