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
      // دریافت اطلاعات مشتری
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      ) as any[];

      if (customers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: customers[0]
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