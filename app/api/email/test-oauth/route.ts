import { NextRequest, NextResponse } from 'next/server';
import { emailServiceOAuth } from '@/lib/email-service-oauth';

export async function POST(request: NextRequest) {
    try {
        const { recipient } = await request.json();

        if (!recipient) {
            return NextResponse.json({
                success: false,
                error: 'Recipient email is required'
            }, { status: 400 });
        }

        console.log('🧪 Testing OAuth email service...');

        // Test email service
        const result = await emailServiceOAuth.sendTestEmail(recipient);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully',
                recipient
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to send test email'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Test OAuth configuration
        const testResult = await emailServiceOAuth.sendTestEmail('only.link086@gmail.com');

        return NextResponse.json({
            success: testResult.success,
            message: testResult.success ? 'OAuth email service is working' : 'OAuth email service failed',
            error: testResult.error
        });

    } catch (error) {
        console.error('OAuth test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'OAuth configuration error'
        }, { status: 500 });
    }
}