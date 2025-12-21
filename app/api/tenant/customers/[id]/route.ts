import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

async function handleGetCustomer(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // استخراج ID از URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 1];
    
    console.log('🔍 GET Customer API Debug:', {
      url: request.url,
      pathParts,
      customerId,
      tenantKey
    });

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // دریافت اطلاعات کامل مشتری با نام کاربر ایجادکننده
      const [customers] = await connection.query(`
        SELECT c.*, u.name as assigned_user_name, u.email as assigned_user_email
        FROM customers c 
        LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
        WHERE c.id = ? AND c.tenant_key = ?
      `, [customerId, tenantKey]) as any[];

      if (customers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      const customer = customers[0];

      // دریافت محصولات علاقه‌مند
      const [interestedProducts] = await connection.query(`
        SELECT cpi.id, p.id as product_id, p.name as product_name, p.description, p.price, p.category,
               cpi.interest_level, cpi.notes, cpi.created_at
        FROM customer_product_interests cpi
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.customer_id = ? AND p.tenant_key = ?
        ORDER BY cpi.created_at DESC
      `, [customerId, tenantKey]) as any[];

      // دریافت آمار فروش
      const [salesStats] = await connection.query(`
        SELECT 
          COUNT(*) as total_sales,
          SUM(total_amount) as total_sales_amount,
          SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
          MAX(sale_date) as last_sale_date
        FROM sales 
        WHERE customer_id = ? AND tenant_key = ?
      `, [customerId, tenantKey]) as any[];

      // دریافت آمار تیکت‌ها
      const [ticketStats] = await connection.query(`
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
          COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
          MAX(created_at) as last_ticket_date
        FROM tickets 
        WHERE customer_id = ? AND tenant_key = ?
      `, [customerId, tenantKey]) as any[];

      // دریافت آمار فعالیت‌ها
      const [activityStats] = await connection.query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(CASE WHEN type = 'call' THEN 1 END) as total_calls,
          COUNT(CASE WHEN type = 'meeting' THEN 1 END) as total_meetings,
          COUNT(CASE WHEN type = 'email' THEN 1 END) as total_emails,
          MAX(created_at) as last_activity_date
        FROM activities 
        WHERE customer_id = ? AND tenant_key = ?
      `, [customerId, tenantKey]) as any[];

      // دریافت آخرین فعالیت‌ها (5 مورد)
      const [recentActivities] = await connection.query(`
        SELECT a.*, u.name as performed_by_name
        FROM activities a
        LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key = u.tenant_key
        WHERE a.customer_id = ? AND a.tenant_key = ?
        ORDER BY a.created_at DESC
        LIMIT 5
      `, [customerId, tenantKey]) as any[];

      // دریافت مخاطبین (از طریق company_id)
      const [contacts] = await connection.query(`
        SELECT id, first_name, last_name, email, phone, job_title, is_primary, created_at
        FROM contacts 
        WHERE company_id = ? AND tenant_key = ?
        ORDER BY is_primary DESC, created_at DESC
      `, [customerId, tenantKey]) as any[];

      // ترکیب همه اطلاعات
      const customerData = {
        ...customer,
        interested_products: interestedProducts,
        sales_stats: salesStats[0] || {
          total_sales: 0,
          total_sales_amount: 0,
          paid_amount: 0,
          pending_amount: 0,
          last_sale_date: null
        },
        ticket_stats: ticketStats[0] || {
          total_tickets: 0,
          open_tickets: 0,
          closed_tickets: 0,
          last_ticket_date: null
        },
        activity_stats: activityStats[0] || {
          total_activities: 0,
          total_calls: 0,
          total_meetings: 0,
          total_emails: 0,
          last_activity_date: null
        },
        recent_activities: recentActivities,
        contacts: contacts
      };

      return NextResponse.json({
        success: true,
        data: customerData
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت مشتری:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleUpdateCustomer(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // استخراج ID از URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 1];
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
      // بررسی وجود مشتری
      const [existingCustomers] = await conn.query(
        'SELECT name FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      ) as any[];

      if (existingCustomers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      // بروزرسانی مشتری
      await conn.query(
        `UPDATE customers SET 
          name = ?,
          company_name = ?,
          email = ?,
          phone = ?,
          website = ?,
          address = ?,
          city = ?,
          state = ?,
          country = ?,
          industry = ?,
          company_size = ?,
          annual_revenue = ?,
          segment = ?,
          priority = ?,
          updated_at = NOW()
        WHERE id = ? AND tenant_key = ?`,
        [
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
          customerId,
          tenantKey
        ]
      );

      // ثبت خودکار فعالیت
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'customer',
        title: `بروزرسانی مشتری: ${name}`,
        description: `اطلاعات مشتری ${name} بروزرسانی شد`,
        customerId: customerId.toString(),
        customerName: name
      });

      return NextResponse.json({
        success: true,
        message: 'مشتری با موفقیت بروزرسانی شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در بروزرسانی مشتری:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleDeleteCustomer(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // استخراج ID از URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 1];

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // ابتدا نام مشتری را برای لاگ دریافت کنیم
      const [existingCustomers] = await conn.query(
        'SELECT name FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      ) as any[];

      if (existingCustomers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      const customerName = existingCustomers[0].name;

      // حذف مشتری
      const [result] = await conn.query(
        'DELETE FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      ) as any;

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد یا قبلاً حذف شده' },
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
        type: 'customer',
        title: `حذف مشتری: ${customerName}`,
        description: `مشتری ${customerName} با شناسه ${customerId} حذف شد`
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

export const GET = requireTenantAuth(handleGetCustomer);
export const PUT = requireTenantAuth(handleUpdateCustomer);
export const DELETE = requireTenantAuth(handleDeleteCustomer);