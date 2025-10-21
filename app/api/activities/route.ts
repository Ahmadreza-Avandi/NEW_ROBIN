import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/activities - دریافت فعالیت‌ها
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const performedBy = searchParams.get('performed_by') || '';
    const customerId = searchParams.get('customer_id') || '';

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (a.title LIKE ? OR a.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'all') {
      whereClause += ' AND a.type = ?';
      params.push(type);
    }

    if (startDate) {
      whereClause += ' AND DATE(a.start_time) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(a.start_time) <= ?';
      params.push(endDate);
    }

    if (performedBy && performedBy !== 'all') {
      whereClause += ' AND a.performed_by = ?';
      params.push(performedBy);
    }

    if (customerId) {
      whereClause += ' AND a.customer_id = ?';
      params.push(customerId);
    }

    // دریافت فعالیت‌ها
    const activities = await executeQuery(`
      SELECT DISTINCT
        a.id,
        a.customer_id,
        a.type,
        a.title,
        a.description,
        a.start_time,
        a.end_time,
        a.duration,
        a.outcome,
        a.notes,
        a.created_at,
        a.updated_at,
        c.name as customer_name,
        u.full_name as performed_by_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.performed_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // شمارش کل
    const countResult = await executeQuery(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.performed_by = u.id
      ${whereClause}
    `, params);

    const total = countResult && countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('خطا در دریافت فعالیت‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فعالیت‌ها' },
      { status: 500 }
    );
  }
}

// POST /api/activities - ایجاد فعالیت جدید
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
      customer_id,
      type = 'call',
      title,
      description,
      start_time,
      end_time,
      duration,
      outcome = 'completed',
      notes
    } = body;

    if (!customer_id || !title) {
      return NextResponse.json(
        { success: false, message: 'مشتری و عنوان الزامی است' },
        { status: 400 }
      );
    }

    const activityId = uuidv4();

    await executeSingle(`
      INSERT INTO activities (
        id, customer_id, type, title, description, start_time, 
        end_time, duration, performed_by, outcome, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      activityId,
      customer_id,
      type,
      title,
      description || null,
      start_time || null,
      end_time || null,
      duration || null,
      user.id,
      outcome,
      notes || null
    ]);

    return NextResponse.json({
      success: true,
      message: 'فعالیت با موفقیت ایجاد شد',
      data: { id: activityId }
    });

  } catch (error) {
    console.error('خطا در ایجاد فعالیت:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد فعالیت' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities - حذف فعالیت
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
    const activityId = searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { success: false, message: 'شناسه فعالیت الزامی است' },
        { status: 400 }
      );
    }

    await executeSingle(`
      DELETE FROM activities WHERE id = ?
    `, [activityId]);

    return NextResponse.json({
      success: true,
      message: 'فعالیت با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف فعالیت:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف فعالیت' },
      { status: 500 }
    );
  }
}