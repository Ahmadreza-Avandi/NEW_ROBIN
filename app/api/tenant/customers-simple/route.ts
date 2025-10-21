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
      const limit = request.nextUrl.searchParams.get('limit') || '1000';

      const [customers] = await conn.query(
        `SELECT id, name, email, phone, company_name as company 
         FROM customers 
         WHERE tenant_key = ?
         ORDER BY name 
         LIMIT ?`,
        [tenantKey, parseInt(limit)]
      ) as any[];

      return NextResponse.json({
        success: true,
        data: customers
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
