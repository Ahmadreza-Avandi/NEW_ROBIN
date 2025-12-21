import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

async function handleGetInterests(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2]; // customers/[id]/interests

    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // دریافت محصولات علاقه‌مند
      const [interests] = await connection.query(`
        SELECT cpi.*, p.name as product_name, p.description, p.price, p.category
        FROM customer_product_interests cpi
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.customer_id = ? AND p.tenant_key = ?
        ORDER BY cpi.created_at DESC
      `, [customerId, tenantKey]) as any[];

      return NextResponse.json({
        success: true,
        data: interests
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت علاقه‌مندی‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleAddInterest(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    const body = await request.json();

    const { product_id, interest_level = 'medium', notes } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: 'شناسه محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // بررسی وجود مشتری
      const [customers] = await connection.query(
        'SELECT name FROM customers WHERE id = ? AND tenant_key = ?',
        [customerId, tenantKey]
      ) as any[];

      if (customers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      // بررسی وجود محصول
      const [products] = await connection.query(
        'SELECT name FROM products WHERE id = ? AND tenant_key = ?',
        [product_id, tenantKey]
      ) as any[];

      if (products.length === 0) {
        return NextResponse.json(
          { success: false, message: 'محصول یافت نشد' },
          { status: 404 }
        );
      }

      // بررسی عدم تکرار
      const [existing] = await connection.query(
        'SELECT id FROM customer_product_interests WHERE customer_id = ? AND product_id = ?',
        [customerId, product_id]
      ) as any[];

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'این محصول قبلاً به لیست علاقه‌مندی‌ها اضافه شده' },
          { status: 400 }
        );
      }

      // اضافه کردن علاقه‌مندی
      const interestId = require('crypto').randomUUID();
      await connection.query(`
        INSERT INTO customer_product_interests (id, customer_id, product_id, interest_level, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [interestId, customerId, product_id, interest_level, notes || null]);

      // ثبت فعالیت
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'customer',
        title: `افزودن علاقه‌مندی محصول`,
        description: `محصول ${products[0].name} به لیست علاقه‌مندی‌های ${customers[0].name} اضافه شد`,
        customerId: customerId.toString(),
        customerName: customers[0].name
      });

      return NextResponse.json({
        success: true,
        message: 'علاقه‌مندی با موفقیت اضافه شد'
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در افزودن علاقه‌مندی:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

async function handleDeleteInterest(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    const { searchParams } = url;
    const interestId = searchParams.get('interest_id');

    if (!interestId) {
      return NextResponse.json(
        { success: false, message: 'شناسه علاقه‌مندی الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // دریافت اطلاعات قبل از حذف
      const [interestInfo] = await connection.query(`
        SELECT cpi.*, c.name as customer_name, p.name as product_name
        FROM customer_product_interests cpi
        JOIN customers c ON cpi.customer_id = c.id
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.id = ? AND cpi.customer_id = ? AND c.tenant_key = ?
      `, [interestId, customerId, tenantKey]) as any[];

      if (interestInfo.length === 0) {
        return NextResponse.json(
          { success: false, message: 'علاقه‌مندی یافت نشد' },
          { status: 404 }
        );
      }

      // حذف علاقه‌مندی
      await connection.query(
        'DELETE FROM customer_product_interests WHERE id = ? AND customer_id = ?',
        [interestId, customerId]
      );

      // ثبت فعالیت
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'customer',
        title: `حذف علاقه‌مندی محصول`,
        description: `محصول ${interestInfo[0].product_name} از لیست علاقه‌مندی‌های ${interestInfo[0].customer_name} حذف شد`,
        customerId: customerId.toString(),
        customerName: interestInfo[0].customer_name
      });

      return NextResponse.json({
        success: true,
        message: 'علاقه‌مندی با موفقیت حذف شد'
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف علاقه‌مندی:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantAuth(handleGetInterests);
export const POST = requireTenantAuth(handleAddInterest);
export const DELETE = requireTenantAuth(handleDeleteInterest);