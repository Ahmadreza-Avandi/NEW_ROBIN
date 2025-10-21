import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'غیر مجاز' },
                { status: 401 }
            );
        }

        // ایجاد فرم‌های پیش‌فرض
        const defaultForms = [
            {
                id: uuidv4(),
                title: 'فرم رضایت‌سنجی فروش',
                type: 'sales',
                description: 'ارزیابی کیفیت خدمات فروش',
                questions: JSON.stringify([
                    { type: 'rating', question: 'کیفیت خدمات فروش را چگونه ارزیابی می‌کنید؟', required: true },
                    { type: 'text', question: 'نظرات و پیشنهادات شما', required: false }
                ])
            },
            {
                id: uuidv4(),
                title: 'فرم رضایت‌سنجی محصول',
                type: 'product',
                description: 'ارزیابی کیفیت محصولات',
                questions: JSON.stringify([
                    { type: 'rating', question: 'کیفیت محصول را چگونه ارزیابی می‌کنید؟', required: true },
                    { type: 'text', question: 'چه بهبودی در محصول پیشنهاد می‌دهید؟', required: false }
                ])
            }
        ];

        for (const form of defaultForms) {
            await executeSingle(`
                INSERT IGNORE INTO feedback_forms (
                    id, title, type, description, questions, status, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())
            `, [form.id, form.title, form.type, form.description, form.questions, user.id]);
        }

        return NextResponse.json({
            success: true,
            message: 'فرم‌های پیش‌فرض ایجاد شدند'
        });

    } catch (error) {
        console.error('Error setting up feedback forms:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ایجاد فرم‌ها' },
            { status: 500 }
        );
    }
}