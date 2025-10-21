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
      const searchTerm = request.nextUrl.searchParams.get('search') || '';
      const customerId = request.nextUrl.searchParams.get('customer_id') || '';
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
      const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

      let query = 'SELECT * FROM sales WHERE tenant_key = ?';
      let params: any[] = [tenantKey];

      // Filter by customer_id if provided
      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }

      if (searchTerm) {
        query += ' AND (customer_name LIKE ? OR invoice_number LIKE ? OR sales_person_name LIKE ?)';
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY sale_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [sales] = await conn.query(query, params);

      return NextResponse.json({
        success: true,
        data: sales,
        sales: sales // Include both for compatibility
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت فروش‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      deal_id,
      customer_id,
      customer_name,
      total_amount,
      currency = 'IRR',
      payment_status = 'pending',
      payment_method,
      delivery_date,
      payment_due_date,
      notes,
      invoice_number
    } = body;

    if (!customer_id || !customer_name || !total_amount) {
      return NextResponse.json(
        { success: false, message: 'مشتری، نام مشتری و مبلغ الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const salesPersonId = session.user?.id || 'unknown';
      const salesPersonName = session.user?.name || 'ناشناس';

      const [result] = await conn.query(
        `INSERT INTO sales (
          id,
          tenant_key,
          deal_id,
          customer_id,
          customer_name,
          total_amount,
          currency,
          payment_status,
          payment_method,
          delivery_date,
          payment_due_date,
          notes,
          invoice_number,
          sales_person_id,
          sales_person_name,
          created_at,
          updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          tenantKey,
          deal_id || null,
          customer_id,
          customer_name,
          total_amount,
          currency,
          payment_status,
          payment_method || null,
          delivery_date || null,
          payment_due_date || null,
          notes || null,
          invoice_number || null,
          salesPersonId,
          salesPersonName
        ]
      ) as any;

      return NextResponse.json({
        success: true,
        message: 'فروش با موفقیت ثبت شد',
        id: result.insertId
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در ثبت فروش:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
      id,
      payment_status,
      payment_method,
      delivery_date,
      payment_due_date,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه فروش الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (payment_status) {
        updates.push('payment_status = ?');
        params.push(payment_status);
      }
      if (payment_method !== undefined) {
        updates.push('payment_method = ?');
        params.push(payment_method || null);
      }
      if (delivery_date !== undefined) {
        updates.push('delivery_date = ?');
        params.push(delivery_date || null);
      }
      if (payment_due_date !== undefined) {
        updates.push('payment_due_date = ?');
        params.push(payment_due_date || null);
      }
      if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes || null);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          { success: false, message: 'هیچ بروزرسانی انجام نشد' },
          { status: 400 }
        );
      }

      updates.push('updated_at = NOW()');
      params.push(tenantKey, id);

      await conn.query(
        `UPDATE sales SET ${updates.join(', ')} WHERE tenant_key = ? AND id = ?`,
        params
      );

      return NextResponse.json({
        success: true,
        message: 'فروش با موفقیت به‌روزرسانی شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی فروش:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه فروش الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      await conn.query(
        'DELETE FROM sales WHERE tenant_key = ? AND id = ?',
        [tenantKey, id]
      );

      return NextResponse.json({
        success: true,
        message: 'فروش با موفقیت حذف شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف فروش:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}