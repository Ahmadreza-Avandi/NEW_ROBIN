import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// دانلود سند اشتراکی
export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // بررسی معتبر بودن توکن و دسترسی دانلود
        const [shares] = await connection.execute(
            `SELECT 
        ds.*,
        d.stored_filename,
        d.original_filename,
        d.mime_type,
        d.file_size
      FROM document_shares ds
      JOIN documents d ON ds.document_id = d.id
      WHERE ds.share_token = ? AND ds.is_active = 1 AND d.status = 'active'`,
            [params.token]
        );

        if ((shares as any[]).length === 0) {
            await connection.end();
            return NextResponse.json({ error: 'لینک نامعتبر' }, { status: 404 });
        }

        const share = (shares as any[])[0];

        // بررسی انقضای لینک
        if (share.expires_at && new Date() > new Date(share.expires_at)) {
            await connection.end();
            return NextResponse.json({ error: 'لینک منقضی شده' }, { status: 410 });
        }

        // بررسی دسترسی دانلود
        if (share.permission_type !== 'download') {
            await connection.end();
            return NextResponse.json({ error: 'دسترسی دانلود ندارید' }, { status: 403 });
        }

        // خواندن فایل
        const filePath = join(process.cwd(), 'uploads', 'documents', share.stored_filename);

        try {
            const fileBuffer = await readFile(filePath);

            // افزایش تعداد دانلود
            await connection.execute(
                'UPDATE documents SET download_count = download_count + 1 WHERE id = ?',
                [share.document_id]
            );

            await connection.end();

            // ارسال فایل
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': share.mime_type,
                    'Content-Disposition': `attachment; filename="${encodeURIComponent(share.original_filename)}"`,
                    'Content-Length': share.file_size.toString(),
                },
            });

        } catch (fileError) {
            await connection.end();
            console.error('خطا در خواندن فایل:', fileError);
            return NextResponse.json({ error: 'فایل یافت نشد' }, { status: 404 });
        }

    } catch (error) {
        console.error('خطا در دانلود سند اشتراکی:', error);
        return NextResponse.json({ error: 'خطا در دانلود سند' }, { status: 500 });
    }
}