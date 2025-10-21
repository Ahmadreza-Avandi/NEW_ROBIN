import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

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
      const [rows] = await conn.query(
        'SELECT * FROM contacts WHERE tenant_key = ? ORDER BY created_at DESC',
        [tenantKey]
      );

      return NextResponse.json({
        success: true,
        data: rows
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت contacts:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {  // ✅ Properly exported POST handler
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
      company_id,
      first_name,
      last_name,
      job_title,
      department,
      email,
      phone,
      mobile,
      address,
      city,
      country,
      source,
      notes,
      linkedin_url,
      twitter_url
    } = body;

    if (!first_name || !last_name) {
      return NextResponse.json(
        { success: false, message: 'نام و نام خانوادگی الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        `INSERT INTO contacts (
          id,
          tenant_key,
          company_id,
          first_name,
          last_name,
          job_title,
          department,
          email,
          phone,
          mobile,
          address,
          city,
          country,
          source,
          notes,
          linkedin_url,
          twitter_url,
          created_by,
          created_at,
          updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantKey,
          company_id || null,
          first_name,
          last_name,
          job_title || null,
          department || null,
          email || null,
          phone || null,
          mobile || null,
          address || null,
          city || null,
          country || null,
          source || null,
          notes || null,
          linkedin_url || null,
          twitter_url || null,
          session.user?.id || 'unknown'
        ]
      ) as any;

      return NextResponse.json({
        success: true,
        message: 'مخاطب با موفقیت افزوده شد',
        id: result.insertId
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در افزودن contact:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
