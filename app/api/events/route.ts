import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
// Date utility functions
const formatDateForDb = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
};

const parseAndValidateDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('تاریخ نامعتبر است');
    }
    return formatDateForDb(dateString);
};

const validateDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
        throw new Error('تاریخ شروع نامعتبر است');
    }

    if (end) {
        const endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
            throw new Error('تاریخ پایان نامعتبر است');
        }
        if (endDate <= startDate) {
            throw new Error('تاریخ پایان باید بعد از تاریخ شروع باشد');
        }
    }
};

// GET /api/events - Get events with optional date range
export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const type = searchParams.get('type');
        const today = searchParams.get('today') === 'true';

        // Debug logging
        console.log('📅 Events API called with params:', { from, to, type, today });

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (today) {
            // Get today's events (considering date only, not time)
            const now = new Date();
            const todayStart = formatDateForDb(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
            const todayEnd = formatDateForDb(now.toISOString().split('T')[0] + 'T23:59:59.999Z');
            whereClause += ' AND DATE(e.start_date) = DATE(?)';
            params.push(todayStart);
        } else {
            if (from) {
                whereClause += ' AND e.start_date >= ?';
                params.push(parseAndValidateDate(from));
            }

            if (to) {
                whereClause += ' AND e.start_date <= ?';
                params.push(parseAndValidateDate(to));
            }
        }

        if (type) {
            whereClause += ' AND e.type = ?';
            params.push(type);
        }

        // Don't show cancelled events by default
        whereClause += " AND e.status != 'cancelled'";

        // Get events
        const events = await executeQuery(`
            SELECT 
                e.*,
                c.name as customer_name,
                u.name as created_by_name
            FROM calendar_events e
            LEFT JOIN customers c ON e.customer_id = c.id
            LEFT JOIN users u ON e.created_by = u.id
            ${whereClause}
            ORDER BY e.start_date ASC
        `, params);

        // Get participants for each event
        for (let event of events) {
            const participants = await executeQuery(`
                SELECT ep.user_id, u.name, u.email
                FROM event_participants ep
                LEFT JOIN users u ON ep.user_id = u.id
                WHERE ep.event_id = ?
            `, [event.id]);

            event.participants = participants;

            // Get reminders
            const reminders = await executeQuery(`
                SELECT * FROM event_reminders WHERE event_id = ?
            `, [event.id]);

            event.reminders = reminders;
        }

        // Debug logging
        console.log('📅 Returning events:', events.length, 'events');
        console.log('📅 Events with titles:', events.map(e => ({ title: e.title, start_date: e.start_date })));

        return NextResponse.json({
            success: true,
            data: events
        });

    } catch (error) {
        console.error('Get events API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت رویدادها' },
            { status: 500 }
        );
    }
}

// POST /api/events - Create new event
export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const body = await req.json();
        console.log('📅 POST /api/events - Received body:', JSON.stringify(body, null, 2));

        const {
            title,
            description,
            start,
            end,
            allDay = false,
            type = 'meeting',
            participants = [],
            location,
            status = 'confirmed',
            customer_id,
            reminders = []
        } = body;

        if (!title || !start) {
            console.log('📅 POST /api/events - Validation failed:', { title, start });
            return NextResponse.json(
                { success: false, message: 'عنوان و زمان شروع الزامی است' },
                { status: 400 }
            );
        }

        try {
            validateDateRange(start, end);
        } catch (error: any) {
            console.log('📅 POST /api/events - Date validation failed:', error.message, { start, end });
            return NextResponse.json(
                { success: false, message: error.message || 'تاریخ نامعتبر' },
                { status: 400 }
            );
        }

        const startDate = formatDateForDb(start);
        const endDate = end ? formatDateForDb(end) : null;
        console.log('📅 POST /api/events - Formatted dates:', { startDate, endDate });

        // Check for conflicts
        const conflictingEvents = await executeQuery(`
            SELECT id, title FROM calendar_events 
            WHERE (
                (start_date <= ? AND end_date >= ?) OR
                (start_date <= ? AND end_date >= ?) OR
                (start_date >= ? AND start_date <= ?)
            ) AND status != 'cancelled'
        `, [startDate, startDate, endDate || startDate, endDate || startDate, startDate, endDate || startDate]);

        if (conflictingEvents.length > 0) {
            console.log('⚠️ Event conflict detected:', conflictingEvents);
            // Don't block creation, just warn
        }

        const eventId = uuidv4();

        // Create event
        await executeSingle(`
            INSERT INTO calendar_events (
                id, title, description, start_date, end_date, all_day,
                type, location, status, customer_id, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            eventId,
            title,
            description || null,
            startDate,
            endDate,
            allDay,
            type,
            location || null,
            status,
            customer_id || null,
            user.id
        ]);

        // Add participants
        for (const participantId of participants) {
            await executeSingle(`
                INSERT INTO event_participants (id, event_id, user_id, created_at)
                VALUES (?, ?, ?, NOW())
            `, [uuidv4(), eventId, participantId]);
        }

        // Add reminders
        for (const reminder of reminders) {
            await executeSingle(`
                INSERT INTO event_reminders (id, event_id, method, minutes_before, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [uuidv4(), eventId, reminder.method, reminder.minutes]);
        }

        return NextResponse.json({
            success: true,
            message: 'رویداد با موفقیت ایجاد شد',
            data: { id: eventId }
        });

    } catch (error) {
        console.error('Create event API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ایجاد رویداد' },
            { status: 500 }
        );
    }
}

