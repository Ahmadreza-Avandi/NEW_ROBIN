import { useState, useEffect, useCallback } from 'react';

interface SystemStats {
    users: {
        total: number;
        admin: number;
        manager: number;
        regular: number;
    };
    customers: {
        total: number;
        new30Days: number;
        new7Days: number;
    };
    interactions: {
        total: number;
        last30Days: number;
        last7Days: number;
    };
    sales: {
        total: number;
        totalRevenue: number;
        sales30Days: number;
        revenue30Days: number;
    };
    tasks: {
        total: number;
        completed: number;
        pending: number;
        inProgress: number;
    };
    feedback: {
        total: number;
        averageRating: number;
        recent30Days: number;
    };
    system: {
        totalLogs: number;
        logs24Hours: number;
        successfulOperations: number;
        failedOperations: number;
    };
    database: {
        tableCount: number;
        sizeMB: number;
        totalRows: number;
        sizeFormatted: string;
    };
    backups: {
        total: number;
        successful: number;
        failed: number;
        lastBackupDate: string | null;
        totalBackupSize: number;
    };
    lastUpdated: string;
}

export function useSystemStats() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/settings/system-stats');
            if (!response.ok) {
                throw new Error('Failed to fetch system statistics');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchStats]);

    const refresh = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refresh
    };
}