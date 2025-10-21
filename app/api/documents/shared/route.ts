import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { getUserFromToken } from '@/lib/auth';
import { convertToJalali } from '@/lib/persian-date';
import { v4 as uuidv4 } from 'uuid';

// اتصال به دیتابیس
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// ارسال سند با ایمیل
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        const { documentId, recipientEmail, recipientName, message } = await request.json();

        if (!documentId || !recipientEmail) {
            return NextResponse.json({
                error: 'شناسه سند و ایمیل گیرنده الزامی است'
            }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // دریافت اطلاعات سند
        const [documents] = await connection.execute(
            `SELECT * FROM documents WHERE id = ? AND status = 'active'`,
            [documentId]
        );

        if (!Array.isArray(documents) || documents.length === 0) {
            await connection.end();
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        const document = documents[0] as any;

        // بررسی دسترسی کاربر به سند
        if (user.role !== 'ceo' && document.uploaded_by !== user.id && document.access_level === 'private') {
            // بررسی مجوز خاص
            const [permissions] = await connection.execute(
                `SELECT * FROM document_permissions 
                 WHERE document_id = ? AND user_id = ? AND is_active = 1`,
                [documentId, user.id]
            );

            if (!Array.isArray(permissions) || permissions.length === 0) {
                await connection.end();
                return NextResponse.json({ error: 'عدم دسترسی به این سند' }, { status: 403 });
            }
        }

        // خواندن فایل
        const filePath = join(process.cwd(), 'uploads', 'documents', document.stored_filename);
        let fileBuffer: Buffer;

        try {
            fileBuffer = await readFile(filePath);
        } catch (fileError) {
            console.error('خطا در خواندن فایل:', fileError);
            await connection.end();
            return NextResponse.json({ error: 'فایل یافت نشد' }, { status: 404 });
        }

        // ارسال ایمیل با استفاده از سرویس Express
        try {
            const emailPayload = {
                to: recipientEmail,
                subject: `📄 سند "${document.title}" برای شما ارسال شد`,
                html: `
                    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                        <h2>سلام ${recipientName || 'کاربر گرامی'}،</h2>
                        
                        <p>سند "<strong>${document.title}</strong>" توسط <strong>${user.name}</strong> برای شما ارسال شده است.</p>
                        
                        ${message ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>پیام:</strong><br>
                            ${message.replace(/\n/g, '<br>')}
                        </div>` : ''}
                        
                        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3>اطلاعات سند:</h3>
                            <ul>
                                <li><strong>نام فایل:</strong> ${document.original_filename}</li>
                                <li><strong>حجم:</strong> ${(document.file_size / 1024).toFixed(2)} کیلوبایت</li>
                                <li><strong>نوع:</strong> ${document.mime_type}</li>
                                <li><strong>تاریخ آپلود:</strong> ${document.persian_date || new Date(document.created_at).toLocaleDateString('fa-IR')}</li>
                            </ul>
                        </div>
                        
                        <p>فایل به عنوان ضمیمه این ایمیل ارسال شده است.</p>
                        
                        <hr style="margin: 30px 0;">
                        <p style="color: #666; font-size: 12px;">
                            این پیام از سیستم مدیریت اسناد CRM ارسال شده است.<br>
                            تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR')}
                        </p>
                    </div>
                `,
                attachments: [{
                    filename: document.original_filename,
                    content: fileBuffer,
                    contentType: document.mime_type
                }]
            };

            // ارسال به سرویس Express
            const expressResponse = await fetch('http://localhost:3001/send-email-with-attachment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload)
            });

            if (!expressResponse.ok) {
                const errorText = await expressResponse.text();
                console.error('خطای سرویس Express:', errorText);
                throw new Error(`Express service error: ${expressResponse.status}`);
            }

            const expressResult = await expressResponse.json();

            if (!expressResult.ok) {
                throw new Error(expressResult.error || 'خطا در ارسال ایمیل');
            }

            // ثبت فعالیت اشتراک‌گذاری
            await connection.execute(
                `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address) 
                 VALUES (?, ?, ?, 'share_email', ?, ?)`,
                [
                    uuidv4(),
                    documentId,
                    user.id,
                    JSON.stringify({
                        recipient_email: recipientEmail,
                        recipient_name: recipientName,
                        message: message || null,
                        email_service: 'express'
                    }),
                    request.ip || 'unknown'
                ]
            );

            // ثبت در جدول اشتراک‌گذاری (اگر وجود دارد)
            try {
                await connection.execute(
                    `INSERT INTO document_shares (id, document_id, shared_by, shared_with_email, shared_with_name, message, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        uuidv4(),
                        documentId,
                        user.id,
                        recipientEmail,
                        recipientName || null,
                        message || null
                    ]
                );
            } catch (shareError) {
                // اگر جدول وجود نداشت، نادیده بگیر
                console.log('جدول document_shares وجود ندارد، ادامه می‌دهیم...');
            }

            await connection.end();

            return NextResponse.json({
                success: true,
                message: 'سند با موفقیت ارسال شد',
                data: {
                    document_title: document.title,
                    recipient_email: recipientEmail,
                    recipient_name: recipientName,
                    sent_at: new Date().toISOString()
                }
            });

        } catch (emailError) {
            console.error('خطا در ارسال ایمیل:', emailError);
            await connection.end();

            return NextResponse.json({
                success: false,
                error: 'خطا در ارسال ایمیل. لطفاً بعداً تلاش کنید.',
                details: emailError instanceof Error ? emailError.message : 'خطای نامشخص'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('خطا در اشتراک‌گذاری سند:', error);
        return NextResponse.json({
            success: false,
            error: 'خطا در اشتراک‌گذاری سند'
        }, { status: 500 });
    }
}