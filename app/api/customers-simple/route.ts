import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const segment = searchParams.get('segment') || '';
    const priority = searchParams.get('priority') || '';
    const industry = searchParams.get('industry') || '';
    const city = searchParams.get('city') || '';
    const source = searchParams.get('source') || '';
    const product = searchParams.get('product') || '';

    const offset = (page - 1) * limit;

    // Query ساده بدون JOIN
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (segment && segment !== 'all') {
      whereClause += ' AND segment = ?';
      params.push(segment);
    }

    if (priority && priority !== 'all') {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    if (industry && industry !== 'all') {
      whereClause += ' AND industry = ?';
      params.push(industry);
    }

    if (city && city !== 'all') {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    if (source && source !== 'all') {
      whereClause += ' AND source = ?';
      params.push(source);
    }

    if (product && product !== 'all') {
      whereClause += ' AND EXISTS (SELECT 1 FROM customer_product_interests cpi WHERE cpi.customer_id = id AND cpi.product_id = ?)';
      params.push(product);
    }

    // دریافت مشتریان (با DISTINCT برای جلوگیری از تکرار)
    const customers = await executeQuery(`
      SELECT DISTINCT
        id,
        name,
        email,
        phone,
        city,
        state,
        industry,
        status,
        segment,
        priority,
        assigned_to,
        created_at,
        updated_at
      FROM customers
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // اضافه کردن اطلاعات محصولات علاقه‌مند برای هر مشتری
    for (let customer of customers) {
      try {
        // دریافت تعداد و نام محصولات علاقه‌مند
        const interestResult = await executeQuery(`
          SELECT 
            COUNT(*) as count,
            GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') as product_names
          FROM customer_product_interests cpi
          LEFT JOIN products p ON cpi.product_id = p.id
          WHERE cpi.customer_id = ?
        `, [customer.id]);
        
        if (interestResult.length > 0) {
          customer.interested_products_count = interestResult[0].count || 0;
          customer.interested_products_names = interestResult[0].product_names || '';
        } else {
          customer.interested_products_count = 0;
          customer.interested_products_names = '';
        }
      } catch (error) {
        customer.interested_products_count = 0;
        customer.interested_products_names = '';
      }
    }

    // شمارش کل
    const countResult = await executeQuery(`
      SELECT COUNT(DISTINCT id) as total FROM customers ${whereClause}
    `, params);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Simple customers API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت مشتریان' },
      { status: 500 }
    );
  }
}