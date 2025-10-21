'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Database,
    HardDrive,
    Clock,
    FileText
} from 'lucide-react';

interface BackupSystemInfo {
    mysqldump: {
        available: boolean;
        version?: string;
        error?: string;
    };
    existingBackups: Array<{
        fileName: string;
        filePath: string;
        size: number;
        sizeFormatted: string;
        createdAt: string;
    }>;
    backupDirectory: string;
    status: 'ready' | 'not_available';
}

export default function BackupSystemStatus() {
    const [systemInfo, setSystemInfo] = useState<BackupSystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSystemInfo = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/settings/backup/test');
            if (!response.ok) {
                throw new Error('Failed to fetch backup system info');
            }

            const data = await response.json();
            setSystemInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">وضعیت سیستم بک‌آپ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin ml-2" />
                        <span>در حال بررسی سیستم بک‌آپ...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !systemInfo) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">وضعیت سیستم بک‌آپ</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            خطا در دریافت اطلاعات سیستم بک‌آپ: {error}
                        </AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={fetchSystemInfo} className="mt-4">
                        <RefreshCw className="h-4 w-4 ml-2" />
                        تلاش مجدد
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const getStatusIcon = () => {
        if (systemInfo.status === 'ready') {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        return <XCircle className="h-5 w-5 text-red-500" />;
    };

    const getStatusBadge = () => {
        if (systemInfo.status === 'ready') {
            return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">آماده</Badge>;
        }
        return <Badge variant="destructive">غیرفعال</Badge>;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="font-vazir">وضعیت سیستم بک‌آپ</CardTitle>
                    <CardDescription>
                        بررسی آمادگی سیستم برای ایجاد بک‌آپ
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchSystemInfo}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">وضعیت کلی سیستم بک‌آپ</p>
                            <p className="text-sm text-muted-foreground">
                                {systemInfo.status === 'ready' ? 'سیستم آماده ایجاد بک‌آپ است' : 'سیستم آماده نیست'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusIcon()}
                        {getStatusBadge()}
                    </div>
                </div>

                {/* mysqldump Status */}
                <div className="space-y-3">
                    <h4 className="font-medium font-vazir">وضعیت mysqldump</h4>

                    {systemInfo.mysqldump.available ? (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p>mysqldump در دسترس است و آماده استفاده</p>
                                    {systemInfo.mysqldump.version && (
                                        <p className="text-sm text-muted-foreground">
                                            نسخه: {systemInfo.mysqldump.version}
                                        </p>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p>mysqldump در دسترس نیست</p>
                                    {systemInfo.mysqldump.error && (
                                        <p className="text-sm">خطا: {systemInfo.mysqldump.error}</p>
                                    )}
                                    <p className="text-sm mt-2">
                                        برای فعال‌سازی بک‌آپ، لطفاً MySQL Client Tools را نصب کنید.
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Existing Backups */}
                <div className="space-y-3">
                    <h4 className="font-medium font-vazir">بک‌آپ‌های موجود</h4>

                    {systemInfo.existingBackups.length > 0 ? (
                        <div className="space-y-2">
                            {systemInfo.existingBackups.map((backup, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{backup.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(backup.createdAt).toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{backup.sizeFormatted}</p>
                                    </div>
                                </div>
                            ))}

                            {systemInfo.existingBackups.length >= 5 && (
                                <p className="text-xs text-muted-foreground text-center">
                                    و {systemInfo.existingBackups.length - 5} بک‌آپ دیگر...
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <HardDrive className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                هنوز بک‌آپی ایجاد نشده است
                            </p>
                        </div>
                    )}
                </div>

                {/* Backup Directory Info */}
                <div className="text-center pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        مسیر ذخیره بک‌آپ‌ها: {systemInfo.backupDirectory}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}