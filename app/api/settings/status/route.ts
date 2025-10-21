import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        // Check email service status
        const emailStatus = await checkEmailServiceStatus();

        // Check database status
        const databaseStatus = await checkDatabaseStatus();

        // Check backup service status
        const backupStatus = await checkBackupServiceStatus();

        const systemStatus = {
            emailService: emailStatus,
            database: databaseStatus,
            backupService: backupStatus,
            lastUpdated: new Date().toISOString()
        };

        return NextResponse.json(systemStatus);
    } catch (error) {
        console.error('Error fetching system status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system status' },
            { status: 500 }
        );
    }
}

async function checkEmailServiceStatus() {
    try {
        // Check if email service is configured and working
        const emailConfig = await executeQuery(
            'SELECT setting_value FROM system_settings WHERE setting_key = ?',
            ['email_config']
        );

        const config = emailConfig[0]?.setting_value || {};
        const isConfigured = config.smtp_host && config.smtp_user;

        // Get recent email logs
        const recentEmailLogs = await executeQuery(
            `SELECT COUNT(*) as count FROM system_logs 
       WHERE log_type = 'email_test' AND status = 'success' 
       AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`
        );

        const recentSuccessfulEmails = recentEmailLogs[0]?.count || 0;

        return {
            status: isConfigured ? 'active' : 'inactive',
            lastCheck: new Date().toISOString(),
            message: isConfigured ? 'سرویس ایمیل فعال و آماده' : 'سرویس ایمیل پیکربندی نشده',
            details: {
                smtpConfigured: isConfigured,
                recentSuccessfulEmails: recentSuccessfulEmails,
                lastEmailTest: null // Will be updated when we have actual test data
            }
        };
    } catch (error) {
        return {
            status: 'inactive',
            lastCheck: new Date().toISOString(),
            message: 'خطا در اتصال به سرویس ایمیل',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function checkDatabaseStatus() {
    try {
        // Test database connection
        const connection = await pool.getConnection();
        connection.release();

        // Get database size
        const sizeResult = await executeQuery(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = 'crm_system'
    `);

        const sizeMB = sizeResult[0]?.size_mb || 0;
        const sizeFormatted = sizeMB > 1024 ? `${(sizeMB / 1024).toFixed(2)} GB` : `${sizeMB.toFixed(2)} MB`;

        // Get table count and row count
        const tableStats = await executeQuery(`
      SELECT 
        COUNT(*) as table_count,
        SUM(TABLE_ROWS) as total_rows
      FROM information_schema.tables 
      WHERE table_schema = 'crm_system'
    `);

        // Get user and customer counts
        const userCount = await executeQuery('SELECT COUNT(*) as count FROM users');
        const customerCount = await executeQuery('SELECT COUNT(*) as count FROM customers');

        // Get last backup info
        const lastBackup = await executeQuery(
            'SELECT created_at FROM backup_history WHERE status = "completed" ORDER BY created_at DESC LIMIT 1'
        );

        // Get connection count
        const connections = await executeQuery(`
      SELECT COUNT(*) as active_connections
      FROM information_schema.processlist 
      WHERE db = 'crm_system'
    `);

        return {
            status: 'connected',
            lastCheck: new Date().toISOString(),
            message: 'اتصال دیتابیس برقرار است',
            details: {
                size: sizeFormatted,
                tableCount: tableStats[0]?.table_count || 0,
                totalRows: tableStats[0]?.total_rows || 0,
                userCount: userCount[0]?.count || 0,
                customerCount: customerCount[0]?.count || 0,
                activeConnections: connections[0]?.active_connections || 0,
                lastBackup: lastBackup[0]?.created_at || null,
                connectionPool: 'healthy'
            }
        };
    } catch (error) {
        return {
            status: 'disconnected',
            lastCheck: new Date().toISOString(),
            message: 'خطا در اتصال به دیتابیس',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function checkBackupServiceStatus() {
    try {
        // Check backup configuration
        const backupConfig = await executeQuery(
            'SELECT setting_value FROM system_settings WHERE setting_key = ?',
            ['backup_config']
        );

        const config = backupConfig[0]?.setting_value || {};
        const isEnabled = config.enabled || false;

        // Get backup statistics
        const backupStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_backups,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_backups,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_backups
      FROM backup_history
    `);

        // Get next scheduled backup
        const nextScheduled = calculateNextBackup(config.schedule || 'daily', config.time || '02:00');

        // Get last backup run
        const lastRun = await executeQuery(
            'SELECT created_at, status, file_size FROM backup_history ORDER BY created_at DESC LIMIT 1'
        );

        const stats = backupStats[0] || { total_backups: 0, successful_backups: 0, failed_backups: 0 };

        return {
            status: isEnabled ? 'enabled' : 'disabled',
            lastCheck: new Date().toISOString(),
            message: isEnabled ? 'بک‌آپ خودکار فعال است' : 'بک‌آپ خودکار غیرفعال است',
            details: {
                enabled: isEnabled,
                schedule: config.schedule || 'daily',
                nextScheduled: isEnabled ? nextScheduled : null,
                lastRun: lastRun[0]?.created_at || null,
                lastRunStatus: lastRun[0]?.status || null,
                lastRunSize: lastRun[0]?.file_size || null,
                totalBackups: stats.total_backups,
                successfulBackups: stats.successful_backups,
                failedBackups: stats.failed_backups
            }
        };
    } catch (error) {
        return {
            status: 'error',
            lastCheck: new Date().toISOString(),
            message: 'خطا در بررسی وضعیت بک‌آپ',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

function calculateNextBackup(schedule: string, time: string): string {
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
                next.setMonth(next.getMonth() + 1);
                break;
            default:
                next.setDate(next.getDate() + 1);
        }
    }

    return next.toISOString();
}