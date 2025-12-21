import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';

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
        query += ' AND (customer_name LIKE ? OR invoice_number LIKE ? OR sales_person_name LIKE ? OR title LIKE ?)';
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [sales] = await conn.query(query, params) as any;

      // Get sale items for each sale
      const salesWithItems = await Promise.all(
        sales.map(async (sale: any) => {
          const [items] = await conn.query(
            'SELECT * FROM sale_items WHERE sale_id = ? AND tenant_key = ?',
            [sale.id, tenantKey]
          ) as any;
          
          return {
            ...sale,
            items: items || []
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: salesWithItems,
        sales: salesWithItems // Include both for compatibility
      });
    } finally {
      conn.release();
    }

  } catch (error: any) {
    console.error('❌ خطا در دریافت فروش‌ها:', error);
    
    // Handle specific database connection errors
    if (error.code === 'ER_CON_COUNT_ERROR' || error.message?.includes('Too many connections')) {
      return NextResponse.json(
        { success: false, message: 'مشکل در اتصال به دیتابیس - لطفاً چند لحظه صبر کنید' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'خطای سرور - لطفاً دوباره تلاش کنید' },
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
      customer_id,
      items = [],
      payment_status = 'pending',
      payment_method,
      delivery_date,
      payment_due_date,
      notes,
      invoice_number
    } = body;

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'مشتری و حداقل یک محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const salesPersonId = session.user?.id || 'unknown';
      const salesPersonName = session.user?.name || 'ناشناس';

      // Get customer info
      const [customerResult] = await conn.query(
        'SELECT name, company_name FROM customers WHERE id = ? AND tenant_key = ?',
        [customer_id, tenantKey]
      ) as any;

      if (!customerResult || customerResult.length === 0) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, message: 'مشتری یافت نشد' },
          { status: 404 }
        );
      }

      const customer = customerResult[0];
      const customer_name = customer.name;

      // Calculate total amount
      const total_amount = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unit_price), 0
      );

      // Create sale record
      const saleId = crypto.randomUUID();
      await conn.query(
        `INSERT INTO sales (
          id,
          tenant_key,
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
          title,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'IRR', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          saleId,
          tenantKey,
          customer_id,
          customer_name,
          total_amount,
          payment_status,
          payment_method || null,
          delivery_date || null,
          payment_due_date || null,
          notes || null,
          invoice_number || null,
          salesPersonId,
          salesPersonName,
          `فروش ${customer_name} - ${new Date().toLocaleDateString('fa-IR')}`
        ]
      );

      // Create sale items
      for (const item of items) {
        // Get product info
        const [productResult] = await conn.query(
          'SELECT name, category FROM products WHERE id = ? AND tenant_key = ?',
          [item.product_id, tenantKey]
        ) as any;

        if (productResult && productResult.length > 0) {
          const product = productResult[0];
          
          await conn.query(
            `INSERT INTO sale_items (
              id,
              tenant_key,
              sale_id,
              product_id,
              product_name,
              product_category,
              quantity,
              unit_price,
              total_price,
              created_at,
              updated_at
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              tenantKey,
              saleId,
              item.product_id,
              product.name,
              product.category || 'عمومی',
              item.quantity,
              item.unit_price,
              item.quantity * item.unit_price
            ]
          );
        }
      }

      await conn.commit();

      // ثبت خودکار فعالیت
      await logActivity({
        tenantKey,
        userId: salesPersonId,
        userName: salesPersonName,
        type: 'sale',
        title: `فروش جدید به ${customer_name}`,
        description: `فروش ${items.length} محصول به مبلغ ${total_amount.toLocaleString('fa-IR')} تومان ثبت شد${invoice_number ? ` - شماره فاکتور: ${invoice_number}` : ''}`,
        customerId: customer_id,
        customerName: customer_name
      });

      return NextResponse.json({
        success: true,
        message: 'فروش با موفقیت ثبت شد',
        id: saleId
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

  } catch (error: any) {
    console.error('❌ خطا در ثبت فروش:', error);
    
    // Handle specific database connection errors
    if (error.code === 'ER_CON_COUNT_ERROR' || error.message?.includes('Too many connections')) {
      return NextResponse.json(
        { success: false, message: 'مشکل در اتصال به دیتابیس - لطفاً چند لحظه صبر کنید' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'خطای سرور - لطفاً دوباره تلاش کنید' },
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