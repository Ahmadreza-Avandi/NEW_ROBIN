import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface BackupConfig {
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly';
    time: string;
    emailRecipients: string[];
    retentionDays: number;
    compression: boolean;
}

interface BackupHistory {
    id: string;
    type: 'manual' | 'automatic';
    status: 'in_progress' | 'completed' | 'failed';
    fileName?: string;
    fileSize?: number;
    fileSizeFormatted?: string;
    createdAt: string;
    completedAt?: string;
    errorMessage?: string;
    emailRecipient?: string;
    initiatedBy?: {
        email: string;
        name: string;
    };
    downloadUrl?: string;
}

export function useBackupManagement() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<BackupConfig | null>(null);
    const [history, setHistory] = useState<BackupHistory[]>([]);

    const fetchConfig = useCallback(async () => {
        try {
            const response = await fetch('/api/settings/backup/configure');
            if (!response.ok) throw new Error('Failed to fetch backup config');

            const data = await response.json();
            setConfig(data.config);
        } catch (error) {
            toast.error('خطا در دریافت تنظیمات بک‌آپ');
        }
    }, []);

    const saveConfig = useCallback(async (newConfig: BackupConfig) => {
        try {
            setLoading(true);

            const response = await fetch('/api/settings/backup/configure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newConfig),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save config');
            }

            const data = await response.json();
            setConfig(data.config);
            toast.success('تنظیمات بک‌آپ با موفقیت ذخیره شد');

            return { success: true, data };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'خطا در ذخیره تنظیمات';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const createManualBackup = useCallback(async (emailRecipient?: string) => {
        try {
            setLoading(true);

            const response = await fetch('/api/settings/backup/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailRecipient,
                    includeEmail: !!emailRecipient,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create backup');
            }

            const data = await response.json();
            toast.success('بک‌آپ با موفقیت ایجاد شد');

            // Refresh history after successful backup
            await fetchHistory();

            return { success: true, data };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'خطا در ایجاد بک‌آپ';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async (page = 1, limit = 10, filters?: { status?: string; type?: string }) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.type && { type: filters.type }),
            });

            const response = await fetch(`/api/settings/backup/history?${params}`);
            if (!response.ok) throw new Error('Failed to fetch backup history');

            const data = await response.json();
            setHistory(data.backups);

            return data;
        } catch (error) {
            toast.error('خطا در دریافت تاریخچه بک‌آپ');
            return { backups: [], pagination: null };
        }
    }, []);

    const testEmail = useCallback(async (testEmailAddress: string) => {
        try {
            setLoading(true);

            const response = await fetch('/api/settings/email/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testEmail: testEmailAddress,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send test email');
            }

            toast.success('ایمیل تست با موفقیت ارسال شد');
            return { success: true, data };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'خطا در ارسال ایمیل تست';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        config,
        history,
        fetchConfig,
        saveConfig,
        createManualBackup,
        fetchHistory,
        testEmail,
    };
}