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
      const [rows] = await conn.query(
        'SELECT * FROM products WHERE tenant_key = ? ORDER BY created_at DESC',
        [tenantKey]
      );

      return NextResponse.json({
        success: true,
        data: rows
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت products:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
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
    const {
      name,
      description,
      sku,
      category,
      unit_price,
      cost,
      stock_quantity,
      reorder_level,
      supplier_id,
      tax_rate,
      discount_rate
    } = body;

    if (!name || !unit_price) {
      return NextResponse.json(
        { success: false, message: 'نام محصول و قیمت الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        `INSERT INTO products (
          id,
          tenant_key,
          name,
          description,
          sku,
          category,
          unit_price,
          cost,
          stock_quantity,
          reorder_level,
          supplier_id,
          tax_rate,
          discount_rate,
          created_by,
          created_at,
          updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantKey,
          name,
          description || null,
          sku || null,
          category || null,
          unit_price,
          cost || null,
          stock_quantity || 0,
          reorder_level || 0,
          supplier_id || null,
          tax_rate || 0,
          discount_rate || 0,
          session.user?.id || 'unknown'
        ]
      ) as any;

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت افزودن شد',
        id: result.insertId
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در افزودن product:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
