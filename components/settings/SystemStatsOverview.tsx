'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Building2,
    MessageSquare,
    DollarSign,
    CheckSquare,
    Star,
    Activity,
    Database,
    HardDrive,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { useSystemStats } from '@/hooks/useSystemStats';

export default function SystemStatsOverview() {
    const { stats, loading, error, refresh } = useSystemStats();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">آمار کامل سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">در حال بارگذاری آمار...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">آمار کامل سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">خطا در دریافت آمار سیستم</p>
                        <Button variant="outline" onClick={refresh}>
                            تلاش مجدد
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fa-IR').format(num);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
    };

    const getTaskCompletionRate = () => {
        const total = stats.tasks.total;
        if (total === 0) return 0;
        return Math.round((stats.tasks.completed / total) * 100);
    };

    const getSystemHealthScore = () => {
        const totalOps = stats.system.successfulOperations + stats.system.failedOperations;
        if (totalOps === 0) return 100;
        return Math.round((stats.system.successfulOperations / totalOps) * 100);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="font-vazir">آمار کامل سیستم</CardTitle>
                    <CardDescription>
                        نمای کلی از عملکرد و وضعیت سیستم
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refresh}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Users & Customers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Users className="h-5 w-5 text-blue-500" />
                            <h4 className="font-medium">کاربران</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">کل کاربران</span>
                                <span className="font-medium">{formatNumber(stats.users.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>مدیران: {formatNumber(stats.users.admin)}</span>
                                <span>کاربران عادی: {formatNumber(stats.users.regular)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Building2 className="h-5 w-5 text-green-500" />
                            <h4 className="font-medium">مشتریان</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">کل مشتریان</span>
                                <span className="font-medium">{formatNumber(stats.customers.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>جدید (30 روز): {formatNumber(stats.customers.new30Days)}</span>
                                <span>جدید (7 روز): {formatNumber(stats.customers.new7Days)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales & Revenue */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-medium">فروش و درآمد</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">کل فروش</span>
                                <span className="font-medium">{formatNumber(stats.sales.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">کل درآمد</span>
                                <span className="font-medium">{formatCurrency(stats.sales.totalRevenue)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">فروش (30 روز)</span>
                                <span className="font-medium">{formatNumber(stats.sales.sales30Days)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">درآمد (30 روز)</span>
                                <span className="font-medium">{formatCurrency(stats.sales.revenue30Days)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <CheckSquare className="h-5 w-5 text-purple-500" />
                            <h4 className="font-medium">وضعیت وظایف</h4>
                        </div>
                        <Badge variant="outline">
                            {getTaskCompletionRate()}% تکمیل شده
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <Progress value={getTaskCompletionRate()} className="h-2" />
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                                <div className="font-medium text-green-600">{formatNumber(stats.tasks.completed)}</div>
                                <div className="text-muted-foreground">تکمیل شده</div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-blue-600">{formatNumber(stats.tasks.inProgress)}</div>
                                <div className="text-muted-foreground">در حال انجام</div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-orange-600">{formatNumber(stats.tasks.pending)}</div>
                                <div className="text-muted-foreground">در انتظار</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback & Rating */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-medium">بازخورد مشتریان</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">کل بازخوردها</span>
                                <span className="font-medium">{formatNumber(stats.feedback.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">میانگین امتیاز</span>
                                <div className="flex items-center space-x-1 space-x-reverse">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{stats.feedback.averageRating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">بازخورد (30 روز)</span>
                                <span className="font-medium">{formatNumber(stats.feedback.recent30Days)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Activity className="h-5 w-5 text-red-500" />
                            <h4 className="font-medium">سلامت سیستم</h4>
                        </div>
                        <Badge variant={getSystemHealthScore() > 95 ? "default" : getSystemHealthScore() > 85 ? "secondary" : "destructive"}>
                            {getSystemHealthScore()}% سالم
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <Progress value={getSystemHealthScore()} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span>عملیات موفق</span>
                                <span className="font-medium text-green-600">
                                    {formatNumber(stats.system.successfulOperations)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>عملیات ناموفق</span>
                                <span className="font-medium text-red-600">
                                    {formatNumber(stats.system.failedOperations)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Info */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Database className="h-5 w-5 text-indigo-500" />
                        <h4 className="font-medium">اطلاعات دیتابیس</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span>حجم</span>
                            <span className="font-medium">{stats.database.sizeFormatted}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>تعداد جداول</span>
                            <span className="font-medium">{formatNumber(stats.database.tableCount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>کل رکوردها</span>
                            <span className="font-medium">{formatNumber(stats.database.totalRows)}</span>
                        </div>
                    </div>
                </div>

                {/* Last Update */}
                <div className="text-center pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        آخرین بروزرسانی: {new Date(stats.lastUpdated).toLocaleString('fa-IR')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}