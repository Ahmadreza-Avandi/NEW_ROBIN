import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '@/lib/database';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const receiverId = formData.get('receiverId') as string;
        const messageType = formData.get('messageType') as string;

        if (!file || !receiverId || !messageType) {
            return NextResponse.json({
                success: false,
                message: 'اطلاعات ارسالی کامل نیست'
            }, { status: 400 });
        }

        // Validate file size
        const maxSize = messageType === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for files
        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                message: `حجم فایل نباید بیشتر از ${maxSize / 1024 / 1024} مگابایت باشد`
            }, { status: 400 });
        }

        // Validate file type for images
        if (messageType === 'image' && !file.type.startsWith('image/')) {
            return NextResponse.json({
                success: false,
                message: 'فقط فایل‌های تصویری مجاز هستند'
            }, { status: 400 });
        }

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileExtension = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        const fileUrl = `/uploads/chat/${fileName}`;

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save message to database
        const messageId = uuidv4();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Generate simple conversation ID based on user IDs
        const conversationId = `conv-${[user.id, receiverId].sort().join('-')}`;

        await executeQuery(`
            INSERT INTO chat_messages (
                id, tenant_key, conversation_id, sender_id, receiver_id, message, message_type, 
                file_url, file_name, file_size, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            messageId,
            user.tenant_key,
            conversationId,
            user.id,
            receiverId,
            file.name, // Use original filename as message
            messageType,
            fileUrl,
            file.name,
            file.size,
            now
        ]);

        return NextResponse.json({
            success: true,
            message: 'فایل با موفقیت ارسال شد',
            data: {
                messageId,
                fileUrl,
                fileName: file.name,
                fileSize: file.size
            }
        });

    } catch (error) {
        console.error('Chat upload API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در آپلود فایل' },
            { status: 500 }
        );
    }
}