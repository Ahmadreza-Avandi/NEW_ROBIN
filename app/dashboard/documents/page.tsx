'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import moment from 'moment-jalaali';

// Configure moment-jalaali for Persian calendar
moment.loadPersian({ 
    dialect: 'persian-modern',
    usePersianDigits: true
});
moment.locale('fa');
import {
    Upload,
    Search,
    Filter,
    Download,
    Share,
    Eye,
    Edit,
    Trash2,
    FileText,
    Calendar,
    User,
    FolderOpen,
    Mail,
    Loader2
} from 'lucide-react';
import UploadModal from '@/components/documents/UploadModal';
import ShareModal from '@/components/documents/ShareModal';
import DocumentEmailModal from '@/components/documents/DocumentEmailModal';

interface Document {
    id: string;
    title: string;
    description?: string;
    document_type: string;
    content_type: string;
    status: string;
    format: string;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    version: string;
    is_public: boolean;
    access_level: string;
    tags?: string;
    download_count: number;
    persian_date: string;
    uploaded_by_name: string;
    created_at: string;
}

interface DocumentStats {
    document_type: string;
    status: string;
    document_count: number;
    total_size_mb: number;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [stats, setStats] = useState<DocumentStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocumentType, setSelectedDocumentType] = useState('all');
    const [selectedContentType, setSelectedContentType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedAccessLevel, setSelectedAccessLevel] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { toast } = useToast();

    // بارگذاری اسناد
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(searchTerm && { search: searchTerm }),
                ...(selectedDocumentType && selectedDocumentType !== 'all' && { documentType: selectedDocumentType }),
                ...(selectedContentType && selectedContentType !== 'all' && { contentType: selectedContentType }),
                ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
                ...(selectedAccessLevel && selectedAccessLevel !== 'all' && { accessLevel: selectedAccessLevel }),
                ...(dateFrom && { dateFrom: dateFrom }),
                ...(dateTo && { dateTo: dateTo })
            });

            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/documents?${params}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.ok) {
                setDocuments(data.documents);
                setTotalPages(data.pagination.totalPages);
            } else {
                toast({
                    title: "خطا",
                    description: data.error || 'خطا در بارگذاری اسناد',
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

    // بارگذاری آمار اسناد
    const fetchStats = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch('/api/documents/stats', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('خطا در بارگذاری آمار:', error);
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchStats();
    }, [currentPage, searchTerm, selectedDocumentType, selectedContentType, selectedStatus, selectedAccessLevel, dateFrom, dateTo]);

    // دانلود سند
    const handleDownload = async (documentId: string, filename: string) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/documents/${documentId}/download`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast({
                    title: "موفق",
                    description: "فایل با موفقیت دانلود شد"
                });
            } else {
                toast({
                    title: "خطا",
                    description: "خطا در دانلود فایل",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: "خطا در دانلود فایل",
                variant: "destructive"
            });
        }
    };

    // حذف سند
    const handleDelete = async (documentId: string) => {
        if (!confirm('آیا از حذف این سند اطمینان دارید؟')) return;

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفق",
                    description: "سند با موفقیت حذف شد"
                });
                fetchDocuments();
                fetchStats();
            } else {
                toast({
                    title: "خطا",
                    description: data.error || "خطا در حذف سند",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: "خطا",
                description: "خطا در حذف سند",
                variant: "destructive"
            });
        }
    };

    // اشتراک‌گذاری سند
    const handleShare = (document: Document) => {
        setSelectedDocument(document);
        setShowShareModal(true);
    };

    // ارسال سند از طریق ایمیل
    const handleEmailSend = (document: Document) => {
        setSelectedDocument(document);
        setShowEmailModal(true);
    };

    // ارسال ایمیل سند (تابع گلوبال)
    const sendDocumentByEmail = async (
        documentId: string,
        emails: string[],
        options?: {
            subject?: string;
            message?: string;
            includeAttachment?: boolean;
        }
    ) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/documents/${documentId}/send-email`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emails,
                    subject: options?.subject,
                    message: options?.message,
                    includeAttachment: options?.includeAttachment ?? true
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفق",
                    description: data.totalFailed > 0
                        ? `سند به ${data.totalSent} نفر ارسال شد، ${data.totalFailed} نفر ناموفق`
                        : `سند با موفقیت به ${data.totalSent} نفر ارسال شد`
                });
                return {
                    success: true,
                    sentEmails: data.sentEmails,
                    failedEmails: data.failedEmails
                };
            } else {
                toast({
                    title: "خطا",
                    description: data.error || "خطا در ارسال سند",
                    variant: "destructive"
                });
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: "خطا در ارسال سند",
                variant: "destructive"
            });
            return {
                success: false,
                error: 'خطا در اتصال به سرور'
            };
        }
    };

    // تابع گلوبال برای ارسال ایمیل (قابل استفاده در سایر صفحات)
    if (typeof window !== 'undefined') {
        (window as any).sendDocumentByEmail = sendDocumentByEmail;
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentTypeText = (type: string) => {
        const types = {
            contract: 'قرارداد',
            proposal: 'پیشنهاد',
            invoice: 'فاکتور',
            plan: 'برنامه',
            report: 'گزارش',
            presentation: 'ارائه',
            agreement: 'توافق‌نامه',
            specification: 'مشخصات',
            manual: 'راهنما',
            other: 'سایر'
        };
        return types[type as keyof typeof types] || type;
    };

    const getStatusText = (status: string) => {
        const statuses = {
            active: 'فعال',
            archived: 'بایگانی‌شده',
            deleted: 'حذف شده'
        };
        return statuses[status as keyof typeof statuses] || status;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            archived: 'bg-blue-100 text-blue-800',
            deleted: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

    const getAccessLevelColor = (level: string) => {
        const colors = {
            public: 'bg-green-100 text-green-800',
            private: 'bg-blue-100 text-blue-800',
            restricted: 'bg-orange-100 text-orange-800',
            confidential: 'bg-red-100 text-red-800'
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDocumentType('all');
        setSelectedContentType('all');
        setSelectedStatus('all');
        setSelectedAccessLevel('all');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    return (
        <PageWrapper
            title="مدیریت اسناد"
            description="آپلود، مدیریت و اشتراک‌گذاری اسناد"
            actions={
                <Button onClick={() => setShowUploadModal(true)} className="font-vazir">
                    <Upload className="h-4 w-4 ml-2" />
                    آپلود سند جدید
                </Button>
            }
        >
            {/* فیلترها */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">فیلترها</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* جستجو */}
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="جستجو در اسناد..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 font-vazir"
                            />
                        </div>

                        {/* نوع سند */}
                        <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="نوع سند" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه انواع</SelectItem>
                                <SelectItem value="contract" className="font-vazir">قرارداد (PDF)</SelectItem>
                                <SelectItem value="presentation" className="font-vazir">ارائه (تصاویر)</SelectItem>
                                <SelectItem value="report" className="font-vazir">گزارش (متن)</SelectItem>
                                <SelectItem value="invoice" className="font-vazir">فاکتور (اکسل)</SelectItem>
                                <SelectItem value="other" className="font-vazir">سایر</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* نوع محتوا */}
                        <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="نوع محتوا" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه محتواها</SelectItem>
                                <SelectItem value="document" className="font-vazir">سند</SelectItem>
                                <SelectItem value="photo" className="font-vazir">عکس</SelectItem>
                                <SelectItem value="video" className="font-vazir">ویدیو</SelectItem>
                                <SelectItem value="audio" className="font-vazir">صوت</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* وضعیت */}
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه وضعیت‌ها</SelectItem>
                                <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                                <SelectItem value="archived" className="font-vazir">بایگانی‌شده</SelectItem>
                                <SelectItem value="deleted" className="font-vazir">حذف شده</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* سطح دسترسی */}
                        <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="سطح دسترسی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه سطوح</SelectItem>
                                <SelectItem value="public" className="font-vazir">عمومی</SelectItem>
                                <SelectItem value="private" className="font-vazir">خصوصی</SelectItem>
                                <SelectItem value="restricted" className="font-vazir">محدود</SelectItem>
                                <SelectItem value="confidential" className="font-vazir">محرمانه</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* پاک کردن فیلترها */}
                        <Button onClick={clearFilters} variant="outline" className="font-vazir">
                            <Filter className="h-4 w-4 ml-2" />
                            پاک کردن فیلترها
                        </Button>
                    </div>

                    {/* فیلترهای تاریخ فارسی */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="text-sm font-medium font-vazir mb-2 block">از تاریخ</label>
                            <PersianDatePicker
                                value={dateFrom ? moment(dateFrom).format('jYYYY/jMM/jDD') : ''}
                                onChange={(date) => {
                                    if (date) {
                                        const gregorianDate = moment(date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                        setDateFrom(gregorianDate);
                                    } else {
                                        setDateFrom('');
                                    }
                                }}
                                placeholder="انتخاب تاریخ شروع"
                                className="font-vazir"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium font-vazir mb-2 block">تا تاریخ</label>
                            <PersianDatePicker
                                value={dateTo ? moment(dateTo).format('jYYYY/jMM/jDD') : ''}
                                onChange={(date) => {
                                    if (date) {
                                        const gregorianDate = moment(date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                        setDateTo(gregorianDate);
                                    } else {
                                        setDateTo('');
                                    }
                                }}
                                placeholder="انتخاب تاریخ پایان"
                                className="font-vazir"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* لیست اسناد */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-vazir">اسناد ({documents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="mr-2 font-vazir">در حال بارگذاری...</span>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium font-vazir mb-2">هیچ سندی یافت نشد</h3>
                            <p className="text-muted-foreground font-vazir mb-4">اولین سند خود را آپلود کنید</p>
                            <Button onClick={() => setShowUploadModal(true)} className="font-vazir">
                                <Upload className="h-4 w-4 ml-2" />
                                آپلود سند جدید
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* نمایش دسکتاپ */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-right py-3 px-4 font-vazir">سند</th>
                                            <th className="text-right py-3 px-4 font-vazir">نوع</th>
                                            <th className="text-right py-3 px-4 font-vazir">وضعیت</th>
                                            <th className="text-right py-3 px-4 font-vazir">سطح دسترسی</th>
                                            <th className="text-right py-3 px-4 font-vazir">حجم</th>
                                            <th className="text-right py-3 px-4 font-vazir">نسخه</th>
                                            <th className="text-right py-3 px-4 font-vazir">آپلودکننده</th>
                                            <th className="text-right py-3 px-4 font-vazir">تاریخ</th>
                                            <th className="text-right py-3 px-4 font-vazir">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((document) => (
                                            <tr key={document.id} className="border-b hover:bg-muted/50">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-8 w-8 text-primary" />
                                                        <div>
                                                            <div className="font-medium font-vazir">{document.title}</div>
                                                            <div className="text-sm text-muted-foreground font-vazir">
                                                                {document.original_name}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Download className="h-3 w-3" />
                                                                    {document.download_count}
                                                                </span>
                                                                <span className="text-xs">
                                                                    {document.format.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant="outline" className="font-vazir">
                                                        {getDocumentTypeText(document.document_type)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={`font-vazir ${getStatusColor(document.status)}`}>
                                                        {getStatusText(document.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={`font-vazir ${getAccessLevelColor(document.access_level)}`}>
                                                        {getAccessLevelText(document.access_level)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 font-vazir">
                                                    {formatFileSize(document.file_size)}
                                                </td>
                                                <td className="py-4 px-4 font-vazir">
                                                    v{document.version}
                                                </td>
                                                <td className="py-4 px-4 font-vazir">
                                                    {document.uploaded_by_name}
                                                </td>
                                                <td className="py-4 px-4 font-vazir">
                                                    {document.persian_date}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDownload(document.id, document.original_name)}
                                                            title="دانلود"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleShare(document)}
                                                            title="اشتراک‌گذاری"
                                                        >
                                                            <Share className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEmailSend(document)}
                                                            title="ارسال ایمیل"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(document.id)}
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* نمایش موبایل */}
                            <div className="md:hidden space-y-4">
                                {documents.map((document) => (
                                    <Card key={document.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium font-vazir truncate">{document.title}</h3>
                                                    <p className="text-sm text-muted-foreground font-vazir truncate">
                                                        {document.original_name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Download className="h-3 w-3" />
                                                            {document.download_count}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {document.uploaded_by_name}
                                                        </span>
                                                        <span>v{document.version}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant="outline" className="font-vazir text-xs">
                                                                {getDocumentTypeText(document.document_type)}
                                                            </Badge>
                                                            <Badge className={`font-vazir text-xs ${getStatusColor(document.status)}`}>
                                                                {getStatusText(document.status)}
                                                            </Badge>
                                                            <Badge className={`font-vazir text-xs ${getAccessLevelColor(document.access_level)}`}>
                                                                {getAccessLevelText(document.access_level)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDownload(document.id, document.original_filename)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleShare(document)}
                                                            >
                                                                <Share className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEmailSend(document)}
                                                            >
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(document.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-2 font-vazir">
                                                        {formatFileSize(document.file_size)} • {document.persian_date}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* صفحه‌بندی */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-muted-foreground font-vazir">
                                        صفحه {currentPage} از {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="font-vazir"
                                        >
                                            قبلی
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="font-vazir"
                                        >
                                            بعدی
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* مودال‌ها */}
            {showUploadModal && (
                <UploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchDocuments();
                    }}
                />
            )}

            {showShareModal && selectedDocument && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => {
                        setShowShareModal(false);
                        setSelectedDocument(null);
                    }}
                    document={selectedDocument}
                    onSuccess={() => {
                        setShowShareModal(false);
                        setSelectedDocument(null);
                        fetchDocuments();
                    }}
                />
            )}

            {showEmailModal && selectedDocument && (
                <DocumentEmailModal
                    isOpen={showEmailModal}
                    onClose={() => {
                        setShowEmailModal(false);
                        setSelectedDocument(null);
                    }}
                    preSelectedDocuments={[selectedDocument]}
                />
            )}
        </PageWrapper>
    );
}