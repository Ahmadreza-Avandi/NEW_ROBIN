import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/feedback - دریافت بازخوردها
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
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (type) {
            whereClause += ' AND f.type = ?';
            params.push(type);
        }

        if (status) {
            whereClause += ' AND f.status = ?';
            params.push(status);
        }

        if (dateFrom) {
            whereClause += ' AND DATE(f.created_at) >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            whereClause += ' AND DATE(f.created_at) <= ?';
            params.push(dateTo);
        }

        const offset = (page - 1) * limit;

        // دریافت بازخوردها
        const feedback = await executeQuery(`
            SELECT 
                f.*,
                c.name as customer_name
            FROM feedback f
            LEFT JOIN customers c ON f.customer_id = c.id
            ${whereClause}
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // شمارش کل
        const [countResult] = await executeQuery(`
            SELECT COUNT(*) as total 
            FROM feedback f 
            ${whereClause}
        `, params);

        return NextResponse.json({
            success: true,
            data: feedback,
            pagination: {
                page,
                limit,
                total: (countResult as any).total,
                totalPages: Math.ceil((countResult as any).total / limit)
            }
        });

    } catch (error) {
        console.error('خطا در دریافت بازخوردها:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت بازخوردها' },
            { status: 500 }
        );
    }
}

// POST /api/feedback - ایجاد بازخورد جدید
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customer_id,
            type,
            title,
            comment,
            score
        } = body;

        if (!type || !title || !comment) {
            return NextResponse.json(
                { success: false, message: 'نوع، عنوان و نظر الزامی است' },
                { status: 400 }
            );
        }

        const feedbackId = uuidv4();

        await executeSingle(`
            INSERT INTO feedback (
                id, customer_id, type, title, comment, score,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        `, [
            feedbackId,
            customer_id || null,
            type,
            title,
            comment,
            score || null
        ]);

        return NextResponse.json({
            success: true,
            message: 'بازخورد با موفقیت ثبت شد',
            data: { id: feedbackId }
        });

    } catch (error) {
        console.error('خطا در ثبت بازخورد:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ثبت بازخورد' },
            { status: 500 }
        );
    }
}

// DELETE /api/feedback - حذف بازخورد
export async function DELETE(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است' },
                { status: 401 }
            );
        }

        // فقط CEO می‌تواند بازخورد حذف کند
        if (user.role !== 'ceo') {
            return NextResponse.json(
                { success: false, message: 'مجوز حذف ندارید' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const feedbackId = searchParams.get('id');

        if (!feedbackId) {
            return NextResponse.json(
                { success: false, message: 'شناسه بازخورد الزامی است' },
                { status: 400 }
            );
        }

        // بررسی وجود بازخورد
        const [feedback] = await executeQuery(`
            SELECT id FROM feedback WHERE id = ?
        `, [feedbackId]);

        if (!feedback) {
            return NextResponse.json(
                { success: false, message: 'بازخورد یافت نشد' },
                { status: 404 }
            );
        }

        // حذف بازخورد
        await executeSingle(`DELETE FROM feedback WHERE id = ?`, [feedbackId]);

        return NextResponse.json({
            success: true,
            message: 'بازخورد با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف بازخورد:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در حذف بازخورد' },
            { status: 500 }
        );
    }
}