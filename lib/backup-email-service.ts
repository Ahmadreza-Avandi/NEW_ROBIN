import { backupService } from './backup';
import { emailService } from './email-service';
import { settingsService } from './settings-service';
import { executeQuery, executeSingle } from './database';

interface BackupEmailOptions {
    compress?: boolean;
    includeData?: boolean;
    excludeTables?: string[];
    sendEmail?: boolean;
    customRecipients?: string[];
}

interface BackupEmailResult {
    success: boolean;
    backup?: {
        fileName: string;
        fileSize: number;
        duration: number;
        filePath: string;
    };
    email?: {
        sent: boolean;
        recipients: string[];
        error?: string;
    };
    error?: string;
}

export class BackupEmailService {

    /**
     * ایجاد بک‌آپ و ارسال به ایمیل
     */
    async createBackupAndSendEmail(options: BackupEmailOptions = {}): Promise<BackupEmailResult> {
        const startTime = Date.now();

        try {
            console.log('🔄 شروع فرآیند بک‌آپ و ارسال ایمیل...');

            // 1. ایجاد بک‌آپ
            const backupResult = await backupService.createBackup({
                compress: options.compress ?? true,
                includeData: options.includeData ?? true,
                excludeTables: options.excludeTables || []
            });

            if (!backupResult.success) {
                return {
                    success: false,
                    error: `خطا در ایجاد بک‌آپ: ${backupResult.error}`
                };
            }

            console.log('✅ بک‌آپ با موفقیت ایجاد شد');

            // 2. ثبت در تاریخچه بک‌آپ
            await this.logBackupHistory(backupResult, 'completed');

            let emailResult = null;

            // 3. ارسال ایمیل (اگر درخواست شده باشد)
            if (options.sendEmail !== false) {
                const recipients = await this.getEmailRecipients(options.customRecipients);

                if (recipients.length > 0) {
                    console.log(`📧 ارسال ایمیل به ${recipients.length} گیرنده...`);

                    const emailResults = await Promise.all(
                        recipients.map(recipient =>
                            emailService.sendBackupEmail(backupResult, recipient)
                        )
                    );

                    const successfulEmails = emailResults.filter(r => r.success);
                    const failedEmails = emailResults.filter(r => !r.success);

                    emailResult = {
                        sent: successfulEmails.length > 0,
                        recipients: recipients,
                        error: failedEmails.length > 0
                            ? `${failedEmails.length} ایمیل ارسال نشد`
                            : undefined
                    };

                    console.log(`✅ ${successfulEmails.length} ایمیل با موفقیت ارسال شد`);
                    if (failedEmails.length > 0) {
                        console.log(`⚠️ ${failedEmails.length} ایمیل ارسال نشد`);
                    }
                } else {
                    console.log('⚠️ هیچ گیرنده‌ای برای ارسال ایمیل تعریف نشده');
                    emailResult = {
                        sent: false,
                        recipients: [],
                        error: 'هیچ گیرنده‌ای تعریف نشده'
                    };
                }
            }

            const totalDuration = Date.now() - startTime;
            console.log(`🎉 فرآیند کامل در ${Math.round(totalDuration / 1000)} ثانیه تکمیل شد`);

            return {
                success: true,
                backup: {
                    fileName: backupResult.fileName!,
                    fileSize: backupResult.fileSize!,
                    duration: backupResult.duration!,
                    filePath: backupResult.filePath!
                },
                email: emailResult
            };

        } catch (error) {
            console.error('❌ خطا در فرآیند بک‌آپ و ارسال ایمیل:', error);

            // ثبت خطا در تاریخچه
            await this.logBackupHistory(null, 'failed', error instanceof Error ? error.message : 'خطای نامشخص');

            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطای نامشخص'
            };
        }
    }

    /**
     * دریافت لیست گیرندگان ایمیل از تنظیمات
     */
    private async getEmailRecipients(customRecipients?: string[]): Promise<string[]> {
        try {
            if (customRecipients && customRecipients.length > 0) {
                return customRecipients;
            }

            const backupConfig = await settingsService.getBackupConfig();

            if (backupConfig.emailRecipients && backupConfig.emailRecipients.length > 0) {
                return backupConfig.emailRecipients;
            }

            // اگر هیچ گیرنده‌ای تعریف نشده، از ایمیل پیش‌فرض استفاده کن
            return ['only.link086@gmail.com'];

        } catch (error) {
            console.error('خطا در دریافت گیرندگان ایمیل:', error);
            return ['only.link086@gmail.com'];
        }
    }

    /**
     * ثبت تاریخچه بک‌آپ در دیتابیس
     */
    private async logBackupHistory(
        backupResult: any,
        status: 'completed' | 'failed' | 'in_progress',
        errorMessage?: string
    ): Promise<void> {
        try {
            await executeSingle(
                `INSERT INTO backup_history 
                 (type, status, file_name, file_size, duration, error_message, created_at, completed_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'manual',
                    status,
                    backupResult?.fileName || null,
                    backupResult?.fileSize || null,
                    backupResult?.duration || null,
                    errorMessage || null,
                    new Date(),
                    status === 'completed' ? new Date() : null
                ]
            );
        } catch (error) {
            console.error('خطا در ثبت تاریخچه بک‌آپ:', error);
        }
    }

    /**
     * ارسال بک‌آپ سریع (بدون تنظیمات پیچیده)
     */
    async quickBackupAndEmail(emailAddress: string): Promise<BackupEmailResult> {
        return await this.createBackupAndSendEmail({
            compress: true,
            includeData: true,
            sendEmail: true,
            customRecipients: [emailAddress]
        });
    }

    /**
     * تست سیستم بک‌آپ و ایمیل
     */
    async testBackupEmailSystem(): Promise<{
        backup: { available: boolean; error?: string };
        email: { configured: boolean; error?: string };
        overall: boolean;
    }> {
        try {
            // تست mysqldump
            const mysqldumpTest = await backupService.testMysqldump();

            // تست تنظیمات ایمیل
            const emailConfig = await settingsService.getEmailConfig();
            const emailConfigured = !!(emailConfig.smtp_host && emailConfig.smtp_user);

            const overall = mysqldumpTest.available && emailConfigured;

            return {
                backup: {
                    available: mysqldumpTest.available,
                    error: mysqldumpTest.error
                },
                email: {
                    configured: emailConfigured,
                    error: emailConfigured ? undefined : 'تنظیمات ایمیل کامل نیست'
                },
                overall
            };

        } catch (error) {
            return {
                backup: { available: false, error: 'خطا در تست بک‌آپ' },
                email: { configured: false, error: 'خطا در تست ایمیل' },
                overall: false
            };
        }
    }

    /**
     * دریافت آمار بک‌آپ‌های اخیر
     */
    async getBackupStats(): Promise<{
        totalBackups: number;
        successfulBackups: number;
        failedBackups: number;
        lastBackup?: {
            date: Date;
            status: string;
            fileName?: string;
            fileSize?: number;
        };
        totalSize: number;
    }> {
        try {
            // آمار کلی از دیتابیس
            const stats = await executeQuery(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                    SUM(COALESCE(file_size, 0)) as total_size
                FROM backup_history 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

            // آخرین بک‌آپ
            const lastBackup = await executeQuery(`
                SELECT status, file_name, file_size, created_at 
                FROM backup_history 
                ORDER BY created_at DESC 
                LIMIT 1
            `);

            const result = {
                totalBackups: stats[0]?.total || 0,
                successfulBackups: stats[0]?.successful || 0,
                failedBackups: stats[0]?.failed || 0,
                totalSize: stats[0]?.total_size || 0,
                lastBackup: lastBackup[0] ? {
                    date: lastBackup[0].created_at,
                    status: lastBackup[0].status,
                    fileName: lastBackup[0].file_name,
                    fileSize: lastBackup[0].file_size
                } : undefined
            };

            return result;

        } catch (error) {
            console.error('خطا در دریافت آمار بک‌آپ:', error);
            return {
                totalBackups: 0,
                successfulBackups: 0,
                failedBackups: 0,
                totalSize: 0
            };
        }
    }
}

export const backupEmailService = new BackupEmailService();