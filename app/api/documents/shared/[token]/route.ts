import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// دریافت اطلاعات سند اشتراکی
export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // بررسی معتبر بودن توکن
        const [shares] = await connection.execute(
            `SELECT 
        ds.*,
        d.id as document_id,
        d.title,
        d.description,
        d.original_filename,
        d.file_size,
        d.mime_type,
        d.persian_date,
        d.view_count,
        d.download_count,
        dc.name as category_name,
        dc.color as category_color,
        u1.name as uploaded_by_name,
        u2.name as shared_by_name
      FROM document_shares ds
      JOIN documents d ON ds.document_id = d.id
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      LEFT JOIN users u1 ON d.uploaded_by = u1.id
      LEFT JOIN users u2 ON ds.shared_by = u2.id
      WHERE ds.share_token = ? AND ds.is_active = 1 AND d.status = 'active'`,
            [params.token]
        );

        if ((shares as any[]).length === 0) {
            await connection.end();
            return NextResponse.json({ error: 'لینک نامعتبر یا منقضی شده' }, { status: 404 });
        }

        const share = (shares as any[])[0];

        // بررسی انقضای لینک
        if (share.expires_at && new Date() > new Date(share.expires_at)) {
            await connection.end();
            return NextResponse.json({ error: 'لینک منقضی شده' }, { status: 410 });
        }

        // افزایش تعداد دسترسی
        await connection.execute(
            'UPDATE document_shares SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = ?',
            [share.id]
        );

        // افزایش تعداد بازدید سند
        await connection.execute(
            'UPDATE documents SET view_count = view_count + 1 WHERE id = ?',
            [share.document_id]
        );

        await connection.end();

        const document = {
            id: share.document_id,
            title: share.title,
            description: share.description,
            original_filename: share.original_filename,
            file_size: share.file_size,
            mime_type: share.mime_type,
            category_name: share.category_name,
            category_color: share.category_color,
            persian_date: share.persian_date,
            uploaded_by_name: share.uploaded_by_name,
            view_count: share.view_count,
            download_count: share.download_count,
            share_permission: share.permission_type,
            share_expires_at: share.expires_at,
            share_message: share.message,
            shared_by_name: share.shared_by_name
        };

        return NextResponse.json({ document });

    } catch (error) {
        console.error('خطا در دریافت سند اشتراکی:', error);
        return NextResponse.json({ error: 'خطا در دریافت سند' }, { status: 500 });
    }
}