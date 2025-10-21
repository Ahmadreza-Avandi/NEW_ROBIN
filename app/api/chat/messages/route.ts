import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getAuthUser } from '@/lib/auth-helper';
import { v4 as uuidv4 } from 'uuid';

// GET /api/chat/messages - Get messages between current user and another user
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'شناسه کاربر الزامی است'
            }, { status: 400 });
        }

        // Get messages between current user and selected user
        const messages = await executeQuery(`
            SELECT 
                cm.*,
                u.username as sender_name
            FROM chat_messages cm
            LEFT JOIN users u ON cm.sender_id = u.id
            WHERE 
                (cm.sender_id = ? AND cm.receiver_id = ?)
                OR (cm.sender_id = ? AND cm.receiver_id = ?)
            ORDER BY cm.created_at ASC
        `, [user.id, userId, userId, user.id]);

        return NextResponse.json({
            success: true,
            data: messages || []
        });

    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت پیام‌ها' },
            { status: 500 }
        );
    }
}

// POST /api/chat/messages - Send a new message
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const body = await req.json();
        const { receiver_id, content, message_type, reply_to_id, file_url, file_name, file_size } = body;

        if (!receiver_id || !content) {
            return NextResponse.json({
                success: false,
                message: 'گیرنده و محتوای پیام الزامی است'
            }, { status: 400 });
        }

        const messageId = uuidv4();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await executeQuery(`
            INSERT INTO chat_messages (
                id,
                tenant_key,
                conversation_id,
                sender_id,
                receiver_id,
                message,
                message_type,
                reply_to_id,
                file_url,
                file_name,
                file_size,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            messageId,
            user.tenant_key,
            `conv-${messageId}`,
            user.id,
            receiver_id,
            content,
            message_type || 'text',
            reply_to_id || null,
            file_url || null,
            file_name || null,
            file_size || null,
            now
        ]);

        return NextResponse.json({
            success: true,
            message: 'پیام ارسال شد',
            data: { id: messageId }
        });

    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ارسال پیام' },
            { status: 500 }
        );
    }
}
