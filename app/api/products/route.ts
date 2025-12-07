import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/products - دریافت محصولات
export async function GET(req: NextRequest) {
  console.log('🚀 [API Products GET] درخواست جدید دریافت شد');
  
  try {
    console.log('🔐 [API Products GET] بررسی احراز هویت...');
    const user = await getUserFromToken(req);
    if (!user) {
      console.error('❌ [API Products GET] توکن نامعتبر');
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('✅ [API Products GET] احراز هویت موفق - User:', user.id);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    console.log('🔍 [API Products GET] فیلترهای دریافتی:', { 
      page, 
      limit, 
      search, 
      category, 
      status 
    });

    const offset = (page - 1) * limit;

    // ساخت WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search && search.trim()) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      console.log('🔎 [API Products GET] فیلتر جستجو اعمال شد:', search);
    }

    if (category && category !== 'all' && category.trim()) {
      whereClause += ' AND category = ?';
      params.push(category.trim());
      console.log('📂 [API Products GET] فیلتر دسته‌بندی اعمال شد:', category);
    }

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
      console.log('🏷️ [API Products GET] فیلتر وضعیت اعمال شد:', status);
    }

    console.log('📝 [API Products GET] WHERE clause:', whereClause);
    console.log('📝 [API Products GET] Params:', params);

    // دریافت محصولات
    console.log('💾 [API Products GET] اجرای کوئری دریافت محصولات...');
    const products = await executeQuery(`
      SELECT 
        id,
        name,
        description,
        category,
        price,
        currency,
        status,
        sku,
        created_at,
        updated_at
      FROM products
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    console.log('✅ [API Products GET] محصولات دریافت شد - تعداد:', products?.length || 0);

    // شمارش کل
    console.log('🔢 [API Products GET] شمارش کل محصولات...');
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total 
      FROM products 
      ${whereClause}
    `, params);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;
    console.log('📊 [API Products GET] کل محصولات:', total);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('💥 [API Products GET] خطای غیرمنتظره:', error);
    console.error('💥 [API Products GET] جزئیات خطا:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }
}

// POST /api/products - ایجاد محصول جدید
export async function POST(req: NextRequest) {
  console.log('🚀 [API Products POST] درخواست جدید دریافت شد');
  
  try {
    console.log('🔐 [API Products POST] بررسی احراز هویت...');
    const user = await getUserFromToken(req);
    if (!user) {
      console.error('❌ [API Products POST] توکن نامعتبر');
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('✅ [API Products POST] احراز هویت موفق - User:', user.id);

    const body = await req.json();
    console.log('📦 [API Products POST] داده‌های دریافتی:', body);

    const {
      name,
      description,
      category,
      price,
      currency = 'IRR',
      sku,
      tags,
      specifications
    } = body;

    if (!name) {
      console.error('❌ [API Products POST] نام محصول خالی است');
      return NextResponse.json(
        { success: false, message: 'نام محصول الزامی است' },
        { status: 400 }
      );
    }

    const productId = uuidv4();
    console.log('🆔 [API Products POST] ID محصول جدید:', productId);

    console.log('💾 [API Products POST] درج در دیتابیس...');
    await executeSingle(`
      INSERT INTO products (
        id, name, description, category, price, currency, 
        specifications, status, sku, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())
    `, [
      productId,
      name,
      description || null,
      category || null,
      price || null,
      currency,
      specifications ? JSON.stringify(specifications) : null,
      sku || null
    ]);

    console.log('✅ [API Products POST] محصول با موفقیت ثبت شد');

    return NextResponse.json({
      success: true,
      message: 'محصول با موفقیت ایجاد شد',
      data: { id: productId }
    });

  } catch (error) {
    console.error('💥 [API Products POST] خطای غیرمنتظره:', error);
    console.error('💥 [API Products POST] جزئیات خطا:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      console.error('⚠️ [API Products POST] SKU تکراری');
      return NextResponse.json(
        { success: false, message: 'SKU محصول تکراری است' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد محصول' },
      { status: 500 }
    );
  }
}