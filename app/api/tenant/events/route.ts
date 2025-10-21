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
            const from = request.nextUrl.searchParams.get('from');
            const to = request.nextUrl.searchParams.get('to');

            let query = 'SELECT * FROM calendar_events WHERE tenant_key = ?';
            let params: any[] = [tenantKey];

            if (from && to) {
                query += ' AND start_date >= ? AND start_date <= ?';
                params.push(from, to);
            }

            query += ' ORDER BY start_date ASC';

            try {
                const [events] = await conn.query(query, params);
                return NextResponse.json({
                    success: true,
                    data: events
                });
            } catch (queryError) {
                console.error('❌ Query execution error:', queryError);
                console.error('Query:', query);
                console.error('Params:', params);
                throw queryError;
            }
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در دریافت events:', error);
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
        const { title, description, start_date, end_date, type, location, status, customer_id, all_day } = body;

        if (!title || !start_date) {
            return NextResponse.json(
                { success: false, message: 'عنوان و تاریخ شروع الزامی است' },
                { status: 400 }
            );
        }

        const pool = await getTenantConnection(tenantKey);
        const conn = await pool.getConnection();

        try {
            const [result] = await conn.query(
                `INSERT INTO calendar_events (
          id, tenant_key, title, description, start_date, end_date,
          type, location, status, customer_id, created_by, all_day, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    tenantKey,
                    title,
                    description || null,
                    start_date,
                    end_date || null,
                    type || 'meeting',
                    location || null,
                    status || 'confirmed',
                    customer_id || null,
                    session.userId,
                    all_day ? 1 : 0
                ]
            ) as any;

            return NextResponse.json({
                success: true,
                message: 'رویداد با موفقیت ایجاد شد',
                data: { id: result.insertId }
            });
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در ایجاد event:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: errorMessage },
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
        const { id, title, description, start_date, end_date, type, location, status, all_day } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID رویداد الزامی است' },
                { status: 400 }
            );
        }

        const pool = await getTenantConnection(tenantKey);
        const conn = await pool.getConnection();

        try {
            await conn.query(
                `UPDATE calendar_events SET 
          title = ?, description = ?, start_date = ?, end_date = ?,
          type = ?, location = ?, status = ?, all_day = ?, updated_at = NOW()
        WHERE id = ? AND tenant_key = ?`,
                [
                    title,
                    description || null,
                    start_date,
                    end_date || null,
                    type || 'meeting',
                    location || null,
                    status || 'confirmed',
                    all_day ? 1 : 0,
                    id,
                    tenantKey
                ]
            );

            return NextResponse.json({
                success: true,
                message: 'رویداد با موفقیت بروزرسانی شد'
            });
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در بروزرسانی event:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const tenantKey = request.headers.get('X-Tenant-Key');
        const eventId = request.nextUrl.searchParams.get('id');

        if (!tenantKey) {
            return NextResponse.json(
                { success: false, message: 'Tenant key یافت نشد' },
                { status: 400 }
            );
        }

        if (!eventId) {
            return NextResponse.json(
                { success: false, message: 'ID رویداد الزامی است' },
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
            await conn.query(
                'DELETE FROM calendar_events WHERE id = ? AND tenant_key = ?',
                [eventId, tenantKey]
            );

            return NextResponse.json({
                success: true,
                message: 'رویداد با موفقیت حذف شد'
            });
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در حذف event:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور' },
            { status: 500 }
        );
    }
}