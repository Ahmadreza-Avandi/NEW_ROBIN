import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'غیر مجاز' },
                { status: 401 }
            );
        }

        // دریافت فرم‌های بازخورد
        const forms = await executeQuery(`
            SELECT id, title, type, description, status, created_at
            FROM feedback_forms 
            WHERE status = 'active'
            ORDER BY created_at DESC
        `);

        return NextResponse.json({
            success: true,
            data: forms
        });

    } catch (error) {
        console.error('Error fetching feedback forms:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت فرم‌ها' },
            { status: 500 }
        );
    }
}