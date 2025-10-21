import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

// GET /api/coworkers - دریافت لیست همکاران
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get tenant_key from headers (set by middleware)
    const tenantKey = req.headers.get('X-Tenant-Key');
    
    // دریافت لیست همکاران (فقط از tenant فعلی)
    const coworkers = await executeQuery(`
      SELECT DISTINCT
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.tenant_key
      FROM users u
      INNER JOIN activities a ON u.id = a.performed_by
      WHERE u.status = 'active'
        AND u.tenant_key = ?
      ORDER BY u.full_name ASC, u.username ASC
    `, [tenantKey || 'rabin']);

    return NextResponse.json({
      success: true,
      data: coworkers || []
    });

  } catch (error) {
    console.error('خطا در دریافت همکاران:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت همکاران' },
      { status: 500 }
    );
  }
}
