import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(
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

    const productId = params.id;

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [rows] = await conn.query(
        'SELECT * FROM products WHERE id = ? AND tenant_key = ?',
        [productId, tenantKey]
      );

      const products = rows as any[];

      if (products.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: products[0]
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت محصول:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
