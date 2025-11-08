import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    // Check if user has permission to delete coworkers
    const userRole = (session as any).user?.role || session.role || '';
    if (!['ceo', 'admin', 'مدیر'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'شما مجوز حذف همکار ندارید' },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Check if user exists in this tenant
      const [users] = await conn.query(
        'SELECT id FROM users WHERE id = ? AND tenant_key = ?',
        [userId, tenantKey]
      ) as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      if (hard) {
        // Hard delete - permanently remove user
        await conn.query(
          'DELETE FROM users WHERE id = ? AND tenant_key = ?',
          [userId, tenantKey]
        );
      } else {
        // Soft delete - mark as inactive
        await conn.query(
          'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_key = ?',
          ['inactive', userId, tenantKey]
        );
      }

      return NextResponse.json({
        success: true,
        message: hard ? 'همکار با موفقیت حذف شد' : 'همکار غیرفعال شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف همکار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
