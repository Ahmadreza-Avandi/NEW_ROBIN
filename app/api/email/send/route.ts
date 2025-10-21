import { NextRequest, NextResponse } from 'next/server';
import { emailServiceOAuth } from '@/lib/email-service-oauth';

// Direct email send using OAuth service
export async function POST(request: NextRequest) {
    try {
        const requestData = await request.json();
        const { to, subject, message, template, type = 'simple', variables } = requestData || {};

        console.log('📧 Email API Request (OAuth direct):', {
            to,
            subject,
            message: message ? 'Present' : 'Missing',
            template: template ? 'Present' : 'Missing',
            type,
            variables,
        });

        if (!to || !subject) {
            return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
        }

        if (!message && !template) {
            return NextResponse.json({ error: 'Either message or template is required' }, { status: 400 });
        }

        // Send email directly using OAuth service
        const result = await emailServiceOAuth.sendEmail({
            to,
            subject,
            html: message || template,
            text: message || template
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                via: 'oauth2-direct',
                info: 'Email sent successfully',
                messageId: result.messageId
            });
        }

        return NextResponse.json(
            { success: false, error: result.error || 'Failed to send email' },
            { status: 500 }
        );
    } catch (error: any) {
        console.error('Email API error:', error);
        return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
    }
}
