import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/products - دریافت محصولات
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // ساخت WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (status && status !== 'all') {
      const isActive = status === 'active' ? 1 : 0;
      whereClause += ' AND is_active = ?';
      params.push(isActive);
    }

    // دریافت محصولات
    const products = await executeQuery(`
      SELECT 
        id,
        name,
        description,
        category,
        base_price as price,
        currency,
        CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END as status,
        '' as sku,
        created_at,
        updated_at
      FROM products
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // شمارش کل
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total 
      FROM products 
      ${whereClause}
    `, params);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

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
    console.error('خطا در دریافت محصولات:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }
}

// POST /api/products - ایجاد محصول جدید
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const body = await req.json();
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
      return NextResponse.json(
        { success: false, message: 'نام محصول الزامی است' },
        { status: 400 }
      );
    }

    const productId = uuidv4();

    await executeSingle(`
      INSERT INTO products (
        id, name, description, category, base_price, currency, 
        specifications, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [
      productId,
      name,
      description || null,
      category || null,
      price || null,
      currency,
      specifications ? JSON.stringify(specifications) : null
    ]);

    return NextResponse.json({
      success: true,
      message: 'محصول با موفقیت ایجاد شد',
      data: { id: productId }
    });

  } catch (error) {
    console.error('خطا در ایجاد محصول:', error);
    
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
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