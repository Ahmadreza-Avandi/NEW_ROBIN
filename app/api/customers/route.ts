import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/customers - Get all customers
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const segment = searchParams.get('segment') || '';
    const priority = searchParams.get('priority') || '';
    const industry = searchParams.get('industry') || '';
    const assignedTo = searchParams.get('assigned_to') || '';
    const city = searchParams.get('city') || '';
    const source = searchParams.get('source') || '';
    const product = searchParams.get('product') || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    if (segment) {
      whereClause += ' AND c.segment = ?';
      params.push(segment);
    }

    if (priority) {
      whereClause += ' AND c.priority = ?';
      params.push(priority);
    }

    if (industry) {
      whereClause += ' AND c.industry = ?';
      params.push(industry);
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        whereClause += ' AND c.assigned_to IS NULL';
      } else {
        whereClause += ' AND c.assigned_to = ?';
        params.push(assignedTo);
      }
    }

    if (city) {
      whereClause += ' AND c.city = ?';
      params.push(city);
    }

    if (source) {
      whereClause += ' AND c.source = ?';
      params.push(source);
    }

    if (product) {
      whereClause += ' AND EXISTS (SELECT 1 FROM customer_product_interests cpi WHERE cpi.customer_id = c.id AND cpi.product_id = ?)';
      params.push(product);
    }

    // همه مشتریان را نمایش بده (برای سادگی)
    // در آینده می‌توان محدودیت دسترسی اضافه کرد

    // Query ساده بدون JOIN پیچیده برای جلوگیری از مشکل collation
    const customers = await executeQuery(`
      SELECT 
        c.*
      FROM customers c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // اضافه کردن اطلاعات اضافی برای هر مشتری
    for (let customer of customers) {
      // دریافت نام کاربر مسئول
      if (customer.assigned_to) {
        try {
          const userResult = await executeQuery(`
            SELECT name FROM users WHERE id = ? LIMIT 1
          `, [customer.assigned_to]);
          customer.assigned_user_name = userResult.length > 0 ? userResult[0].name : null;
        } catch (error) {
          customer.assigned_user_name = null;
        }
      }

      // دریافت تعداد محصولات علاقه‌مند
      try {
        const interestResult = await executeQuery(`
          SELECT COUNT(*) as count FROM customer_product_interests WHERE customer_id = ?
        `, [customer.id]);
        customer.interested_products_count = interestResult.length > 0 ? interestResult[0].count : 0;
      } catch (error) {
        customer.interested_products_count = 0;
      }

      // دریافت نام محصولات علاقه‌مند
      try {
        const productsResult = await executeQuery(`
          SELECT p.name 
          FROM customer_product_interests cpi
          JOIN products p ON cpi.product_id = p.id
          WHERE cpi.customer_id = ?
          ORDER BY p.name
        `, [customer.id]);
        customer.interested_products_names = productsResult.map(p => p.name).join(', ');
      } catch (error) {
        customer.interested_products_names = '';
      }

      // مقادیر پیش‌فرض
      customer.total_deals = 0;
      customer.total_tickets = 0;
      customer.won_value = 0;
    }

    // Get total count - query ساده
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM customers c
      ${whereClause}
    `, params);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;



    return NextResponse.json({
      success: true,
      customers: customers,
      data: customers,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت مشتریان' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const currentUserId = user.id;

    const body = await req.json();
    const {
      name, company_name, email, phone, website, address, city, state, country,
      industry, company_size, annual_revenue, segment, priority, assigned_to
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'نام و نام خانوادگی الزامی است' },
        { status: 400 }
      );
    }

    const customerId = uuidv4();

    // تعیین segment بر اساس company_name
    // اگر company_name خالی باشد → individual
    // اگر company_name پر باشد → small_business (یا segment ارسالی از فرم)
    let finalSegment = segment;
    if (!finalSegment) {
      finalSegment = company_name ? 'small_business' : 'individual';
    }

    // Simple insert with essential fields only
    await executeSingle(`
      INSERT INTO customers (
        id, name, company_name, email, phone, website, address, city, state, country,
        industry, company_size, annual_revenue, segment, priority, assigned_to,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      customerId,
      name,
      company_name || null,
      email || null,
      phone || null,
      website || null,
      address || null,
      city || null,
      state || null,
      country || 'Iran',
      industry || null,
      company_size || null,
      annual_revenue || null,
      finalSegment,
      priority || 'medium',
      assigned_to || currentUserId,
      'prospect'
    ]);

    const [newCustomer] = await executeQuery(`
      SELECT c.*, u.name as assigned_user_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ?
    `, [customerId]);

    return NextResponse.json({
      success: true,
      message: 'مشتری با موفقیت ایجاد شد',
      data: newCustomer
    });
  } catch (error) {
    console.error('Create customer API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any)?.code
    });
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد مشتری', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}