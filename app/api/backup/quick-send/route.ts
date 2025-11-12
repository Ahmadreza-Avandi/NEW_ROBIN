import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // اعتبارسنجی ایمیل
        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'آدرس ایمیل الزامی است'
            }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: 'فرمت ایمیل نامعتبر است'
            }, { status: 400 });
        }

        console.log(`🚀 درخواست ارسال سریع بک‌آپ به: ${email}`);

        // Temporarily disabled - backup service needs to be fixed
        return NextResponse.json({
            success: false,
            error: 'سرویس بک‌آپ موقتاً غیرفعال است'
        }, { status: 503 });

    } catch (error) {
        console.error('خطا در API ارسال سریع:', error);
        return NextResponse.json({
            success: false,
            error: 'خطای داخلی سرور'
        }, { status: 500 });
    }
}