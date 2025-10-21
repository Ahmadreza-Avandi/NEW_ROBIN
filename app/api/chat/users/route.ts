import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getAuthUser } from '@/lib/auth-helper';

// GET /api/chat/users - Get list of users for chat
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        // Get all active users except current user
        const users = await executeQuery(`
            SELECT 
                u.id,
                COALESCE(u.name, u.username) as name,
                u.username,
                u.email,
                u.role,
                u.status,
                u.last_login,
                (
                    SELECT COUNT(*) 
                    FROM chat_messages cm 
                    WHERE cm.sender_id = u.id 
                    AND cm.receiver_id = ? 
                    AND cm.read_at IS NULL
                ) as unread_count
            FROM users u
            WHERE u.id != ?
            AND u.status = 'active'
            ORDER BY u.name ASC, u.username ASC
        `, [user.id, user.id]);

        return NextResponse.json({
            success: true,
            data: users || []
        });

    } catch (error) {
        console.error('Get chat users error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت لیست کاربران' },
            { status: 500 }
        );
    }
}
