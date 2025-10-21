import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.get('auth-token')?.value ||
            req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'توکن یافت نشد' },
                { status: 401 }
            );
        }

        const userId = await getUserFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'کاربر یافت نشد' },
                { status: 401 }
            );
        }

        const { testEmail } = await req.json();

        if (!testEmail) {
            return NextResponse.json(
                { success: false, message: 'ایمیل تست الزامی است' },
                { status: 400 }
            );
        }

        // Check email service status
        const emailStatus = emailService.getStatus();
        if (!emailStatus.configured) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'سیستم ایمیل تنظیم نشده است',
                    status: emailStatus
                },
                { status: 500 }
            );
        }

        // Test connection
        const connectionTest = await emailService.testConnection();
        if (!connectionTest) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'خطا در اتصال به سرور ایمیل',
                    status: emailStatus
                },
                { status: 500 }
            );
        }

        // Send test email
        const result = await emailService.sendTemplateEmail(
            testEmail,
            '🧪 تست سیستم ایمیل CRM',
            `سلام {name}،

این یک ایمیل تست از سیستم مدیریت ارتباط با مشتری است.

✅ **وضعیت سیستم ایمیل:**
- سرور: ${emailStatus.config?.host}:${emailStatus.config?.port}
- کاربر: ${emailStatus.config?.user}
- امنیت: ${emailStatus.config?.secure ? 'SSL/TLS' : 'STARTTLS'}

🕐 **زمان تست:** ${new Date().toLocaleString('fa-IR')}

اگر این ایمیل را دریافت کردید، یعنی سیستم ایمیل به درستی کار می‌کند.

با تشکر،
تیم توسعه CRM`,
            {
                name: 'کاربر تست'
            }
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'ایمیل تست با موفقیت ارسال شد',
                data: {
                    messageId: result.messageId,
                    to: testEmail,
                    status: emailStatus
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'خطا در ارسال ایمیل تست: ' + result.error,
                status: emailStatus
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Email test error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در تست ایمیل: ' + error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.get('auth-token')?.value ||
            req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'توکن یافت نشد' },
                { status: 401 }
            );
        }

        const userId = await getUserFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'کاربر یافت نشد' },
                { status: 401 }
            );
        }

        // Get email service status
        const emailStatus = emailService.getStatus();

        let connectionStatus = false;
        if (emailStatus.configured) {
            try {
                connectionStatus = await emailService.testConnection();
            } catch (error) {
                connectionStatus = false;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...emailStatus,
                connectionTest: connectionStatus,
                lastChecked: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Email status error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت وضعیت ایمیل: ' + error.message },
            { status: 500 }
        );
    }
}