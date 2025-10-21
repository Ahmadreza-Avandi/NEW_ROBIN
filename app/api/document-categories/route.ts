import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getUserFromToken } from '@/lib/auth';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

export async function GET(request: NextRequest) {
    try {
        // بررسی توکن و دریافت اطلاعات کاربر
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'لطفا وارد شوید' }, { status: 401 });
        }

        // اتصال به دیتابیس
        const connection = await mysql.createConnection(dbConfig);

        // دریافت همه دسته‌بندی‌ها
        const [categories] = await connection.execute(
            'SELECT * FROM document_categories WHERE is_active = 1'
        );

        await connection.end();

        return NextResponse.json(categories);

    } catch (error) {
        console.error('خطا در دریافت دسته‌بندی‌ها:', error);
        return NextResponse.json(
            { error: 'خطا در دریافت دسته‌بندی‌ها' },
            { status: 500 }
        );
    }
}
