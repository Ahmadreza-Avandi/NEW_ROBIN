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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // ابتدا نام محصول را برای لاگ دریافت کنیم
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

      const productName = existingProducts[0].name;

      // حذف محصول
      const [result] = await conn.query(
        'DELETE FROM products WHERE id = ? AND tenant_key = ?',
        [productId, tenantKey]
      ) as any;

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد یا قبلاً حذف شده' },
          { status: 404 }
        );
      }

      // ثبت فعالیت حذف
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'product',
        title: `حذف محصول: ${productName}`,
        description: `محصول ${productName} با شناسه ${productId} حذف شد`
      });

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت حذف شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف محصول:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [API Products POST] درخواست جدید دریافت شد');
  
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');
    console.log('🔑 [API Products POST] Tenant Key:', tenantKey);

    if (!tenantKey) {
      console.error('❌ [API Products POST] Tenant key یافت نشد');
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    console.log('🔐 [API Products POST] بررسی احراز هویت...');
    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      console.error('❌ [API Products POST] دسترسی غیرمجاز - session یافت نشد');
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    console.log('✅ [API Products POST] احراز هویت موفق - User:', session.userId || session.id);

    const body = await request.json();
    console.log('📦 [API Products POST] داده‌های دریافتی:', body);

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
    console.log('💰 [API Products POST] قیمت محصول:', productPrice);

    if (!name || !productPrice) {
      console.error('❌ [API Products POST] اطلاعات ناقص:', { name, productPrice });
      return NextResponse.json(
        { success: false, message: 'نام محصول و قیمت الزامی است' },
        { status: 400 }
      );
    }

    console.log('🔌 [API Products POST] اتصال به دیتابیس...');
    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // استخراج userId با روش‌های مختلف
      const userId = session.userId || session.id || session.user?.id || 'unknown';
      
      console.log('📝 [API Products POST] آماده‌سازی داده‌ها برای درج:', {
        name,
        price: productPrice,
        userId,
        tenantKey,
        category,
        sku,
        currency: currency || 'IRR',
        status: status || 'active'
      });
      
      const image = body.image || null;

      console.log('💾 [API Products POST] درج در دیتابیس...');
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
      
      console.log('✅ [API Products POST] محصول با موفقیت ثبت شد - ID:', result.insertId);

      // ثبت خودکار فعالیت
      console.log('📝 [API Products POST] ثبت فعالیت...');
      const userName = session.user?.name || 'کاربر';
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'product',
        title: `محصول جدید: ${name}`,
        description: `محصول ${name} با قیمت ${productPrice.toLocaleString('fa-IR')} ${currency || 'IRR'} اضافه شد${category ? ` - دسته‌بندی: ${category}` : ''}`
      });

      console.log('✅ [API Products POST] فعالیت ثبت شد');

      return NextResponse.json({
        success: true,
        message: 'محصول با موفقیت افزودن شد',
        id: result.insertId
      });
    } finally {
      conn.release();
      console.log('🔌 [API Products POST] اتصال دیتابیس آزاد شد');
    }

  } catch (error) {
    console.error('💥 [API Products POST] خطای غیرمنتظره:', error);
    console.error('💥 [API Products POST] جزئیات خطا:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
