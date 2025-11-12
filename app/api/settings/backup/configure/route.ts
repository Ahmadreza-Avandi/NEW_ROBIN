import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        // Get backup configuration
        const config = await executeQuery(
            'SELECT setting_value, updated_at FROM system_settings WHERE setting_key = ?',
            ['backup_config']
        );

        const backupConfig = config[0]?.setting_value || {
            enabled: false,
            schedule: 'daily',
            time: '02:00',
            emailRecipients: [],
            retentionDays: 30,
            compression: true
        };

        return NextResponse.json({
            config: backupConfig,
            lastUpdated: config[0]?.updated_at || null
        });
    } catch (error) {
        console.error('Error fetching backup configuration:', error);
        return NextResponse.json(
            { error: 'Failed to fetch backup configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const configData = await request.json();

        // Validate configuration
        const validationResult = validateBackupConfig(configData);
        if (!validationResult.valid) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400 }
            );
        }

        const backupConfig = {
            enabled: configData.enabled || false,
            schedule: configData.schedule || 'daily',
            time: configData.time || '02:00',
            emailRecipients: configData.emailRecipients || [],
            retentionDays: configData.retentionDays || 30,
            compression: configData.compression !== false // default to true
        };

        // Save configuration
        await executeSingle(
            `INSERT INTO system_settings (setting_key, setting_value, updated_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       setting_value = VALUES(setting_value), 
       updated_at = VALUES(updated_at)`,
            [
                'backup_config',
                JSON.stringify(backupConfig),
                new Date()
            ]
        );

        // Log configuration change
        await executeSingle(
            'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
            [
                'backup_config_updated',
                'success',
                JSON.stringify({
                    newConfig: backupConfig,
                    timestamp: new Date().toISOString()
                })
            ]
        );

        // Schedule or clear backup based on configuration
        let nextScheduled = null;
        try {
            const { backupScheduler } = await import('@/lib/backup-scheduler');

            if (backupConfig.enabled) {
                await backupScheduler.scheduleBackup(backupConfig);
                nextScheduled = calculateNextBackup(backupConfig);
                console.log('Backup scheduler updated with new configuration');
            } else {
                backupScheduler.clearSchedule();
                console.log('Backup scheduler cleared');
            }
        } catch (schedulerError) {
            console.error('Error updating backup scheduler:', schedulerError);
            // Don't fail the request if scheduler fails
        }

        return NextResponse.json({
            success: true,
            message: 'تنظیمات بک‌آپ با موفقیت ذخیره شد',
            config: backupConfig,
            nextScheduled: nextScheduled
        });
    } catch (error) {
        console.error('Error saving backup configuration:', error);
        return NextResponse.json(
            { error: 'Failed to save backup configuration' },
            { status: 500 }
        );
    }
}

function validateBackupConfig(config: any) {
    // Validate schedule
    const validSchedules = ['daily', 'weekly', 'monthly'];
    if (config.schedule && !validSchedules.includes(config.schedule)) {
        return { valid: false, error: 'Invalid schedule option' };
    }

    // Validate time format (HH:MM)
    if (config.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(config.time)) {
        return { valid: false, error: 'Invalid time format. Use HH:MM format' };
    }

    // Validate email recipients
    if (config.emailRecipients && Array.isArray(config.emailRecipients)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of config.emailRecipients) {
            if (!emailRegex.test(email)) {
                return { valid: false, error: `Invalid email format: ${email}` };
            }
        }
    }

    // Validate retention days
    if (config.retentionDays && (config.retentionDays < 1 || config.retentionDays > 365)) {
        return { valid: false, error: 'Retention days must be between 1 and 365' };
    }

    return { valid: true };
}

function calculateNextBackup(config: any): string {
    const now = new Date();
    const [hours, minutes] = config.time.split(':').map(Number);

    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, move to the next occurrence
    if (next <= now) {
        switch (config.schedule) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
        }
    }

    return next.toISOString();
}