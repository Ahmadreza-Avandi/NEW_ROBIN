import { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
    emailService: {
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
        message: string;
        details?: any;
    };
    database: {
        status: 'connected' | 'disconnected' | 'error';
        lastCheck: string;
        message: string;
        details?: any;
    };
    backupService: {
        status: 'enabled' | 'disabled' | 'error';
        lastCheck: string;
        message: string;
        details?: any;
    };
    lastUpdated: string;
}

export function useSystemStatus() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/settings/status');
            if (!response.ok) {
                throw new Error('Failed to fetch system status');
            }

            const data = await response.json();
            setStatus(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStatus, 30000);

        return () => clearInterval(interval);
    }, [fetchStatus]);

    const refresh = useCallback(() => {
        fetchStatus();
    }, [fetchStatus]);

    return {
        status,
        loading,
        error,
        refresh
    };
}