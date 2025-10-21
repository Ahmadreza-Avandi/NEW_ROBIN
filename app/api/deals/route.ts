import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/deals - دریافت فروش‌ها
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
    const search = searchParams.get('search') || '';

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (d.title LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // دریافت فروش‌ها از جدول deals
    const deals = await executeQuery(`
      SELECT 
        d.id,
        d.title,
        d.total_value,
        d.currency,
        d.probability,
        d.expected_close_date,
        d.actual_close_date,
        d.assigned_to,
        d.created_at,
        d.updated_at,
        c.name as customer_name,
        u.name as assigned_user_name,
        CASE 
          WHEN d.actual_close_date IS NOT NULL AND d.probability = 100 THEN 'won'
          WHEN d.actual_close_date IS NOT NULL AND d.probability = 0 THEN 'lost'
          ELSE 'active'
        END as status,
        CASE 
          WHEN d.probability >= 90 THEN 'بسته شده - برنده'
          WHEN d.probability >= 70 THEN 'مذاکره'
          WHEN d.probability >= 50 THEN 'ارسال پیشنهاد'
          WHEN d.probability >= 30 THEN 'نیازسنجی'
          ELSE 'لید جدید'
        END as stage
      FROM deals d
      LEFT JOIN customers c ON d.customer_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
      LEFT JOIN users u ON d.assigned_to COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
      ${whereClause}
      ORDER BY d.created_at DESC
    `, params);

    return NextResponse.json({
      success: true,
      data: deals
    });

  } catch (error) {
    console.error('خطا در دریافت فروش‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فروش‌ها' },
      { status: 500 }
    );
  }
}

// POST /api/deals - ایجاد فروش جدید
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      customer_id,
      total_value,
      currency = 'IRR',
      probability = 50,
      expected_close_date
    } = body;

    if (!title || !customer_id) {
      return NextResponse.json(
        { success: false, message: 'عنوان و مشتری الزامی است' },
        { status: 400 }
      );
    }

    const dealId = uuidv4();

    await executeSingle(`
      INSERT INTO deals (
        id, customer_id, title, total_value, currency, 
        probability, expected_close_date, assigned_to, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      dealId,
      customer_id,
      title,
      total_value || 0,
      currency,
      probability,
      expected_close_date || null,
      user.id
    ]);

    return NextResponse.json({
      success: true,
      message: 'فروش با موفقیت ایجاد شد',
      data: { id: dealId }
    });

  } catch (error) {
    console.error('خطا در ایجاد فروش:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد فروش' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals - حذف فروش
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('id');

    if (!dealId) {
      return NextResponse.json(
        { success: false, message: 'شناسه فروش الزامی است' },
        { status: 400 }
      );
    }

    await executeSingle(`
      DELETE FROM deals WHERE id = ?
    `, [dealId]);

    return NextResponse.json({
      success: true,
      message: 'فروش با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف فروش:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف فروش' },
      { status: 500 }
    );
  }
}