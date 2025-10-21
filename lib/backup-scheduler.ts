import { backupService } from './backup';
import { executeQuery, executeSingle } from './database';

export class BackupScheduler {
    private intervals: Map<string, NodeJS.Timeout> = new Map();

    async scheduleBackup(config: {
        enabled: boolean;
        schedule: 'daily' | 'weekly' | 'monthly';
        time: string;
        emailRecipients?: string[];
        retentionDays?: number;
    }) {
        // Clear existing schedule
        this.clearSchedule();

        if (!config.enabled) {
            console.log('Backup scheduling disabled');
            return;
        }

        const nextRun = this.calculateNextRun(config.schedule, config.time);
        const delay = nextRun.getTime() - Date.now();

        console.log(`Scheduling next backup for: ${nextRun.toISOString()}`);
        console.log(`Delay: ${Math.round(delay / 1000 / 60)} minutes`);

        const timeoutId = setTimeout(async () => {
            await this.executeScheduledBackup(config);
            // Reschedule for next occurrence
            this.scheduleBackup(config);
        }, delay);

        this.intervals.set('main', timeoutId);
    }

    private async executeScheduledBackup(config: any) {
        try {
            console.log('Starting scheduled backup...');

            // Create backup record
            const result = await executeSingle(
                `INSERT INTO backup_history (type, status, created_at) 
         VALUES (?, ?, ?)`,
                ['automatic', 'in_progress', new Date()]
            );

            const backupId = result.insertId;

            // Create the backup
            const backupResult = await backupService.createBackup({
                compress: true,
                includeData: true,
                excludeTables: ['system_logs'] // Exclude logs to reduce size
            });

            if (backupResult.success) {
                // Update backup record
                await executeSingle(
                    `UPDATE backup_history 
           SET status = ?, file_path = ?, file_size = ?, completed_at = ?
           WHERE id = ?`,
                    [
                        'completed',
                        backupResult.filePath,
                        backupResult.fileSize,
                        new Date(),
                        backupId
                    ]
                );

                // Log success
                await executeSingle(
                    'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                    [
                        'scheduled_backup',
                        'success',
                        JSON.stringify({
                            backupId,
                            fileName: backupResult.fileName,
                            fileSize: backupResult.fileSize,
                            duration: backupResult.duration
                        })
                    ]
                );

                // Send email notifications if configured
                if (config.emailRecipients && config.emailRecipients.length > 0) {
                    for (const email of config.emailRecipients) {
                        await this.sendBackupNotification(email, backupResult, 'success');
                    }
                }

                // Cleanup old backups
                if (config.retentionDays) {
                    const deletedCount = await backupService.cleanupOldBackups(config.retentionDays);
                    if (deletedCount > 0) {
                        console.log(`Cleaned up ${deletedCount} old backup files`);
                    }
                }

                console.log(`Scheduled backup completed successfully: ${backupResult.fileName}`);
            } else {
                // Update backup record with failure
                await executeSingle(
                    `UPDATE backup_history 
           SET status = ?, error_message = ?, completed_at = ?
           WHERE id = ?`,
                    [
                        'failed',
                        backupResult.error,
                        new Date(),
                        backupId
                    ]
                );

                // Log failure
                await executeSingle(
                    'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                    [
                        'scheduled_backup',
                        'failed',
                        JSON.stringify({
                            backupId,
                            error: backupResult.error,
                            duration: backupResult.duration
                        })
                    ]
                );

                // Send failure notification
                if (config.emailRecipients && config.emailRecipients.length > 0) {
                    for (const email of config.emailRecipients) {
                        await this.sendBackupNotification(email, backupResult, 'failed');
                    }
                }

                console.error(`Scheduled backup failed: ${backupResult.error}`);
            }
        } catch (error) {
            console.error('Error in scheduled backup:', error);

            // Log the error
            await executeSingle(
                'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                [
                    'scheduled_backup',
                    'failed',
                    JSON.stringify({
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString()
                    })
                ]
            );
        }
    }

    private calculateNextRun(schedule: string, time: string): Date {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);

        let next = new Date(now);
        next.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, move to the next occurrence
        if (next <= now) {
            switch (schedule) {
                case 'daily':
                    next.setDate(next.getDate() + 1);
                    break;
                case 'weekly':
                    next.setDate(next.getDate() + 7);
                    break;
                case 'monthly':
                    next.setMonth(next.getMonth() + 1, 1); // First day of next month
                    next.setHours(hours, minutes, 0, 0);
                    break;
                default:
                    next.setDate(next.getDate() + 1);
            }
        }

        return next;
    }

    private async sendBackupNotification(email: string, backupResult: any, status: 'success' | 'failed') {
        try {
            // Use the email service to send notification
            const { emailService } = await import('./email-service');

            if (status === 'success') {
                const result = await emailService.sendBackupEmail(backupResult, email);
                if (result.success) {
                    console.log(`✅ Backup notification sent successfully to: ${email}`);
                } else {
                    console.error(`❌ Failed to send backup notification to ${email}:`, result.error);
                }
            } else {
                // Send failure notification
                const subject = 'خطا در بک‌آپ خودکار سیستم CRM';
                const html = `
                <div dir="rtl" style="font-family: 'Vazir', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">❌ خطا در بک‌آپ خودکار</h1>
                  </div>
                  
                  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; line-height: 1.6;">سلام،</p>
                    
                    <p style="font-size: 16px; line-height: 1.6;">
                      متأسفانه بک‌آپ خودکار دیتابیس سیستم CRM با خطا مواجه شد.
                    </p>

                    <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #dc3545;">
                      <h3 style="color: #721c24; margin-top: 0;">🚨 جزئیات خطا:</h3>
                      <p style="color: #721c24; margin: 0;"><strong>پیام خطا:</strong> ${backupResult.error || 'خطای نامشخص'}</p>
                      <p style="color: #721c24; margin: 10px 0 0 0;"><strong>زمان:</strong> ${new Date().toLocaleString('fa-IR')}</p>
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107;">
                      <p style="margin: 0; color: #856404;">
                        <strong>⚠️ اقدامات لازم:</strong> لطفاً وضعیت سیستم و تنظیمات بک‌آپ را بررسی کنید.
                      </p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings" 
                         style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                                color: white; 
                                padding: 12px 30px; 
                                text-decoration: none; 
                                border-radius: 25px; 
                                display: inline-block;
                                font-weight: bold;">
                        🔧 بررسی تنظیمات
                      </a>
                    </div>
                  </div>

                  <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
                    <p style="margin: 0;">
                      این ایمیل به صورت خودکار از سیستم CRM ارسال شده است.<br>
                      زمان ارسال: ${new Date().toLocaleString('fa-IR')}
                    </p>
                  </div>
                </div>
                `;

                const result = await emailService.sendEmail({
                    to: email,
                    subject,
                    html
                });

                if (result.success) {
                    console.log(`✅ Backup failure notification sent to: ${email}`);
                } else {
                    console.error(`❌ Failed to send backup failure notification to ${email}:`, result.error);
                }
            }

        } catch (error) {
            console.error('Error sending backup notification:', error);
        }
    }

    clearSchedule() {
        this.intervals.forEach((timeoutId, key) => {
            clearTimeout(timeoutId);
            this.intervals.delete(key);
        });
    }

    async initializeFromDatabase() {
        try {
            // Get backup configuration from database
            const configResult = await executeQuery(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                ['backup_config']
            );

            if (configResult.length > 0) {
                const config = configResult[0].setting_value;
                if (config.enabled) {
                    await this.scheduleBackup(config);
                    console.log('Backup scheduler initialized from database configuration');
                }
            }
        } catch (error) {
            console.error('Error initializing backup scheduler:', error);
        }
    }
}

export const backupScheduler = new BackupScheduler();