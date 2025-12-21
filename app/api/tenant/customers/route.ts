import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

async function handleGetCustomers(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);

    // پارامترهای جستجو و فیلتر
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const segment = searchParams.get('segment') || '';
    const priority = searchParams.get('priority') || '';
    const industry = searchParams.get('industry') || '';
    const city = searchParams.get('city') || '';

    const offset = (page - 1) * limit;

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // ساخت کوئری با فیلترها
      let whereConditions = ['c.tenant_key = ?'];
      let queryParams = [tenantKey];

      if (search) {
        whereConditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.company_name LIKE ?)');
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (status && status !== 'all') {
        whereConditions.push('c.status = ?');
        queryParams.push(status);
      }

      if (segment && segment !== 'all') {
        whereConditions.push('c.segment = ?');
        queryParams.push(segment);
      }

      if (priority && priority !== 'all') {
        whereConditions.push('c.priority = ?');
        queryParams.push(priority);
      }

      if (industry && industry !== 'all') {
        whereConditions.push('c.industry = ?');
        queryParams.push(industry);
      }

      if (city && city !== 'all') {
        whereConditions.push('c.city = ?');
        queryParams.push(city);
      }

      const whereClause = whereConditions.join(' AND ');

      // شمارش کل رکوردها
      const [countResult] = await connection.query(
        `SELECT COUNT(*) as total FROM customers c WHERE ${whereClause}`,
        queryParams
      ) as any[];

      const totalCustomers = countResult[0].total;
      const totalPages = Math.ceil(totalCustomers / limit);

      // دریافت لیست مشتریان با نام کاربر اضافه کننده
      const [customers] = await connection.query(
        `SELECT c.*, u.name as assigned_user_name
         FROM customers c 
         LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
         WHERE ${whereClause}
         ORDER BY c.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      ) as any[];

      // اضافه کردن اطلاعات محصولات علاقه‌مند برای هر مشتری
      for (let customer of customers) {
        try {
          const [interests] = await connection.query(`
            SELECT p.name
            FROM customer_product_interests cpi
            JOIN products p ON cpi.product_id = p.id
            WHERE cpi.customer_id = ? AND p.tenant_key = ?
          `, [customer.id, tenantKey]) as any[];
          
          customer.interested_products_names = interests.map((i: any) => i.name).join(', ');
          customer.interested_products_count = interests.length;
        } catch (error) {
          customer.interested_products_names = '';
          customer.interested_products_count = 0;
        }
      }

      return NextResponse.json({
        success: true,
        customers: customers,
        pagination: {
          page,
          limit,
          total: totalCustomers,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت مشتریان:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleCreateCustomer(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const body = await request.json();

    const {
      name,
      company_name,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      industry,
      company_size,
      annual_revenue,
      segment,
      priority = 'medium',
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'نام مشتری الزامی است' },
        { status: 400 }
      );
    }

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        `INSERT INTO customers (
          tenant_key,
          name,
          company_name,
          email,
          phone,
          website,
          address,
          city,
          state,
          country,
          industry,
          company_size,
          annual_revenue,
          segment,
          priority,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantKey,
          name,
          company_name || null,
          email || null,
          phone || null,
          website || null,
          address || null,
          city || null,
          state || null,
          country || null,
          industry || null,
          company_size || null,
          annual_revenue || null,
          segment || null,
          priority,
          session.userId || session.id || null
        ]
      ) as any;

      // ثبت خودکار فعالیت
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      const customerId = result.insertId;
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'customer',
        title: `مشتری جدید: ${name}`,
        description: `مشتری ${name}${company_name ? ` از شرکت ${company_name}` : ''} اضافه شد${phone ? ` - تلفن: ${phone}` : ''}`,
        customerId: customerId.toString(),
        customerName: name
      });

      return NextResponse.json({
        success: true,
        message: 'مشتری با موفقیت اضافه شد',
        data: {
          id: result.insertId
        }
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در افزودن مشتری:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleDeleteCustomer(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'شناسه مشتری الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // حذف مشتری
      await conn.query(
        'DELETE FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      );

      // ثبت فعالیت حذف
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'customer',
        title: `حذف مشتری`,
        description: `مشتری با شناسه ${customerId} حذف شد`
      });

      return NextResponse.json({
        success: true,
        message: 'مشتری با موفقیت حذف شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف مشتری:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantAuth(handleGetCustomers);
export const POST = requireTenantAuth(handleCreateCustomer);
export const DELETE = requireTenantAuth(handleDeleteCustomer);
