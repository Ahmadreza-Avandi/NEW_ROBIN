import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
    let connection;

    try {
        const tenantKey = request.headers.get('X-Tenant-Key');
        console.log('🔍 Profile API - Tenant Key:', tenantKey);

        if (!tenantKey) {
            console.log('❌ No tenant key provided');
            return NextResponse.json(
                { success: false, message: 'Tenant key یافت نشد' },
                { status: 400 }
            );
        }

        const session = getTenantSessionFromRequest(request, tenantKey);
        console.log('🔍 Session:', session ? 'Found' : 'Not found');
        
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 401 }
            );
        }

        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        // دریافت اطلاعات کاربر
        const [users] = await connection.query(
            'SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?',
            [session.userId]
        ) as any[];

        if (!users || users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'کاربر یافت نشد' },
                { status: 404 }
            );
        }

        const user = users[0];

        return NextResponse.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('❌ خطا در دریافت پروفایل:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

export async function POST(request: NextRequest) {
    let connection;

    try {
        const tenantKey = request.headers.get('X-Tenant-Key');
        
        if (!tenantKey) {
            return NextResponse.json(
                { success: false, message: 'Tenant key یافت نشد' },
                { status: 400 }
            );
        }

        const session = getTenantSessionFromRequest(request, tenantKey);
        
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 401 }
            );
        }

        const { name, phone } = await request.json();

        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        // به‌روزرسانی اطلاعات کاربر
        await connection.query(
            'UPDATE users SET name = ?, phone = ? WHERE id = ?',
            [name, phone, session.userId]
        );

        return NextResponse.json({
            success: true,
            message: 'اطلاعات پروفایل با موفقیت به‌روزرسانی شد'
        });

    } catch (error) {
        console.error('❌ خطا در به‌روزرسانی پروفایل:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}