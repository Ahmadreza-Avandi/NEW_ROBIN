'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    TrendingUp,
    Plus,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    DollarSign,
    Calendar,
    User,
    Trash2,
    Edit
} from 'lucide-react';

interface Sale {
    id: string;
    title?: string;
    customer_name: string;
    total_amount: number;
    currency: string;
    payment_status: string;
    sale_date: string;
    invoice_number?: string;
    sales_person_name: string;
}

export default function SalesPage() {
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    // Utility function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    useEffect(() => {
        loadSales();
    }, [searchTerm, tenantKey]);

    const loadSales = async () => {
        try {
            setLoading(true);
            setError('');

            const token = getAuthToken();
            const params_query = new URLSearchParams();
            if (searchTerm) params_query.append('search', searchTerm);

            const response = await fetch(`/api/tenant/sales?${params_query.toString()}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                }
            });
            const data = await response.json();

            if (data.success) {
                setSales(data.sales || data.data || []);
            } else {
                setError(data.message || 'خطا در دریافت فروش‌ها');
            }
        } catch (error) {
            console.error('Error loading sales:', error);
            setError('خطا در اتصال به سرور');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} میلیارد ${currency === 'IRR' ? 'تومان' : currency}`;
        } else if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} میلیون ${currency === 'IRR' ? 'تومان' : currency}`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)} هزار ${currency === 'IRR' ? 'تومان' : currency}`;
        } else {
            return `${price.toLocaleString('fa-IR')} ${currency === 'IRR' ? 'تومان' : currency}`;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'پرداخت شده';
            case 'pending': return 'در انتظار';
            case 'partial': return 'پرداخت جزئی';
            case 'refunded': return 'بازگشت داده شده';
            default: return status;
        }
    };

    const handleDeleteSale = async (saleId: string) => {
        if (!confirm('آیا از حذف این فروش اطمینان دارید؟')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/sales?id=${saleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                }
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "فروش با موفقیت حذف شد",
                });
                loadSales(); // بارگذاری مجدد لیست
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در حذف فروش",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting sale:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        }
    };

    const filteredSales = sales.filter(sale =>
        (sale.title || sale.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSalesValue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const paidSales = sales.filter(sale => sale.payment_status === 'paid');
    const pendingSales = sales.filter(sale => sale.payment_status === 'pending');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-vazir">در حال بارگذاری فروش‌ها...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        مدیریت فروش
                    </h1>
                    <p className="text-muted-foreground font-vazir mt-2">مدیریت کامل فرآیند فروش و معاملات</p>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" onClick={loadSales} disabled={loading} className="font-vazir">
                        <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </Button>
                    <Button
                        onClick={() => window.location.href = `/${tenantKey}/dashboard/sales/new`}
                        className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
                    >
                        <Plus className="h-4 w-4 ml-2" />
                        افزودن فروش
                    </Button>
                </div>
            </div>

            {/* آمار کلی */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">کل فروش‌ها</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-vazir">{sales.length.toLocaleString('fa-IR')}</div>
                    </CardContent>
                </Card>

                <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">در انتظار پرداخت</CardTitle>
                        <Calendar className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 font-vazir">
                            {pendingSales.length.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">پرداخت شده</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 font-vazir">
                            {paidSales.length.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">ارزش کل</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-vazir">
                            {formatPrice(totalSalesValue, 'IRR')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* فیلتر جستجو */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
                        <Filter className="h-5 w-5" />
                        <span>جستجو و فیلتر</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="جستجوی عنوان فروش یا نام مشتری..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10 font-vazir"
                            dir="rtl"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* لیست فروش‌ها */}
            <div className="space-y-4">
                {filteredSales.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium font-vazir mb-2">فروشی یافت نشد</h3>
                            <p className="text-muted-foreground font-vazir mb-4">
                                {searchTerm ? 'فیلتر خود را تغییر دهید' : 'اولین فروش خود را اضافه کنید'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredSales.map((sale) => (
                        <Card key={sale.id} className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 space-x-reverse mb-2">
                                            <h3 className="text-lg font-semibold font-vazir">
                                                {sale.title || sale.invoice_number || `فروش ${sale.id.slice(0, 8)}`}
                                            </h3>
                                            <Badge className={`font-vazir ${getPaymentStatusColor(sale.payment_status)}`}>
                                                {getPaymentStatusLabel(sale.payment_status)}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-4">
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-vazir">{sale.customer_name}</span>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-vazir font-medium text-green-600">
                                                    {formatPrice(sale.total_amount, sale.currency)}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-vazir">{sale.sales_person_name}</span>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-vazir">
                                                    {new Date(sale.sale_date).toLocaleDateString('fa-IR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 space-x-reverse">
                                        <Button variant="outline" size="sm" className="font-vazir">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSale(sale.id)}
                                            className="font-vazir text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}