import { NextRequest, NextResponse } from 'next/server';

const smsService = require('@/lib/sms-service.js');

export async function POST(request: NextRequest) {
    try {
        const { to, message } = await request.json();

        if (!to || !message) {
            return NextResponse.json({
                success: false,
                message: 'شماره تلفن و متن پیام الزامی است'
            }, { status: 400 });
        }

        console.log('📱 Sending test SMS to:', to);

        // Send SMS
        const result = await smsService.sendSMS({
            to: to,
            message: message
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'پیامک با موفقیت ارسال شد',
                messageId: result.messageId,
                provider: result.provider
            });
        } else {
            return NextResponse.json({
                success: false,
                message: result.error || 'خطا در ارسال پیامک'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ SMS send failed:', error);
        return NextResponse.json({
            success: false,
            message: 'خطا در ارسال پیامک',
            error: error.message
        }, { status: 500 });
    }
}