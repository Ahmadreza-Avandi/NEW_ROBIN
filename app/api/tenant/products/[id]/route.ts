import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        'SELECT * FROM products WHERE id = ? AND tenant_key = ?',
        [id, tenantKey]
      ) as any;

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: rows[0]
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت product:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      price,
      currency,
      status
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, message: 'نام محصول و قیمت الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // بررسی وجود محصول
      const [existingRows] = await conn.query(
        'SELECT id FROM products WHERE id = ? AND tenant_key = ?',
        [id, tenantKey]
      ) as any;

      if (existingRows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      // بروزرسانی محصول
      await conn.query(
        `UPDATE products SET 
          name = ?,
          description = ?,
          sku = ?,
          category = ?,
          price = ?,
          currency = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = ? AND tenant_key = ?`,
        [
          name,
          description || null,
          sku || null,
          category || null,
          price,
          currency || 'IRR',
          status || 'active',
          id,
          tenantKey
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت بروزرسانی شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در بروزرسانی product:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      // بررسی وجود محصول
      const [existingRows] = await conn.query(
        'SELECT id FROM products WHERE id = ? AND tenant_key = ?',
        [id, tenantKey]
      ) as any;

      if (existingRows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      // حذف محصول
      await conn.query(
        'DELETE FROM products WHERE id = ? AND tenant_key = ?',
        [id, tenantKey]
      );

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت حذف شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف product:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}