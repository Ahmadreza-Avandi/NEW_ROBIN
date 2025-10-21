import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification-utils';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'توکن احراز هویت یافت نشد' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
            const body = await req.json();
            const { notificationId, markAll } = body;

            let result;

            if (markAll) {
                result = await markAllNotificationsAsRead(decoded.id);
            } else if (notificationId) {
                result = await markNotificationAsRead(notificationId, decoded.id);
            } else {
                return NextResponse.json(
                    { success: false, message: 'شناسه اطلاع‌رسانی یا درخواست mark all الزامی است' },
                    { status: 400 }
                );
            }

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: markAll ? 'همه اطلاع‌رسانی‌ها خوانده شد' : 'اطلاع‌رسانی خوانده شد'
                });
            } else {
                return NextResponse.json(
                    { success: false, message: 'خطا در به‌روزرسانی اطلاع‌رسانی' },
                    { status: 500 }
                );
            }

        } catch (jwtError) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Mark notification as read API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در پردازش درخواست' },
            { status: 500 }
        );
    }
}