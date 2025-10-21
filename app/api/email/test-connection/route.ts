import { NextRequest, NextResponse } from 'next/server';

const notificationService = require('@/lib/notification-service-v2.js');

export async function GET() {
    try {
        console.log('🔧 Testing email connection...');

        // Test connection
        const connectionTest = await notificationService.testConnection();

        if (connectionTest) {
            return NextResponse.json({
                success: true,
                message: 'اتصال ایمیل موفقیت‌آمیز است',
                service: notificationService.emailService?.constructor?.name || 'Unknown'
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'خطا در اتصال به سرویس ایمیل'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ Email connection test failed:', error);
        return NextResponse.json({
            success: false,
            message: 'خطا در تست اتصال ایمیل',
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'ایمیل الزامی است'
            }, { status: 400 });
        }

        console.log('📧 Sending test welcome email to:', email);

        // Send test welcome email
        const result = await notificationService.sendWelcomeEmail(email, 'کاربر تست');

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'ایمیل تست با موفقیت ارسال شد',
                messageId: result.messageId
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'خطا در ارسال ایمیل تست',
                error: result.error
            }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ Test email send failed:', error);
        return NextResponse.json({
            success: false,
            message: 'خطا در ارسال ایمیل تست',
            error: error.message
        }, { status: 500 });
    }
}