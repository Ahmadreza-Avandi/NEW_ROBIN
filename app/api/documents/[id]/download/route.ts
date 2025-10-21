import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { getCurrentUser } from '@/lib/auth';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// دانلود سند
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // دریافت اطلاعات سند
        const [documents] = await connection.execute(
            'SELECT * FROM documents WHERE id = ? AND status = "active"',
            [params.id]
        );

        if ((documents as any[]).length === 0) {
            await connection.end();
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        const document = (documents as any[])[0];

        // بررسی دسترسی دانلود
        if (user.role !== 'ceo' && document.uploaded_by !== user.id && document.access_level === 'private') {
            const [permissions] = await connection.execute(
                `SELECT * FROM document_permissions 
         WHERE document_id = ? AND user_id = ? AND permission_type IN ('download', 'admin') AND is_active = 1`,
                [params.id, user.id]
            );

            if ((permissions as any[]).length === 0) {
                await connection.end();
                return NextResponse.json({ error: 'دسترسی دانلود ندارید' }, { status: 403 });
            }
        }

        // خواندن فایل
        const filePath = join(process.cwd(), 'uploads', 'documents', document.stored_filename);

        try {
            const fileBuffer = await readFile(filePath);

            // افزایش تعداد دانلود
            await connection.execute(
                'UPDATE documents SET download_count = download_count + 1 WHERE id = ?',
                [params.id]
            );

            // ثبت فعالیت دانلود
            await connection.execute(
                `INSERT INTO document_activity_log (id, document_id, user_id, action, ip_address) 
         VALUES (UUID(), ?, ?, 'download', ?)`,
                [params.id, user.id, request.ip || 'unknown']
            );

            await connection.end();

            // ارسال فایل
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': document.mime_type,
                    'Content-Disposition': `attachment; filename="${encodeURIComponent(document.original_filename)}"`,
                    'Content-Length': document.file_size.toString(),
                },
            });

        } catch (fileError) {
            await connection.end();
            console.error('خطا در خواندن فایل:', fileError);
            return NextResponse.json({ error: 'فایل یافت نشد' }, { status: 404 });
        }

    } catch (error) {
        console.error('خطا در دانلود سند:', error);
        return NextResponse.json({ error: 'خطا در دانلود سند' }, { status: 500 });
    }
}