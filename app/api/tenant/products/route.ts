import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

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
      // دریافت پارامترهای فیلتر از URL
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      const status = searchParams.get('status') || '';

      console.log('🔍 Filters received:', { search, category, status });

      // ساخت کوئری با فیلترها
      let query = 'SELECT * FROM products WHERE tenant_key = ?';
      const params: any[] = [tenantKey];

      if (search && search.trim()) {
        query += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (category && category !== 'all' && category.trim()) {
        query += ' AND category = ?';
        params.push(category.trim());
      }

      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      console.log('📊 Query:', query);
      console.log('📊 Params:', params);

      const [rows] = await conn.query(query, params);

      console.log('✅ Products found:', (rows as any[]).length);

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

export async function PUT(request: NextRequest) {
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
      id,
      name,
      description,
      image,
      sku,
      category,
      price,
      currency,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        params.push(description);
      }
      if (image !== undefined) {
        updateFields.push('image = ?');
        params.push(image);
      }
      if (sku !== undefined) {
        updateFields.push('sku = ?');
        params.push(sku);
      }
      if (category !== undefined) {
        updateFields.push('category = ?');
        params.push(category);
      }
      if (price !== undefined) {
        updateFields.push('price = ?');
        params.push(price);
      }
      if (currency !== undefined) {
        updateFields.push('currency = ?');
        params.push(currency);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }

      updateFields.push('updated_at = NOW()');
      params.push(id, tenantKey);

      await conn.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ? AND tenant_key = ?`,
        params
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
      price,
      unit_price, // برای سازگاری با نسخه قدیمی
      currency,
      status
    } = body;

    const productPrice = price || unit_price;

    if (!name || !productPrice) {
      return NextResponse.json(
        { success: false, message: 'نام محصول و قیمت الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const userId = session.userId || session.id;
      
      const image = body.image || null;

      const [result] = await conn.query(
        `INSERT INTO products (
          id,
          tenant_key,
          name,
          description,
          image,
          sku,
          category,
          price,
          currency,
          status,
          created_by,
          created_at,
          updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantKey,
          name,
          description || null,
          image,
          sku || null,
          category || null,
          productPrice,
          currency || 'IRR',
          status || 'active',
          userId
        ]
      ) as any;

      // ثبت خودکار فعالیت
      const userName = session.user?.name || 'کاربر';
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'product',
        title: `محصول جدید: ${name}`,
        description: `محصول ${name} با قیمت ${productPrice.toLocaleString('fa-IR')} ${currency || 'IRR'} اضافه شد${category ? ` - دسته‌بندی: ${category}` : ''}`
      });

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
