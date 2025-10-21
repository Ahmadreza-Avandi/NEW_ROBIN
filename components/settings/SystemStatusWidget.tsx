'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Activity,
    Cpu,
    HardDrive,
    MemoryStick,
    RefreshCw,
    Wifi,
    Database,
    Mail,
    Shield
} from 'lucide-react';

interface SystemMetrics {
    cpu: {
        usage: number;
        cores: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    disk: {
        used: number;
        total: number;
        percentage: number;
    };
    network: {
        status: 'connected' | 'disconnected';
        latency: number;
    };
    services: {
        database: 'active' | 'inactive';
        email: 'active' | 'inactive';
        backup: 'active' | 'inactive';
    };
}

export default function SystemStatusWidget() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchMetrics = async () => {
        try {
            // Mock data - in real implementation, this would come from actual system monitoring
            const mockMetrics: SystemMetrics = {
                cpu: {
                    usage: Math.floor(Math.random() * 40) + 20, // 20-60%
                    cores: 4
                },
                memory: {
                    used: Math.floor(Math.random() * 4000) + 2000, // 2-6GB
                    total: 8192,
                    percentage: 0
                },
                disk: {
                    used: Math.floor(Math.random() * 50000) + 30000, // 30-80GB
                    total: 100000,
                    percentage: 0
                },
                network: {
                    status: Math.random() > 0.1 ? 'connected' : 'disconnected',
                    latency: Math.floor(Math.random() * 50) + 10 // 10-60ms
                },
                services: {
                    database: Math.random() > 0.05 ? 'active' : 'inactive',
                    email: Math.random() > 0.1 ? 'active' : 'inactive',
                    backup: Math.random() > 0.15 ? 'active' : 'inactive'
                }
            };

            // Calculate percentages
            mockMetrics.memory.percentage = Math.round((mockMetrics.memory.used / mockMetrics.memory.total) * 100);
            mockMetrics.disk.percentage = Math.round((mockMetrics.disk.used / mockMetrics.disk.total) * 100);

            setMetrics(mockMetrics);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching system metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchMetrics, 10000);

        return () => clearInterval(interval);
    }, []);

    const getProgressColor = (percentage: number) => {
        if (percentage < 60) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getServiceIcon = (service: string) => {
        switch (service) {
            case 'database':
                return <Database className="h-4 w-4" />;
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'backup':
                return <Shield className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">وضعیت سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">در حال بارگذاری...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!metrics) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">وضعیت سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">خطا در دریافت اطلاعات سیستم</p>
                        <Button variant="outline" onClick={fetchMetrics} className="mt-2">
                            تلاش مجدد
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-vazir">وضعیت سیستم</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchMetrics}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* System Resources */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">منابع سیستم</h4>

                    {/* CPU */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">پردازنده</span>
                            </div>
                            <span className="text-sm font-medium">{metrics.cpu.usage}%</span>
                        </div>
                        <Progress
                            value={metrics.cpu.usage}
                            className="h-2"
                        />
                    </div>

                    {/* Memory */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">حافظه</span>
                            </div>
                            <span className="text-sm font-medium">
                                {formatBytes(metrics.memory.used * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024)}
                            </span>
                        </div>
                        <Progress
                            value={metrics.memory.percentage}
                            className="h-2"
                        />
                    </div>

                    {/* Disk */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">دیسک</span>
                            </div>
                            <span className="text-sm font-medium">
                                {formatBytes(metrics.disk.used * 1024 * 1024)} / {formatBytes(metrics.disk.total * 1024 * 1024)}
                            </span>
                        </div>
                        <Progress
                            value={metrics.disk.percentage}
                            className="h-2"
                        />
                    </div>
                </div>

                {/* Network Status */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">شبکه</h4>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">وضعیت اتصال</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Badge variant={metrics.network.status === 'connected' ? 'default' : 'destructive'}>
                                {metrics.network.status === 'connected' ? 'متصل' : 'قطع'}
                            </Badge>
                            {metrics.network.status === 'connected' && (
                                <span className="text-xs text-muted-foreground">
                                    {metrics.network.latency}ms
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Services Status */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">سرویس‌ها</h4>
                    <div className="space-y-2">
                        {Object.entries(metrics.services).map(([service, status]) => (
                            <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    {getServiceIcon(service)}
                                    <span className="text-sm">
                                        {service === 'database' ? 'دیتابیس' :
                                            service === 'email' ? 'ایمیل' :
                                                service === 'backup' ? 'بک‌آپ' : service}
                                    </span>
                                </div>
                                <Badge variant={status === 'active' ? 'default' : 'destructive'}>
                                    {status === 'active' ? 'فعال' : 'غیرفعال'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Last Update */}
                <div className="text-center pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                        آخرین بروزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}