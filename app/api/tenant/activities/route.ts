import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
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

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Get query parameters
      const customerId = request.nextUrl.searchParams.get('customer_id');
      const search = request.nextUrl.searchParams.get('search');
      const type = request.nextUrl.searchParams.get('type');
      const startDate = request.nextUrl.searchParams.get('start_date');
      const endDate = request.nextUrl.searchParams.get('end_date');
      const performedBy = request.nextUrl.searchParams.get('performed_by');
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
      const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

      let query = `
        SELECT 
          a.id, a.tenant_key, a.customer_id, a.type, a.title, a.description,
          a.start_time, a.outcome, a.location, a.notes, a.created_at, a.updated_at,
          a.performed_by,
          c.name as customer_name,
          u.name as performed_by_name
        FROM activities a
        LEFT JOIN customers c ON a.customer_id = c.id AND a.tenant_key COLLATE utf8mb4_unicode_ci = c.tenant_key COLLATE utf8mb4_unicode_ci
        LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key COLLATE utf8mb4_unicode_ci = u.tenant_key COLLATE utf8mb4_unicode_ci
        WHERE a.tenant_key = ?
      `;
      let params: any[] = [tenantKey];

      // Filter by customer_id if provided
      if (customerId) {
        query += ' AND a.customer_id = ?';
        params.push(customerId);
      }

      // Filter by type if provided
      if (type && type !== 'all') {
        query += ' AND a.type = ?';
        params.push(type);
      }

      // Filter by date range if provided
      if (startDate) {
        query += ' AND DATE(a.start_time) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(a.start_time) <= ?';
        params.push(endDate);
      }

      // Filter by performed_by if provided
      if (performedBy && performedBy !== 'all') {
        query += ' AND a.performed_by = ?';
        params.push(performedBy);
      }

      // Search in title and description
      if (search) {
        query += ' AND (a.title LIKE ? OR a.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      try {
        const [rows] = await conn.query(query, params);
        return NextResponse.json({
          success: true,
          data: rows
        });
      } catch (queryError) {
        console.error('❌ Query execution error:', queryError);
        console.error('Query:', query);
        console.error('Params:', params);
        throw queryError;
      }
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت activities:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور', error: errorMessage },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { customer_id, type, title, description, outcome, start_time } = body;

    if (!customer_id || !title) {
      return NextResponse.json(
        { success: false, message: 'مشتری و عنوان الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const userId = (session as any).user?.id || session.userId || 'unknown';

      const [result] = await conn.query(
        `INSERT INTO activities (
          id, tenant_key, customer_id, type, title, description, 
          outcome, start_time, performed_by, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          tenantKey,
          customer_id,
          type || 'call',
          title,
          description || null,
          outcome || 'completed',
          start_time || new Date().toISOString(),
          userId
        ]
      ) as any;

      return NextResponse.json({
        success: true,
        message: 'فعالیت با موفقیت ثبت شد',
        data: { id: result.insertId }
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در ثبت فعالیت:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const activityId = request.nextUrl.searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { success: false, message: 'ID فعالیت الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      await conn.query(
        'DELETE FROM activities WHERE id = ? AND tenant_key = ?',
        [activityId, tenantKey]
      );

      return NextResponse.json({
        success: true,
        message: 'فعالیت با موفقیت حذف شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف فعالیت:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
