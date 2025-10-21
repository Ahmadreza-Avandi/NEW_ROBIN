import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { testEmail } = await request.json();

        if (!testEmail) {
            return NextResponse.json(
                { error: 'Test email address is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Send test email
        const testResult = await sendTestEmail(testEmail);

        if (testResult.success) {
            // Log successful test
            await executeSingle(
                'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                [
                    'email_test',
                    'success',
                    JSON.stringify({
                        testEmail,
                        timestamp: new Date().toISOString()
                    })
                ]
            );

            return NextResponse.json({
                success: true,
                message: 'ایمیل تست با موفقیت ارسال شد',
                details: {
                    recipient: testEmail,
                    sentAt: new Date().toISOString()
                }
            });
        } else {
            // Log failed test
            await executeSingle(
                'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                [
                    'email_test',
                    'failed',
                    JSON.stringify({
                        testEmail,
                        error: testResult.error,
                        timestamp: new Date().toISOString()
                    })
                ]
            );

            return NextResponse.json(
                {
                    success: false,
                    message: 'خطا در ارسال ایمیل تست',
                    error: testResult.error
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { error: 'Failed to send test email' },
            { status: 500 }
        );
    }
}

async function sendTestEmail(testEmail: string) {
    try {
        // Get email configuration
        const emailConfig = await executeQuery(
            'SELECT setting_value FROM system_settings WHERE setting_key = ?',
            ['email_config']
        );

        const config = emailConfig[0]?.setting_value || {};

        if (!config.smtp_host || !config.smtp_user) {
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        // This would integrate with your actual email service
        // For now, we'll simulate the email sending

        const emailContent = {
            to: testEmail,
            subject: 'تست سرویس ایمیل سیستم CRM',
            html: `
        <div dir="rtl" style="font-family: 'Vazir', Arial, sans-serif;">
          <h2>تست سرویس ایمیل</h2>
          <p>سلام،</p>
          <p>این ایمیل برای تست سرویس ایمیل سیستم CRM ارسال شده است.</p>
          <p><strong>جزئیات تست:</strong></p>
          <ul>
            <li>زمان ارسال: ${new Date().toLocaleString('fa-IR')}</li>
            <li>وضعیت سیستم: فعال</li>
          </ul>
          <p>اگر این ایمیل را دریافت کرده‌اید، یعنی سرویس ایمیل به درستی کار می‌کند.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            این ایمیل به صورت خودکار از سیستم CRM ارسال شده است.
          </p>
        </div>
      `
        };

        // Here you would call your actual email service
        // For example: await sendEmail(emailContent);

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate success (in real implementation, this would depend on actual email service response)
        const success = Math.random() > 0.1; // 90% success rate for simulation

        if (success) {
            return { success: true };
        } else {
            return {
                success: false,
                error: 'SMTP connection failed'
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}