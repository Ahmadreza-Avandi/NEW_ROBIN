import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { hasPermission } from '@/lib/auth';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'لطفا وارد حساب کاربری خود شوید' },
                { status: 401 }
            );
        }

        // بررسی دسترسی - allow more roles to access
        // Expanded role list to include more roles that should have access
        const allowedRoles = ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'supervisor', 'agent', 'sales_agent'];
        
        if (!hasPermission(user.role || '', allowedRoles)) {
            console.log('Access denied for role:', user.role);
            return NextResponse.json(
                { success: false, message: 'عدم دسترسی' },
                { status: 403 }
            );
        }

        console.log('Fetching coworkers for user role:', user.role);

        // دریافت لیست همکاران
        const coworkers = await executeQuery(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                u.team,
                u.phone,
                u.created_at,
                u.status,
                u.avatar_url,
                u.last_active
            FROM users u
            WHERE u.status != 'inactive'
            ORDER BY u.name
        `);

        console.log('Found coworkers:', coworkers.length);
        return NextResponse.json({ success: true, data: coworkers });
    } catch (error) {
        console.error('Error in coworkers API:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت اطلاعات همکاران' },
            { status: 500 }
        );
    }
}
