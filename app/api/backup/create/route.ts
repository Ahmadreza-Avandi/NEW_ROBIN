import { NextRequest, NextResponse } from 'next/server';
import { backupEmailService } from '@/lib/backup-email-service';
import { settingsService } from '@/lib/settings-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            compress = true,
            includeData = true,
            excludeTables = [],
            sendEmail = true,
            customRecipients = []
        } = body;

        // بررسی دسترسی (اختیاری - می‌تونی authentication اضافه کنی)
        // const session = await getServerSession(authOptions);
        // if (!session?.user) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        console.log('🔄 درخواست ایجاد بک‌آپ دریافت شد');

        // ایجاد بک‌آپ و ارسال ایمیل
        const result = await backupEmailService.createBackupAndSendEmail({
            compress,
            includeData,
            excludeTables,
            sendEmail,
            customRecipients
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'بک‌آپ با موفقیت ایجاد شد',
                data: {
                    backup: result.backup,
                    email: result.email
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error('خطا در API بک‌آپ:', error);
        return NextResponse.json({
            success: false,
            error: 'خطای داخلی سرور'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'test':
                // تست سیستم
                const testResult = await backupEmailService.testBackupEmailSystem();
                return NextResponse.json({
                    success: true,
                    data: testResult
                });

            case 'stats':
                // آمار بک‌آپ‌ها
                const stats = await backupEmailService.getBackupStats();
                return NextResponse.json({
                    success: true,
                    data: stats
                });

            case 'config':
                // تنظیمات فعلی
                const backupConfig = await settingsService.getBackupConfig();
                const emailConfig = await settingsService.getEmailConfig();
                return NextResponse.json({
                    success: true,
                    data: {
                        backup: backupConfig,
                        email: {
                            enabled: emailConfig.enabled,
                            configured: !!(emailConfig.smtp_host && emailConfig.smtp_user)
                        }
                    }
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'عمل نامعتبر'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('خطا در GET API بک‌آپ:', error);
        return NextResponse.json({
            success: false,
            error: 'خطای داخلی سرور'
        }, { status: 500 });
    }
}