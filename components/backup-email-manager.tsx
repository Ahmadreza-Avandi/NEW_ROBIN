'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BackupStats {
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalSize: number;
    lastBackup?: {
        date: string;
        status: string;
        fileName?: string;
        fileSize?: number;
    };
}

interface SystemStatus {
    backup: { available: boolean; error?: string };
    email: { configured: boolean; error?: string };
    overall: boolean;
}

export default function BackupEmailManager() {
    const [loading, setLoading] = useState(false);
    const [quickEmailLoading, setQuickEmailLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [stats, setStats] = useState<BackupStats | null>(null);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // بارگذاری اولیه داده‌ها
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // بارگذاری آمار
            const statsResponse = await fetch('/api/backup/create?action=stats');
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData.data);
            }

            // بارگذاری وضعیت سیستم
            const statusResponse = await fetch('/api/backup/create?action=test');
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                setSystemStatus(statusData.data);
            }
        } catch (error) {
            console.error('خطا در بارگذاری داده‌ها:', error);
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/backup/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    compress: true,
                    includeData: true,
                    sendEmail: true
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'بک‌آپ با موفقیت ایجاد و ارسال شد!'
                });
                loadInitialData(); // به‌روزرسانی آمار
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'خطا در ایجاد بک‌آپ'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'خطا در ارتباط با سرور'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSend = async () => {
        if (!email.trim()) {
            setMessage({
                type: 'error',
                text: 'لطفاً آدرس ایمیل را وارد کنید'
            });
            return;
        }

        setQuickEmailLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/backup/quick-send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `بک‌آپ با موفقیت به ${email} ارسال شد!`
                });
                setEmail('');
                loadInitialData();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'خطا در ارسال بک‌آپ'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'خطا در ارتباط با سرور'
            });
        } finally {
            setQuickEmailLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* وضعیت سیستم */}
            {systemStatus && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            وضعیت سیستم بک‌آپ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                {systemStatus.backup.available ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>mysqldump</span>
                                <Badge variant={systemStatus.backup.available ? "default" : "destructive"}>
                                    {systemStatus.backup.available ? 'موجود' : 'موجود نیست'}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                {systemStatus.email.configured ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>تنظیمات ایمیل</span>
                                <Badge variant={systemStatus.email.configured ? "default" : "destructive"}>
                                    {systemStatus.email.configured ? 'تنظیم شده' : 'تنظیم نشده'}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                {systemStatus.overall ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span>وضعیت کلی</span>
                                <Badge variant={systemStatus.overall ? "default" : "secondary"}>
                                    {systemStatus.overall ? 'آماده' : 'نیاز به تنظیم'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* پیام‌ها */}
            {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            {/* آمار بک‌آپ‌ها */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle>آمار بک‌آپ‌های اخیر</CardTitle>
                        <CardDescription>آمار 30 روز گذشته</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalBackups}</div>
                                <div className="text-sm text-gray-500">کل بک‌آپ‌ها</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.successfulBackups}</div>
                                <div className="text-sm text-gray-500">موفق</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.failedBackups}</div>
                                <div className="text-sm text-gray-500">ناموفق</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatFileSize(stats.totalSize)}
                                </div>
                                <div className="text-sm text-gray-500">حجم کل</div>
                            </div>
                        </div>

                        {stats.lastBackup && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium">آخرین بک‌آپ:</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(stats.lastBackup.date).toLocaleString('fa-IR')} -
                                    <Badge className="mr-2" variant={stats.lastBackup.status === 'completed' ? 'default' : 'destructive'}>
                                        {stats.lastBackup.status === 'completed' ? 'موفق' : 'ناموفق'}
                                    </Badge>
                                </div>
                                {stats.lastBackup.fileName && (
                                    <div className="text-sm text-gray-600">
                                        فایل: {stats.lastBackup.fileName}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ایجاد بک‌آپ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            ایجاد بک‌آپ کامل
                        </CardTitle>
                        <CardDescription>
                            بک‌آپ کامل دیتابیس و ارسال به تمام گیرندگان تعریف شده
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleCreateBackup}
                            disabled={loading || !systemStatus?.overall}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    در حال ایجاد بک‌آپ...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    ایجاد بک‌آپ
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            ارسال سریع
                        </CardTitle>
                        <CardDescription>
                            ایجاد بک‌آپ و ارسال به ایمیل خاص
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="email"
                            placeholder="آدرس ایمیل گیرنده"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={quickEmailLoading}
                        />
                        <Button
                            onClick={handleQuickSend}
                            disabled={quickEmailLoading || !systemStatus?.overall}
                            className="w-full"
                        >
                            {quickEmailLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    در حال ارسال...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    ارسال سریع
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}