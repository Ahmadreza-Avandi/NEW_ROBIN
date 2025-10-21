import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getAuthUser, authErrorResponse } from '@/lib/auth-helper';

// Generate UUID function
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// GET /api/chat/conversations - Get all conversations for current user
export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json(authErrorResponse.unauthorized, { status: 401 });
        }

        const currentUserId = user.id;

        const conversations = await executeQuery(`
            SELECT 
                c.*,
                lm.message as last_message_content,
                lm.created_at as last_message_sent_at,
                sender.name as last_message_sender_name
            FROM chat_conversations c
            LEFT JOIN (
                SELECT 
                    conversation_id,
                    message,
                    sender_id,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
                FROM chat_messages
            ) lm ON c.id = lm.conversation_id AND lm.rn = 1
            LEFT JOIN users sender ON lm.sender_id = sender.id
            WHERE (c.participant_1_id = ? OR c.participant_2_id = ?)
            AND c.tenant_key = ?
            ORDER BY 
                CASE 
                    WHEN lm.created_at IS NOT NULL THEN lm.created_at 
                    ELSE c.created_at 
                END DESC
        `, [currentUserId, currentUserId, user.tenant_key]);

        // Format conversations with last message info
        const formattedConversations = conversations.map((conv: any) => ({
            ...conv,
            last_message: conv.last_message_content ? {
                content: conv.last_message_content,
                sent_at: conv.last_message_sent_at,
                sender_name: conv.last_message_sender_name
            } : null,
            // Remove redundant fields
            last_message_content: undefined,
            last_message_sent_at: undefined,
            last_message_sender_name: undefined
        }));

        return NextResponse.json({
            success: true,
            data: formattedConversations
        });

    } catch (error) {
        console.error('Get conversations API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت مکالمات' },
            { status: 500 }
        );
    }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json(authErrorResponse.unauthorized, { status: 401 });
        }

        const currentUserId = user.id;

        const { participantId, title } = await req.json();

        if (!participantId) {
            return NextResponse.json(
                { success: false, message: 'شناسه شرکت‌کننده الزامی است' },
                { status: 400 }
            );
        }

        // Check if conversation already exists between these users
        const existingConversation = await executeSingle(`
            SELECT * FROM chat_conversations 
            WHERE tenant_key = ?
            AND ((participant_1_id = ? AND participant_2_id = ?) 
               OR (participant_1_id = ? AND participant_2_id = ?))
        `, [user.tenant_key, currentUserId, participantId, participantId, currentUserId]);

        if (existingConversation) {
            return NextResponse.json({
                success: true,
                data: existingConversation,
                message: 'مکالمه از قبل وجود دارد'
            });
        }

        // Create new conversation
        const conversationId = generateUUID();
        const conversationTitle = title || `مکالمه ${new Date().toLocaleDateString('fa-IR')}`;

        await executeQuery(`
            INSERT INTO chat_conversations (
                id, tenant_key, participant_1_id, participant_2_id, title, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [conversationId, user.tenant_key, currentUserId, participantId, conversationTitle]);

        // Get the created conversation with participant info
        const newConversation = await executeSingle(`
            SELECT 
                c.*,
                p1.name as participant_1_name,
                p2.name as participant_2_name
            FROM chat_conversations c
            JOIN users p1 ON c.participant_1_id = p1.id
            JOIN users p2 ON c.participant_2_id = p2.id
            WHERE c.id = ?
        `, [conversationId]);

        return NextResponse.json({
            success: true,
            data: newConversation,
            message: 'مکالمه جدید ایجاد شد'
        });

    } catch (error) {
        console.error('Create conversation API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ایجاد مکالمه' },
            { status: 500 }
        );
    }
}