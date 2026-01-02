import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

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

export async function PUT(
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
    const body = await request.json();
    const {
      name,
      description,
      image,
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
      // ابتدا بررسی کنیم محصول وجود دارد
      const [existingProducts] = await conn.query(
        'SELECT name FROM products WHERE id = ? AND tenant_key = ?',
        [productId, tenantKey]
      ) as any[];

      if (existingProducts.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      const oldProductName = existingProducts[0].name;

      // بروزرسانی محصول
      await conn.query(
        `UPDATE products SET 
          name = ?, 
          description = ?, 
          image = ?, 
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
          image || null,
          sku || null,
          category || null,
          price,
          currency || 'IRR',
          status || 'active',
          productId,
          tenantKey
        ]
      );

      // ثبت فعالیت
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'product',
        title: `ویرایش محصول: ${name}`,
        description: `محصول ${oldProductName} ویرایش شد${oldProductName !== name ? ` و نام آن به ${name} تغییر یافت` : ''}`
      });

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت بروزرسانی شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در بروزرسانی محصول:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
