'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
    FileText,
    TrendingUp,
    Users,
    HardDrive,
    Calendar,
    BarChart3,
    PieChart,
    Loader2
} from 'lucide-react';
import DocumentNameGenerator from '@/components/documents/DocumentNameGenerator';

interface DocumentStats {
    document_type: string;
    status: string;
    document_count: number;
    total_size_mb: number;
    avg_size_mb: number;
}

interface ContentStats {
    content_type: string;
    count: number;
    total_size_mb: number;
}

interface AccessStats {
    access_level: string;
    count: number;
}

interface RecentStats {
    date: string;
    count: number;
}

export default function DocumentStatsPage() {
    const [stats, setStats] = useState<DocumentStats[]>([]);
    const [contentStats, setContentStats] = useState<ContentStats[]>([]);
    const [accessStats, setAccessStats] = useState<AccessStats[]>([]);
    const [recentStats, setRecentStats] = useState<RecentStats[]>([]);
    const [loading, setLoading] = useState(true);

    const { toast } = useToast();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch('/api/tenant/documents/stats', {
                headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);
                setContentStats(data.contentStats);
                setAccessStats(data.accessStats);
                setRecentStats(data.recentStats);
            } else {
                toast({
                    title: "خطا",
                    description: data.error || 'خطا در بارگذاری آمار',
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: 'خطا در اتصال به سرور',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const getDocumentTypeText = (type: string) => {
        const types = {
            contract: 'قرارداد (PDF)',
            presentation: 'ارائه (تصاویر)',
            report: 'گزارش (متن)',
            invoice: 'فاکتور (اکسل)',
            other: 'سایر'
        };
        return types[type as keyof typeof types] || type;
    };

    const getStatusText = (status: string) => {
        const statuses = {
            draft: 'پیش‌نویس',
            reviewed: 'بازبینی‌شده',
            final: 'نهایی',
            archived: 'بایگانی‌شده',
            cancelled: 'لغو شده'
        };
        return statuses[status as keyof typeof statuses] || status;
    };

    const getContentTypeText = (type: string) => {
        const types = {
            document: 'سند',
            photo: 'عکس',
            video: 'ویدیو',
            audio: 'صوت'
        };
        return types[type as keyof typeof types] || type;
    };

    const getAccessLevelText = (level: string) => {
        const levels = {
            public: 'عمومی',
            private: 'خصوصی',
            restricted: 'محدود',
            confidential: 'محرمانه'
        };
        return levels[level as keyof typeof levels] || level;
    };

    const totalDocuments = stats.reduce((sum, stat) => sum + stat.document_count, 0);
    const totalSize = stats.reduce((sum, stat) => sum + stat.total_size_mb, 0);

    if (loading) {
        return (
            <PageWrapper title="آمار اسناد" description="نمایش آمار و گزارش‌های اسناد">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="mr-3 font-vazir">در حال بارگذاری آمار...</span>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="آمار اسناد" description="نمایش آمار و گزارش‌های اسناد">
            {/* آمار کلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="mr-4">
                                <p className="text-sm font-medium text-muted-foreground font-vazir">کل اسناد</p>
                                <p className="text-2xl font-bold font-vazir">{totalDocuments.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <HardDrive className="h-8 w-8 text-green-600" />
                            <div className="mr-4">
                                <p className="text-sm font-medium text-muted-foreground font-vazir">حجم کل</p>
                                <p className="text-2xl font-bold font-vazir">{totalSize.toFixed(1)} MB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                            <div className="mr-4">
                                <p className="text-sm font-medium text-muted-foreground font-vazir">انواع مختلف</p>
                                <p className="text-2xl font-bold font-vazir">{contentStats.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                            <div className="mr-4">
                                <p className="text-sm font-medium text-muted-foreground font-vazir">میانگین حجم</p>
                                <p className="text-2xl font-bold font-vazir">
                                    {totalDocuments > 0 ? (totalSize / totalDocuments).toFixed(1) : '0'} MB
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* آمار بر اساس نوع سند */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-vazir">آمار بر اساس نوع سند</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="font-vazir">
                                            {getDocumentTypeText(stat.document_type)}
                                        </Badge>
                                        <Badge variant="secondary" className="font-vazir">
                                            {getStatusText(stat.status)}
                                        </Badge>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium font-vazir">{stat.document_count} سند</p>
                                        <p className="text-sm text-muted-foreground font-vazir">
                                            {stat.total_size_mb.toFixed(1)} MB
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* آمار بر اساس نوع محتوا */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-vazir">آمار بر اساس نوع محتوا</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {contentStats.map((stat, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <PieChart className="h-5 w-5 text-primary" />
                                        <span className="font-vazir">{getContentTypeText(stat.content_type)}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium font-vazir">{stat.count} فایل</p>
                                        <p className="text-sm text-muted-foreground font-vazir">
                                            {stat.total_size_mb.toFixed(1)} MB
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* آمار سطح دسترسی */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-vazir">آمار سطح دسترسی</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {accessStats.map((stat, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="font-vazir">{getAccessLevelText(stat.access_level)}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium font-vazir">{stat.count} سند</p>
                                        <p className="text-sm text-muted-foreground font-vazir">
                                            {((stat.count / totalDocuments) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* آمار اسناد اخیر */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-vazir">اسناد اخیر (30 روز گذشته)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {recentStats.map((stat, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="font-vazir">{stat.date}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium font-vazir">{stat.count} سند</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* تولیدکننده نام فایل */}
            <DocumentNameGenerator />
        </PageWrapper>
    );
}