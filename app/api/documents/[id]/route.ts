import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getUserFromToken, hasModulePermission } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

// اتصال به دیتابیس
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'crm_system',
    charset: 'utf8mb4',
};

// حذف سند با ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد - فعلاً غیرفعال برای تست
        // const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        // if (!hasDocsAccess) {
        //     return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        // }

        const documentId = params.id;

        if (!documentId) {
            return NextResponse.json({ error: 'شناسه سند الزامی است' }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // بررسی وجود سند
        const [documents] = await connection.execute(
            'SELECT id, uploaded_by, file_path, stored_filename FROM documents WHERE id = ? AND status != "deleted"',
            [documentId]
        );

        if (!documents || (documents as any[]).length === 0) {
            await connection.end();
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        const document = (documents as any[])[0];

        // بررسی مجوز حذف (فقط سازنده یا CEO) - فعلاً غیرفعال برای تست
        // if (user.role !== 'ceo' && document.uploaded_by !== user.id) {
        //     await connection.end();
        //     return NextResponse.json({ error: 'مجوز حذف ندارید' }, { status: 403 });
        // }

        // حذف فایل فیزیکی (اختیاری)
        try {
            if (document.stored_filename) {
                const filePath = join(process.cwd(), 'uploads', 'documents', document.stored_filename);
                await unlink(filePath);
            }
        } catch (fileError) {
            console.warn('خطا در حذف فایل فیزیکی:', fileError);
            // ادامه می‌دهیم حتی اگر فایل حذف نشود
        }

        // حذف سند از دیتابیس (soft delete)
        await connection.execute(
            'UPDATE documents SET status = "deleted", updated_at = NOW() WHERE id = ?',
            [documentId]
        );

        // ثبت لاگ حذف
        await connection.execute(
            `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address)
             VALUES (UUID(), ?, ?, 'delete', ?, ?)`,
            [
                documentId,
                user.id,
                JSON.stringify({ reason: 'user_request', title: document.title }),
                (request as any).ip || 'unknown',
            ]
        );

        await connection.end();

        return NextResponse.json({
            success: true,
            message: 'سند با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف سند:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'خطا در حذف سند' 
        }, { status: 500 });
    }
}