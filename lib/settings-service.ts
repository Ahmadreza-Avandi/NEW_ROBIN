import { executeQuery, executeSingle } from './database';

export interface SystemSettings {
    backup_config: {
        enabled: boolean;
        schedule: 'daily' | 'weekly' | 'monthly';
        time: string;
        emailRecipients: string[];
        retentionDays: number;
        compression: boolean;
    };
    email_config: {
        enabled: boolean;
        smtp_host: string;
        smtp_port: number;
        smtp_secure: boolean;
        smtp_user: string;
        smtp_password: string;
    };
    system_monitoring: {
        enabled: boolean;
        checkInterval: number;
        alertThresholds: {
            diskSpace: number;
            memory: number;
            cpu: number;
        };
    };
}

export class SettingsService {
    async getSetting<K extends keyof SystemSettings>(
        key: K
    ): Promise<SystemSettings[K] | null> {
        try {
            const result = await executeQuery(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                [key]
            );

            if (result.length === 0) {
                return null;
            }

            return result[0].setting_value as SystemSettings[K];
        } catch (error) {
            console.error(`Error getting setting ${key}:`, error);
            return null;
        }
    }

    async setSetting<K extends keyof SystemSettings>(
        key: K,
        value: SystemSettings[K],
        updatedBy?: number
    ): Promise<boolean> {
        try {
            await executeSingle(
                `INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 setting_value = VALUES(setting_value), 
                 updated_by = VALUES(updated_by),
                 updated_at = VALUES(updated_at)`,
                [key, JSON.stringify(value), updatedBy || null, new Date()]
            );

            // Log the setting change
            await executeSingle(
                'INSERT INTO system_logs (log_type, status, details, user_id) VALUES (?, ?, ?, ?)',
                [
                    'setting_updated',
                    'success',
                    JSON.stringify({
                        settingKey: key,
                        newValue: value,
                        timestamp: new Date().toISOString()
                    }),
                    updatedBy || null
                ]
            );

            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            return false;
        }
    }

    async getAllSettings(): Promise<Partial<SystemSettings>> {
        try {
            const result = await executeQuery(
                'SELECT setting_key, setting_value FROM system_settings'
            );

            const settings: Partial<SystemSettings> = {};

            for (const row of result) {
                settings[row.setting_key as keyof SystemSettings] = row.setting_value;
            }

            return settings;
        } catch (error) {
            console.error('Error getting all settings:', error);
            return {};
        }
    }

    async getBackupConfig() {
        const config = await this.getSetting('backup_config');
        return config || {
            enabled: false,
            schedule: 'daily' as const,
            time: '02:00',
            emailRecipients: [],
            retentionDays: 30,
            compression: true
        };
    }

    async setBackupConfig(config: SystemSettings['backup_config'], updatedBy?: number) {
        return await this.setSetting('backup_config', config, updatedBy);
    }

    async getEmailConfig() {
        const config = await this.getSetting('email_config');
        return config || {
            enabled: true,
            smtp_host: '',
            smtp_port: 587,
            smtp_secure: true,
            smtp_user: '',
            smtp_password: ''
        };
    }

    async setEmailConfig(config: SystemSettings['email_config'], updatedBy?: number) {
        return await this.setSetting('email_config', config, updatedBy);
    }

    async validateEmailConfig(config: SystemSettings['email_config']): Promise<{
        valid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        if (!config.smtp_host) {
            errors.push('SMTP host is required');
        }

        if (!config.smtp_port || config.smtp_port < 1 || config.smtp_port > 65535) {
            errors.push('Valid SMTP port is required (1-65535)');
        }

        if (!config.smtp_user) {
            errors.push('SMTP user is required');
        }

        if (!config.smtp_password) {
            errors.push('SMTP password is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async validateBackupConfig(config: SystemSettings['backup_config']): Promise<{
        valid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        const validSchedules = ['daily', 'weekly', 'monthly'];
        if (!validSchedules.includes(config.schedule)) {
            errors.push('Invalid schedule option');
        }

        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(config.time)) {
            errors.push('Invalid time format. Use HH:MM format');
        }

        if (config.emailRecipients && Array.isArray(config.emailRecipients)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            for (const email of config.emailRecipients) {
                if (!emailRegex.test(email)) {
                    errors.push(`Invalid email format: ${email}`);
                }
            }
        }

        if (config.retentionDays < 1 || config.retentionDays > 365) {
            errors.push('Retention days must be between 1 and 365');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async getSystemStatus() {
        try {
            const settings = await this.getAllSettings();

            // Check backup configuration
            const backupConfig = settings.backup_config;
            const backupStatus = {
                configured: !!backupConfig,
                enabled: backupConfig?.enabled || false,
                schedule: backupConfig?.schedule || 'daily',
                emailRecipients: backupConfig?.emailRecipients?.length || 0
            };

            // Check email configuration
            const emailConfig = settings.email_config;
            const emailStatus = {
                configured: !!(emailConfig?.smtp_host && emailConfig?.smtp_user),
                enabled: emailConfig?.enabled || false
            };

            // Get recent backup history
            const recentBackups = await executeQuery(
                `SELECT type, status, created_at, completed_at, file_size 
                 FROM backup_history 
                 ORDER BY created_at DESC 
                 LIMIT 5`
            );

            return {
                backup: backupStatus,
                email: emailStatus,
                recentBackups: recentBackups.map(backup => ({
                    type: backup.type,
                    status: backup.status,
                    createdAt: backup.created_at,
                    completedAt: backup.completed_at,
                    fileSize: backup.file_size
                }))
            };
        } catch (error) {
            console.error('Error getting system status:', error);
            return {
                backup: { configured: false, enabled: false, schedule: 'daily', emailRecipients: 0 },
                email: { configured: false, enabled: false },
                recentBackups: []
            };
        }
    }
}

export const settingsService = new SettingsService();