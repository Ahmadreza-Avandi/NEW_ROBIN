import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
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

            // Get unread notifications count
            const [countResult] = await executeQuery(`
        SELECT COUNT(*) as unread_count
        FROM notifications 
        WHERE user_id = ? AND is_read = 0
      `, [decoded.id]);

            // Get recent notifications (last 30)
            const notifications = await executeQuery(`
        SELECT 
          id, title, message, type, is_read, created_at
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 30
      `, [decoded.id]);

            return NextResponse.json({
                success: true,
                data: {
                    unread_count: countResult?.unread_count || 0,
                    notifications: notifications || []
                }
            });

        } catch (jwtError) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Get notifications API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت اطلاعات' },
            { status: 500 }
        );
    }
}