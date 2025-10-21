import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getUserFromToken } from '@/lib/auth';

// اتصال به دیتابیس
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// دریافت آمار اسناد
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // آمار کلی اسناد بر اساس نوع فایل
        const [stats] = await connection.execute(`
            SELECT 
                CASE 
                    WHEN mime_type LIKE 'application/pdf' THEN 'contract'
                    WHEN mime_type LIKE 'image/%' THEN 'presentation'
                    WHEN mime_type LIKE 'text/%' THEN 'report'
                    WHEN mime_type LIKE 'application/vnd.ms-excel%' OR mime_type LIKE 'application/vnd.openxmlformats-officedocument.spreadsheetml%' THEN 'invoice'
                    ELSE 'other'
                END as document_type,
                status,
                COUNT(*) as document_count,
                ROUND(SUM(file_size) / 1024 / 1024, 2) as total_size_mb,
                ROUND(AVG(file_size) / 1024 / 1024, 2) as avg_size_mb
            FROM documents 
            WHERE status != 'deleted'
            GROUP BY document_type, status
            ORDER BY document_type, status
        `);

        // آمار بر اساس نوع محتوا
        const [contentStats] = await connection.execute(`
            SELECT 
                CASE 
                    WHEN mime_type LIKE 'image/%' THEN 'photo'
                    WHEN mime_type LIKE 'video/%' THEN 'video'
                    WHEN mime_type LIKE 'audio/%' THEN 'audio'
                    ELSE 'document'
                END as content_type,
                COUNT(*) as count,
                ROUND(SUM(file_size) / 1024 / 1024, 2) as total_size_mb
            FROM documents 
            WHERE status != 'deleted'
            GROUP BY content_type
            ORDER BY count DESC
        `);

        // آمار بر اساس سطح دسترسی
        const [accessStats] = await connection.execute(`
            SELECT 
                access_level,
                COUNT(*) as count
            FROM documents 
            WHERE status != 'deleted'
            GROUP BY access_level
            ORDER BY count DESC
        `);

        // آمار اسناد اخیر (30 روز گذشته)
        const [recentStats] = await connection.execute(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM documents 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);

        await connection.end();

        return NextResponse.json({
            stats,
            contentStats,
            accessStats,
            recentStats
        });

    } catch (error) {
        console.error('خطا در دریافت آمار اسناد:', error);
        return NextResponse.json({ error: 'خطا در دریافت آمار اسناد' }, { status: 500 });
    }
}