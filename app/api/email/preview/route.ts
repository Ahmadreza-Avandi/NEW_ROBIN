import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { content, subject } = await request.json();

        if (!content || !subject) {
            return NextResponse.json({
                success: false,
                error: 'محتوا و موضوع الزامی است'
            }, { status: 400 });
        }

        const { generateEmailTemplate } = await import('../../../../lib/email-template-helper.js');

        // Replace sample variables for preview
        const sampleContent = content
            .replace(/\{name\}/g, 'احمد محمدی')
            .replace(/\{company\}/g, 'شرکت نمونه')
            .replace(/\{email\}/g, 'sample@example.com')
            .replace(/\{phone\}/g, '09123456789')
            .replace(/\{role\}/g, 'مدیر فروش');

        const htmlContent = generateEmailTemplate(sampleContent, subject);

        return NextResponse.json({
            success: true,
            html: htmlContent
        });

    } catch (error: any) {
        console.error('Email preview error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'خطا در تولید پیش‌نمایش'
        }, { status: 500 });
    }
}