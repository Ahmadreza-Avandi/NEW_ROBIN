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
      const [coworkers] = await conn.query(
        `SELECT id, name, email, phone, role, department, status 
         FROM users 
         WHERE tenant_key = ? AND status = 'active'
         ORDER BY name`,
        [tenantKey]
      ) as any[];

      return NextResponse.json({
        success: true,
        data: coworkers
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching coworkers:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
