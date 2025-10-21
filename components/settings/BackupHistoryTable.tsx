'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Download,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

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

interface BackupHistoryTableProps {
    onClose?: () => void;
}

export default function BackupHistoryTable({ onClose }: BackupHistoryTableProps) {
    const [backups, setBackups] = useState<BackupHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBackups = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(statusFilter && { status: statusFilter }),
                ...(typeFilter && { type: typeFilter }),
            });

            const response = await fetch(`/api/settings/backup/history?${params}`);
            if (!response.ok) throw new Error('Failed to fetch backup history');

            const data = await response.json();
            setBackups(data.backups);
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.page);
        } catch (error) {
            console.error('Error fetching backup history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups(1);
    }, [statusFilter, typeFilter]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'in_progress':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">تکمیل شده</Badge>;
            case 'failed':
                return <Badge variant="destructive">ناموفق</Badge>;
            case 'in_progress':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">در حال انجام</Badge>;
            default:
                return <Badge variant="secondary">نامشخص</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        return type === 'manual' ?
            <Badge variant="outline">دستی</Badge> :
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">خودکار</Badge>;
    };

    const filteredBackups = backups.filter(backup =>
        backup.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backup.initiatedBy?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-vazir">تاریخچه کامل بک‌آپ</CardTitle>
                        <CardDescription>
                            مشاهده و مدیریت تمام بک‌آپ‌های انجام شده
                        </CardDescription>
                    </div>
                    {onClose && (
                        <Button variant="outline" onClick={onClose}>
                            بستن
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="جستجو در نام فایل یا کاربر..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">همه وضعیت‌ها</SelectItem>
                            <SelectItem value="completed">تکمیل شده</SelectItem>
                            <SelectItem value="failed">ناموفق</SelectItem>
                            <SelectItem value="in_progress">در حال انجام</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="نوع" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">همه انواع</SelectItem>
                            <SelectItem value="manual">دستی</SelectItem>
                            <SelectItem value="automatic">خودکار</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">وضعیت</TableHead>
                                <TableHead className="text-right">نوع</TableHead>
                                <TableHead className="text-right">نام فایل</TableHead>
                                <TableHead className="text-right">حجم</TableHead>
                                <TableHead className="text-right">تاریخ ایجاد</TableHead>
                                <TableHead className="text-right">کاربر</TableHead>
                                <TableHead className="text-right">عملیات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        در حال بارگذاری...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBackups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">هیچ بک‌آپی یافت نشد</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBackups.map((backup) => (
                                    <TableRow key={backup.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {getStatusIcon(backup.status)}
                                                {getStatusBadge(backup.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getTypeBadge(backup.type)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {backup.fileName || 'نامشخص'}
                                                </p>
                                                {backup.errorMessage && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        {backup.errorMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {backup.fileSizeFormatted || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">
                                                    {new Date(backup.createdAt).toLocaleDateString('fa-IR')}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(backup.createdAt).toLocaleTimeString('fa-IR')}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {backup.initiatedBy?.name || 'نامشخص'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {backup.initiatedBy?.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {backup.downloadUrl && backup.status === 'completed' && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <a href={backup.downloadUrl} download>
                                                            <Download className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {backup.emailRecipient && (
                                                    <Badge variant="outline" className="text-xs">
                                                        ایمیل شده
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            صفحه {currentPage} از {totalPages}
                        </p>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchBackups(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronRight className="h-4 w-4" />
                                قبلی
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchBackups(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                            >
                                بعدی
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}