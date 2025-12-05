import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

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

        const { work_description, completed_tasks, working_hours, challenges, achievements } = await request.json();

        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        const today = new Date().toISOString().split('T')[0];
        
        // تبدیل تاریخ میلادی به شمسی
        const persianDate = new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date()).replace(/\//g, '/');

        // بررسی وجود گزارش امروز
        const [existingReports] = await connection.query(
            'SELECT id FROM daily_reports WHERE tenant_key = ? AND user_id = ? AND DATE(report_date) = ?',
            [tenantKey, session.userId, today]
        ) as any[];

        if (existingReports && existingReports.length > 0) {
            // به‌روزرسانی گزارش موجود
            await connection.query(
                `UPDATE daily_reports SET 
                work_description = ?, 
                completed_tasks = ?, 
                working_hours = ?, 
                challenges = ?, 
                achievements = ?,
                persian_date = ?,
                updated_at = NOW()
                WHERE tenant_key = ? AND user_id = ? AND DATE(report_date) = ?`,
                [
                    work_description,
                    JSON.stringify(completed_tasks || []),
                    working_hours || 0,
                    challenges || '',
                    achievements || '',
                    persianDate,
                    tenantKey,
                    session.userId,
                    today
                ]
            );

            return NextResponse.json({
                success: true,
                message: 'گزارش روزانه با موفقیت به‌روزرسانی شد'
            });
        } else {
            // ایجاد گزارش جدید
            await connection.query(
                `INSERT INTO daily_reports 
                (tenant_key, user_id, work_description, completed_tasks, working_hours, challenges, achievements, report_date, persian_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tenantKey,
                    session.userId,
                    work_description,
                    JSON.stringify(completed_tasks || []),
                    working_hours || 0,
                    challenges || '',
                    achievements || '',
                    today,
                    persianDate
                ]
            );

            return NextResponse.json({
                success: true,
                message: 'گزارش روزانه با موفقیت ثبت شد'
            });
        }

    } catch (error) {
        console.error('❌ خطا در ثبت گزارش:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}