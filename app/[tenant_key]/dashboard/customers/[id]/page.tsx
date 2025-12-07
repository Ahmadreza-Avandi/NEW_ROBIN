'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency-utils';
import moment from 'moment-jalaali';
import {
    ArrowRight, Building, Calendar, CheckCircle, Clock, DollarSign, Edit, Eye,
    FileText, Mail, MessageCircle, Phone, Star, Ticket, TrendingUp, User,
    AlertTriangle, Plus, MapPin, Activity as ActivityIcon, ExternalLink,
    Save, Tag, Target, Users, ShoppingCart, Receipt, Package
} from 'lucide-react';
import SalesPipelineProgress from '@/components/sales-pipeline-progress';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });

interface CustomerData {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    industry?: string;
    segment?: string;
    status: string;
    priority?: string;
    assigned_user_name?: string;
    total_deals: number;
    total_tickets: number;
    total_contacts: number;
    won_value?: number;
    satisfaction_score?: number;
    created_at: string;
    potential_value?: number;
    last_interaction?: string;
    notes?: string;
    company?: string;
    activities: Array<{
        id: string;
        type: string;
        title: string;
        description?: string;
        performed_by_name?: string;
        created_at: string;
        outcome?: string;
    }>;
    contacts: Array<{
        id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        job_title?: string;
        is_primary: boolean;
    }>;
    sales: Array<{
        id: string;
        total_amount: number;
        payment_status: string;
        sale_date: string;
        invoice_number?: string;
        sales_person_name: string;
        items?: Array<{
            product_name: string;
            quantity: number;
            unit_price: number;
            total_price: number;
        }>;
    }>;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const customerId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
    const tenantKey = (params?.tenant_key as string) || '';

    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    // Utility function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    const fetchCustomerData = async () => {
        if (!customerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            const finalTenantKey = (params?.tenant_key as string) || tenantKey;
            
            console.log('🔍 Fetching customer data:', {
                customerId,
                tenantKey: finalTenantKey,
                hasToken: !!token
            });

            if (!finalTenantKey) {
                console.error('❌ No tenant key available');
                toast({
                    title: 'خطا',
                    description: 'کلید تنانت یافت نشد',
                    variant: 'destructive'
                });
                setLoading(false);
                return;
            }

            // Fetch customer data
            const customerResponse = await fetch(`/api/tenant/customers/${customerId}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': finalTenantKey,
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('🔍 Customer response status:', customerResponse.status);
            const customerData = await customerResponse.json();
            console.log('🔍 Customer data:', customerData);

            if (customerData.success) {
                // Fetch customer-specific sales
                const salesResponse = await fetch(`/api/tenant/sales?customer_id=${customerId}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Tenant-Key': finalTenantKey,
                        'Content-Type': 'application/json',
                    },
                });
                const salesData = await salesResponse.json();

                // Fetch customer activities
                const activitiesResponse = await fetch(`/api/tenant/activities?customer_id=${customerId}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Tenant-Key': finalTenantKey,
                        'Content-Type': 'application/json',
                    },
                });
                const activitiesData = await activitiesResponse.json();

                setCustomer({
                    ...customerData.data,
                    sales: salesData.success ? salesData.data.sales || [] : [],
                    activities: activitiesData.success ? activitiesData.data || [] : []
                });
            } else {
                toast({
                    title: "خطا",
                    description: customerData.message || "خطا در دریافت اطلاعات مشتری",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'فعال';
            case 'inactive': return 'غیرفعال';
            case 'prospect': return 'نیاز به پیگیری';
            case 'customer': return 'مشتری';
            case 'partner': return 'شریک';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'prospect': return 'destructive';
            case 'customer': return 'default';
            case 'partner': return 'secondary';
            default: return 'secondary';
        }
    };

    const getSegmentLabel = (segment?: string) => {
        if (!segment) return 'نامشخص';
        switch (segment) {
            case 'enterprise': return 'سازمانی';
            case 'small_business': return 'کسب‌وکار کوچک';
            case 'individual': return 'فردی';
            default: return segment;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'بالا';
            case 'medium': return 'متوسط';
            case 'low': return 'پایین';
            default: return priority || 'متوسط';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'در انتظار';
            case 'partial': return 'پرداخت جزئی';
            case 'paid': return 'پرداخت شده';
            case 'refunded': return 'بازگشت داده شده';
            default: return status;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'destructive';
            case 'partial': return 'secondary';
            case 'paid': return 'default';
            case 'refunded': return 'outline';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'نامشخص';
        try {
            return moment(dateString).format('jYYYY/jMM/jDD');
        } catch {
            return 'تاریخ نامعتبر';
        }
    };

    // Calculate customer metrics
    const totalSalesAmount = customer?.sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
    const totalSalesCount = customer?.sales?.length || 0;
    const paidSales = customer?.sales?.filter(sale => sale.payment_status === 'paid') || [];
    const paidAmount = paidSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const pendingSales = customer?.sales?.filter(sale => sale.payment_status === 'pending') || [];
    const pendingAmount = pendingSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    if (!customerId) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">شناسه مشتری نامعتبر</h2>
                    <p className="text-muted-foreground mt-2">شناسه مشتری مورد نظر نامعتبر است</p>
                    <Button onClick={() => router.push('/dashboard/customers')} className="mt-4">
                        بازگشت به لیست مشتریان
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">مشتری یافت نشد</h2>
                    <p className="text-muted-foreground mt-2">مشتری مورد نظر وجود ندارد</p>
                    <Button onClick={() => router.push('/dashboard/customers')} className="mt-4">
                        بازگشت به لیست مشتریان
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/customers')}
                        className="hover:bg-primary/10"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl">
                                {customer?.name ? customer.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{customer.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getStatusColor(customer.status)}>
                                    {getStatusLabel(customer.status)}
                                </Badge>
                                <span className="text-muted-foreground">{getSegmentLabel(customer.segment)}</span>
                                {customer.priority && (
                                    <span className={`text-sm font-medium ${getPriorityColor(customer.priority)}`}>
                                        اولویت {getPriorityLabel(customer.priority)}
                                    </span>
                                )}
                            </div>
                            {customer.company && (
                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                    <Building className="h-4 w-4" />
                                    {customer.company}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={!customer.phone}>
                        <Phone className="h-4 w-4 ml-2" />
                        تماس
                    </Button>
                    <Button variant="outline" disabled={!customer.email}>
                        <Mail className="h-4 w-4 ml-2" />
                        ایمیل
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/customers/${customerId}/edit`)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                        <Edit className="h-4 w-4 ml-2" />
                        ویرایش
                    </Button>
                </div>
            </div>

            {/* اطلاعات تماس */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        اطلاعات تماس
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            {customer.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span>{customer.email}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.website && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4 text-gray-500" />
                                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {customer.website}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {customer.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                    <div>
                                        <p>{customer.address}</p>
                                        {customer.city && <p className="text-sm text-gray-600">{customer.city}</p>}
                                    </div>
                                </div>
                            )}
                            {customer.industry && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-gray-500" />
                                    <span>{customer.industry}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>عضویت: {formatDate(customer.created_at)}</span>
                            </div>
                            {customer.last_interaction && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>آخرین تعامل: {formatDate(customer.last_interaction)}</span>
                                </div>
                            )}
                            {customer.assigned_user_name && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span>مسئول: {customer.assigned_user_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* آمار مالی */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">کل فروش</CardTitle>
                        <div className="p-2 bg-green-500 rounded-lg">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(totalSalesAmount)}
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            {totalSalesCount.toLocaleString('fa-IR')} فروش
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">پرداخت شده</CardTitle>
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">
                            {formatCurrency(paidAmount)}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">
                            {paidSales.length.toLocaleString('fa-IR')} فروش
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">در انتظار</CardTitle>
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">
                            {formatCurrency(pendingAmount)}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                            {pendingSales.length.toLocaleString('fa-IR')} فروش
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">ارزش بالقوه</CardTitle>
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">
                            {customer.potential_value ? formatCurrency(customer.potential_value) : 'تعریف نشده'}
                        </div>
                        {customer.satisfaction_score && (
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-emerald-600">
                                    رضایت: {customer.satisfaction_score.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* محتوای اصلی با Tabs */}
            <Tabs defaultValue="sales" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="sales">فروش‌ها</TabsTrigger>
                    <TabsTrigger value="pipeline">فرآیند فروش</TabsTrigger>
                    <TabsTrigger value="activities">فعالیت‌ها</TabsTrigger>
                    <TabsTrigger value="contacts">مخاطبین</TabsTrigger>
                    <TabsTrigger value="notes">یادداشت‌ها</TabsTrigger>
                </TabsList>

                {/* فروش‌ها */}
                <TabsContent value="sales">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                فروش‌های مشتری ({totalSalesCount.toLocaleString('fa-IR')} مورد)
                            </CardTitle>
                            <Button
                                onClick={() => router.push('/dashboard/sales')}
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 ml-2" />
                                ثبت فروش جدید
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {customer.sales && customer.sales.length > 0 ? (
                                <div className="space-y-4">
                                    {customer.sales.map((sale) => (
                                        <Card key={sale.id} className="border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-teal-100 rounded-lg">
                                                            <Receipt className="h-5 w-5 text-teal-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold">
                                                                    {sale.invoice_number || `فروش ${sale.id.slice(0, 8)}`}
                                                                </span>
                                                                <Badge variant={getPaymentStatusColor(sale.payment_status)}>
                                                                    {getPaymentStatusLabel(sale.payment_status)}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <User className="h-4 w-4" />
                                                                    {sale.sales_person_name}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    {formatDate(sale.sale_date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xl font-bold text-green-600">
                                                            {formatCurrency(sale.total_amount)}
                                                        </div>
                                                        {sale.items && sale.items.length > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                {sale.items.length.toLocaleString('fa-IR')} محصول
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {sale.items && sale.items.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {sale.items.slice(0, 4).map((item, index) => (
                                                                <div key={index} className="flex items-center justify-between text-sm">
                                                                    <span className="flex items-center gap-1">
                                                                        <Package className="h-3 w-3 text-gray-400" />
                                                                        {item.product_name}
                                                                    </span>
                                                                    <span className="text-gray-600">
                                                                        {item.quantity.toLocaleString('fa-IR')} × {formatCurrency(item.unit_price)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {sale.items.length > 4 && (
                                                                <div className="text-sm text-gray-500 col-span-2">
                                                                    و {(sale.items.length - 4).toLocaleString('fa-IR')} محصول دیگر...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-medium text-gray-600 mb-2">هیچ فروشی ثبت نشده</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        هنوز هیچ فروشی برای این مشتری ثبت نشده است
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/sales')}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600"
                                    >
                                        <Plus className="h-4 w-4 ml-2" />
                                        ثبت اولین فروش
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* فرآیند فروش */}
                <TabsContent value="pipeline">
                    <SalesPipelineProgress
                        customerId={customerId}
                        onUpdate={fetchCustomerData}
                    />
                </TabsContent>

                {/* فعالیت‌ها */}
                <TabsContent value="activities">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5" />
                                فعالیت‌ها ({customer.activities?.length || 0} مورد)
                            </CardTitle>
                            <Button 
                                className="bg-gradient-to-r from-emerald-600 to-teal-600"
                                onClick={() => router.push(`/dashboard/activities?customer_id=${customerId}`)}
                            >
                                <Plus className="h-4 w-4 ml-2" />
                                افزودن فعالیت
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {customer.activities && customer.activities.length > 0 ? (
                                    customer.activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:border-emerald-300 transition-colors">
                                            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
                                                {activity.type === 'call' && <Phone className="h-5 w-5 text-blue-600" />}
                                                {activity.type === 'meeting' && <Users className="h-5 w-5 text-green-600" />}
                                                {activity.type === 'email' && <Mail className="h-5 w-5 text-purple-600" />}
                                                {activity.type === 'task' && <CheckCircle className="h-5 w-5 text-orange-600" />}
                                                {!['call', 'meeting', 'email', 'task'].includes(activity.type) && <ActivityIcon className="h-5 w-5 text-gray-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {activity.outcome && (
                                                            <Badge 
                                                                variant={activity.outcome === 'successful' ? 'default' : 'secondary'}
                                                                className={`text-xs ${
                                                                    activity.outcome === 'successful' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                    activity.outcome === 'follow_up_needed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                    'bg-gray-100 text-gray-800 border-gray-200'
                                                                }`}
                                                            >
                                                                {activity.outcome === 'successful' ? 'موفق' :
                                                                 activity.outcome === 'follow_up_needed' ? 'نیاز به پیگیری' :
                                                                 activity.outcome === 'no_answer' ? 'بدون پاسخ' : activity.outcome}
                                                            </Badge>
                                                        )}
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(activity.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {activity.description && (
                                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{activity.description}</p>
                                                )}
                                                {activity.performed_by_name && (
                                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        توسط: {activity.performed_by_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <ActivityIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-600 mb-2">فعالیتی ثبت نشده</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            فعالیت‌های مربوط به این مشتری اینجا نمایش داده می‌شود
                                        </p>
                                        <Button 
                                            className="bg-gradient-to-r from-emerald-600 to-teal-600"
                                            onClick={() => router.push(`/dashboard/activities?customer_id=${customerId}`)}
                                        >
                                            <Plus className="h-4 w-4 ml-2" />
                                            ثبت اولین فعالیت
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* مخاطبین */}
                <TabsContent value="contacts">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                مخاطبین
                            </CardTitle>
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                                <Plus className="h-4 w-4 ml-2" />
                                افزودن مخاطب
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {customer.contacts && customer.contacts.length > 0 ? (
                                    customer.contacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                    {`${contact.first_name} ${contact.last_name}`.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">{contact.first_name} {contact.last_name}</h4>
                                                    {contact.is_primary && (
                                                        <Badge>مخاطب اصلی</Badge>
                                                    )}
                                                </div>
                                                {contact.job_title && (
                                                    <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    {contact.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {contact.email}
                                                        </span>
                                                    )}
                                                    {contact.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {contact.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-600 mb-2">مخاطبی ثبت نشده</p>
                                        <p className="text-sm text-gray-500">مخاطبین مربوط به این مشتری اینجا نمایش داده می‌شود</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* یادداشت‌ها */}
                <TabsContent value="notes">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                یادداشت‌ها
                            </CardTitle>
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                                <Plus className="h-4 w-4 ml-2" />
                                افزودن یادداشت
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {customer.notes ? (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700">{customer.notes}</p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-medium text-gray-600 mb-2">یادداشتی ثبت نشده</p>
                                    <p className="text-sm text-gray-500">یادداشت‌های مربوط به این مشتری اینجا نمایش داده می‌شود</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}