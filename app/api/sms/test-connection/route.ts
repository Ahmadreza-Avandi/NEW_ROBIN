import { NextRequest, NextResponse } from 'next/server';

const smsService = require('@/lib/sms-service.js');

export async function GET() {
    try {
        console.log('🔧 Testing SMS connection...');

        // Test connection
        const connectionTest = await smsService.testConnection();

        if (connectionTest) {
            const status = smsService.getStatus();
            return NextResponse.json({
                success: true,
                message: 'اتصال پیامک موفقیت‌آمیز است',
                provider: status.provider || 'Unknown'
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'خطا در اتصال به سرویس پیامک'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ SMS connection test failed:', error);
        return NextResponse.json({
            success: false,
            message: 'خطا در تست اتصال پیامک',
            error: error.message
        }, { status: 500 });
    }
}