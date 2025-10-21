import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getCurrentUser, hasModulePermission } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// دریافت لیست دسته‌بندی‌ها
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
          return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد
        const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        if (!hasDocsAccess) {
          return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        }

        const connection = await mysql.createConnection(dbConfig);

        const [categories] = await connection.execute(
            `SELECT 
        dc.*,
        COUNT(d.id) as document_count,
        u.name as created_by_name
      FROM document_categories dc
      LEFT JOIN documents d ON dc.id = d.category_id AND d.status = 'active'
      LEFT JOIN users u ON dc.created_by = u.id
      WHERE dc.is_active = 1
      GROUP BY dc.id
      ORDER BY dc.sort_order ASC, dc.name ASC`
        );

        await connection.end();

        return NextResponse.json({ categories });

    } catch (error) {
        console.error('خطا در دریافت دسته‌بندی‌ها:', error);
        return NextResponse.json({ error: 'خطا در دریافت دسته‌بندی‌ها' }, { status: 500 });
    }
}

// ایجاد دسته‌بندی جدید
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
          return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد
        const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        if (!hasDocsAccess) {
          return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        }

        // فقط مدیر عامل می‌تواند دسته‌بندی ایجاد کند
        if (user.role !== 'ceo') {
            return NextResponse.json({ error: 'فقط مدیر عامل می‌تواند دسته‌بندی ایجاد کند' }, { status: 403 });
        }

        const { name, description, parentId, color, icon, sortOrder } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'نام دسته‌بندی الزامی است' }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        // بررسی تکراری نبودن نام
        const [existing] = await connection.execute(
            'SELECT id FROM document_categories WHERE name = ? AND is_active = 1',
            [name]
        );

        if ((existing as any[]).length > 0) {
            await connection.end();
            return NextResponse.json({ error: 'دسته‌بندی با این نام قبلاً وجود دارد' }, { status: 400 });
        }

        const categoryId = uuidv4();

        await connection.execute(
            `INSERT INTO document_categories (
        id, name, description, parent_id, color, icon, sort_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                categoryId,
                name,
                description || null,
                parentId || null,
                color || '#3B82F6',
                icon || 'folder',
                sortOrder || 0,
                user.id
            ]
        );

        await connection.end();

        return NextResponse.json({
            success: true,
            message: 'دسته‌بندی با موفقیت ایجاد شد',
            categoryId
        });

    } catch (error) {
        console.error('خطا در ایجاد دسته‌بندی:', error);
        return NextResponse.json({ error: 'خطا در ایجاد دسته‌بندی' }, { status: 500 });
    }
}