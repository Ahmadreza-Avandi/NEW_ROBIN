import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

async function handleGetCustomers(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenant_key;

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // دریافت لیست مشتریان (فقط داده‌های این tenant)
      const [customers] = await connection.query(
        'SELECT * FROM customers ORDER BY created_at DESC LIMIT 100'
      ) as any[];

      return NextResponse.json({
        success: true,
        customers: customers
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
    const tenantKey = session.tenant_key;
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
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
          priority
        ]
      ) as any;

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

export const GET = requireTenantAuth(handleGetCustomers);
export const POST = requireTenantAuth(handleCreateCustomer);