// PUT /api/events - Update event
export async function PUT(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            id,
            title,
            description,
            start,
            end,
            allDay = false,
            type = 'meeting',
            participants = [],
            location,
            status = 'confirmed',
            customer_id,
            reminders = []
        } = body;

        if (!id || !title || !start) {
            return NextResponse.json(
                { success: false, message: 'شناسه، عنوان و زمان شروع الزامی است' },
                { status: 400 }
            );
        }

        try {
            validateDateRange(start, end);
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error.message || 'تاریخ نامعتبر' },
                { status: 400 }
            );
        }

        const startDate = formatDateForDb(start);
        const endDate = end ? formatDateForDb(end) : null;

        // Check if event exists
        const [existingEvent] = await executeQuery(`
            SELECT id FROM calendar_events WHERE id = ?
        `, [id]);

        if (!existingEvent) {
            return NextResponse.json(
                { success: false, message: 'رویداد یافت نشد' },
                { status: 404 }
            );
        }

        // Update event
        await executeSingle(`
            UPDATE calendar_events SET
                title = ?, description = ?, start_date = ?, end_date = ?,
                all_day = ?, type = ?, location = ?, status = ?,
                customer_id = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            title,
            description || null,
            startDate,
            endDate,
            allDay,
            type,
            location || null,
            status,
            customer_id || null,
            id
        ]);

        // Update participants
        await executeSingle(`DELETE FROM event_participants WHERE event_id = ?`, [id]);
        for (const participantId of participants) {
            await executeSingle(`
                INSERT INTO event_participants (id, event_id, user_id, created_at)
                VALUES (?, ?, ?, NOW())
            `, [uuidv4(), id, participantId]);
        }

        // Update reminders
        await executeSingle(`DELETE FROM event_reminders WHERE event_id = ?`, [id]);
        for (const reminder of reminders) {
            await executeSingle(`
                INSERT INTO event_reminders (id, event_id, method, minutes_before, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [uuidv4(), id, reminder.method, reminder.minutes]);
        }

        return NextResponse.json({
            success: true,
            message: 'رویداد با موفقیت ویرایش شد'
        });

    } catch (error) {
        console.error('Update event API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ویرایش رویداد' },
            { status: 500 }
        );
    }
}

// DELETE /api/events - Delete event
export async function DELETE(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json(
                { success: false, message: 'شناسه رویداد الزامی است' },
                { status: 400 }
            );
        }

        // Check if event exists
        const [existingEvent] = await executeQuery(`
            SELECT id FROM calendar_events WHERE id = ?
        `, [eventId]);

        if (!existingEvent) {
            return NextResponse.json(
                { success: false, message: 'رویداد یافت نشد' },
                { status: 404 }
            );
        }

        // Delete event and related data
        await Promise.all([
            executeSingle(`DELETE FROM event_participants WHERE event_id = ?`, [eventId]),
            executeSingle(`DELETE FROM event_reminders WHERE event_id = ?`, [eventId]),
            executeSingle(`DELETE FROM calendar_events WHERE id = ?`, [eventId])
        ]);

        return NextResponse.json({
            success: true,
            message: 'رویداد با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('Delete event API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در حذف رویداد' },
            { status: 500 }
        );
    }
}
