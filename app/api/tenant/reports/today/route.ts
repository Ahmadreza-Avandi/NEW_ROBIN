import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
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

        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        const today = new Date().toISOString().split('T')[0];

        // دریافت گزارش امروز
        const [reports] = await connection.query(
            'SELECT * FROM daily_reports WHERE user_id = ? AND DATE(report_date) = ?',
            [session.userId, today]
        ) as any[];

        if (reports && reports.length > 0) {
            return NextResponse.json({
                success: true,
                data: reports[0]
            });
        } else {
            return NextResponse.json({
                success: true,
                data: null
            });
        }

    } catch (error) {
        console.error('❌ خطا در دریافت گزارش امروز:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}