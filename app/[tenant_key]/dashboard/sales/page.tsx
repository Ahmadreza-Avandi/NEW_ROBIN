'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    TrendingUp,
    Plus,
    Search,
    Filter,
    RefreshCw,
    DollarSign,
    Calendar,
    User,
    Trash2,
    Edit,
    Package,
    ShoppingCart,
    Award,
    Eye,
    X,
    Download
} from 'lucide-react';

interface Sale {
    id: string;
    title?: string;
    customer_id: string;
    customer_name: string;
    total_amount: number;
    currency: string;
    payment_status: string;
    sale_date: string;
    invoice_number?: string;
    sales_person_name: string;
    items?: SaleItem[];
}

interface SaleItem {
    id: string;
    product_id: string;
    product_name: string;
    product_category: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Customer {
    id: string;
    name: string;
    company_name?: string;
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
}

export default function SalesPage() {
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const [sales, setSales] = useState<Sale[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showNewSaleDialog, setShowNewSaleDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showSaleDetails, setShowSaleDetails] = useState(false);
    const { toast } = useToast();

    // New sale form state
    const [newSale, setNewSale] = useState({
        customer_id: '',
        items: [] as { product_id: string; quantity: number; unit_price: number }[],
        payment_status: 'pending',
        payment_method: '',
        notes: ''
    });

    // Utility function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    useEffect(() => {
        loadSales();
        loadCustomers();
        loadProducts();
        loadTopProducts();
    }, [tenantKey]);

    useEffect(() => {
        loadSales();
    }, [searchTerm, statusFilter]);

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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                setSales(data.sales || data.data || []);
            } else {
                setError(data.message || 'خطا در دریافت فروش‌ها');
            }
        } catch (error) {
            console.error('Error loading sales:', error);
            setError('مشکل در اتصال به دیتابیس - لطفاً صفحه را رفرش کنید');
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('/api/tenant/customers', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCustomers(data.customers || []);
                }
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            setCustomers([]);
        }
    };

    const loadProducts = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('/api/tenant/products/list', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products || data.data || []);
                }
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        }
    };

    const loadTopProducts = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('/api/tenant/sales/top-products', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTopProducts(data.products || []);
                }
            } else {
                setTopProducts([]);
            }
        } catch (error) {
            console.error('Error loading top products:', error);
            setTopProducts([]);
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

    const addProductToSale = () => {
        setNewSale(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }]
        }));
    };

    const removeProductFromSale = (index: number) => {
        setNewSale(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateSaleItem = (index: number, field: string, value: any) => {
        setNewSale(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleCreateSale = async () => {
        try {
            if (!newSale.customer_id || newSale.items.length === 0) {
                toast({
                    title: "خطا",
                    description: "لطفاً مشتری و حداقل یک محصول انتخاب کنید",
                    variant: "destructive"
                });
                return;
            }

            const token = getAuthToken();
            const response = await fetch('/api/tenant/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                },
                body: JSON.stringify(newSale)
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "فروش با موفقیت ثبت شد",
                });
                setShowNewSaleDialog(false);
                setNewSale({
                    customer_id: '',
                    items: [],
                    payment_status: 'pending',
                    payment_method: '',
                    notes: ''
                });
                loadSales();
                loadTopProducts();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در ثبت فروش",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error creating sale:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        }
    };

    const handleDeleteSale = async (saleId: string) => {
        if (!confirm('آیا از حذف این فروش اطمینان دارید؟')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/sales`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                },
                body: JSON.stringify({ id: saleId })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "فروش با موفقیت حذف شد",
                });
                loadSales();
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

    const filteredSales = sales.filter(sale => {
        const matchesSearch = (sale.title || sale.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sale.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sale.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 min-h-screen">
                <Card className="shadow-lg border-red-200">
                    <CardContent className="text-center py-12">
                        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <RefreshCw className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium font-vazir mb-2 text-red-800 dark:text-red-200">مشکل در اتصال</h3>
                        <p className="text-red-600 dark:text-red-400 font-vazir mb-4">{error}</p>
                        <div className="space-x-2 space-x-reverse">
                            <Button onClick={loadSales} className="font-vazir">
                                <RefreshCw className="h-4 w-4 ml-2" />
                                تلاش مجدد
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                        <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            مدیریت فروش
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-vazir mt-1">مدیریت کامل فروش محصولات و آمار فروش</p>
                    </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" onClick={loadSales} disabled={loading} className="font-vazir shadow hover:shadow-lg transition-all">
                        <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </Button>
                    <Dialog open={showNewSaleDialog} onOpenChange={setShowNewSaleDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-vazir shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-lg">
                                <Plus className="h-5 w-5 ml-2" />
                                ثبت فروش جدید
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
                            <DialogHeader>
                                <DialogTitle className="font-vazir text-xl">ثبت فروش جدید</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                {/* Warning if no customers or products */}
                                {(customers.length === 0 || products.length === 0) && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
                                            <div className="font-vazir text-sm text-yellow-800 dark:text-yellow-200">
                                                {customers.length === 0 && products.length === 0 && "برای ثبت فروش، ابتدا مشتری و محصول اضافه کنید"}
                                                {customers.length === 0 && products.length > 0 && "برای ثبت فروش، ابتدا مشتری اضافه کنید"}
                                                {customers.length > 0 && products.length === 0 && "برای ثبت فروش، ابتدا محصول اضافه کنید"}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Selection */}
                                <div className="space-y-2">
                                    <Label className="font-vazir">انتخاب مشتری</Label>
                                    <Select value={newSale.customer_id} onValueChange={(value) => setNewSale(prev => ({ ...prev, customer_id: value }))}>
                                        <SelectTrigger className="font-vazir">
                                            <SelectValue placeholder={customers.length > 0 ? "مشتری را انتخاب کنید" : "مشتری موجود نیست"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.length > 0 ? (
                                                customers.map(customer => (
                                                    <SelectItem key={customer.id} value={customer.id} className="font-vazir">
                                                        {customer.name} {customer.company_name && `(${customer.company_name})`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-customers" disabled className="font-vazir text-gray-500">
                                                    هیچ مشتری موجود نیست
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Products */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-vazir text-lg">محصولات</Label>
                                        <Button type="button" onClick={addProductToSale} variant="outline" className="font-vazir">
                                            <Plus className="h-4 w-4 ml-2" />
                                            افزودن محصول
                                        </Button>
                                    </div>
                                    
                                    {newSale.items.map((item, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-vazir">محصول</Label>
                                                    <Select 
                                                        value={item.product_id} 
                                                        onValueChange={(value) => {
                                                            const product = products.find(p => p.id === value);
                                                            updateSaleItem(index, 'product_id', value);
                                                            if (product) {
                                                                updateSaleItem(index, 'unit_price', product.price);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="font-vazir">
                                                            <SelectValue placeholder="محصول را انتخاب کنید" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.length > 0 ? (
                                                                products.map(product => (
                                                                    <SelectItem key={product.id} value={product.id} className="font-vazir">
                                                                        {product.name} - {formatPrice(product.price, product.currency)}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-products" disabled className="font-vazir text-gray-500">
                                                                    هیچ محصولی موجود نیست
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label className="font-vazir">تعداد</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="font-vazir"
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label className="font-vazir">قیمت واحد</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className="font-vazir"
                                                    />
                                                </div>
                                                
                                                <div className="flex items-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeProductFromSale(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-left">
                                                <span className="font-vazir text-lg font-bold">
                                                    جمع: {formatPrice(item.quantity * item.unit_price, 'IRR')}
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Payment Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-vazir">وضعیت پرداخت</Label>
                                        <Select value={newSale.payment_status} onValueChange={(value) => setNewSale(prev => ({ ...prev, payment_status: value }))}>
                                            <SelectTrigger className="font-vazir">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending" className="font-vazir">در انتظار پرداخت</SelectItem>
                                                <SelectItem value="paid" className="font-vazir">پرداخت شده</SelectItem>
                                                <SelectItem value="partial" className="font-vazir">پرداخت جزئی</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="font-vazir">روش پرداخت</Label>
                                        <Input
                                            value={newSale.payment_method}
                                            onChange={(e) => setNewSale(prev => ({ ...prev, payment_method: e.target.value }))}
                                            placeholder="نقدی، کارت، حواله و..."
                                            className="font-vazir"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label className="font-vazir">یادداشت</Label>
                                    <Textarea
                                        value={newSale.notes}
                                        onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="توضیحات اضافی..."
                                        className="font-vazir"
                                        rows={3}
                                    />
                                </div>

                                {/* Total */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="text-center">
                                        <span className="font-vazir text-2xl font-bold">
                                            مجموع کل: {formatPrice(
                                                newSale.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
                                                'IRR'
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                                    <Button variant="outline" onClick={() => setShowNewSaleDialog(false)} className="font-vazir">
                                        انصراف
                                    </Button>
                                    <Button 
                                        onClick={handleCreateSale} 
                                        disabled={customers.length === 0 || products.length === 0 || newSale.items.length === 0}
                                        className="font-vazir bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ثبت فروش
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* آمار کلی */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">کل فروش‌ها</CardTitle>
                        <ShoppingCart className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">{sales.length.toLocaleString('fa-IR')}</div>
                        <p className="text-white/70 text-sm font-vazir mt-1">فروش ثبت شده</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">در انتظار پرداخت</CardTitle>
                        <Calendar className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {pendingSales.length.toLocaleString('fa-IR')}
                        </div>
                        <p className="text-white/70 text-sm font-vazir mt-1">نیاز به پیگیری</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">پرداخت شده</CardTitle>
                        <TrendingUp className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {paidSales.length.toLocaleString('fa-IR')}
                        </div>
                        <p className="text-white/70 text-sm font-vazir mt-1">تکمیل شده</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">ارزش کل</CardTitle>
                        <DollarSign className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold font-vazir">
                            {formatPrice(totalSalesValue, 'IRR')}
                        </div>
                        <p className="text-white/70 text-sm font-vazir mt-1">درآمد کل</p>
                    </CardContent>
                </Card>
            </div>

            {/* پرفروش‌ترین محصولات */}
            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span>پرفروش‌ترین محصولات</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topProducts.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            {topProducts.slice(0, 3).map((product, index) => (
                                <div key={product.product_id} className="flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-vazir font-medium">{product.product_name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-vazir">
                                            {product.total_quantity} فروش - {formatPrice(product.total_revenue, 'IRR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-vazir">هنوز آماری از فروش محصولات موجود نیست</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* فیلتر جستجو */}
            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
                        <Filter className="h-5 w-5" />
                        <span>جستجو و فیلتر</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
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
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="فیلتر وضعیت پرداخت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه فروش‌ها</SelectItem>
                                <SelectItem value="paid" className="font-vazir">پرداخت شده</SelectItem>
                                <SelectItem value="pending" className="font-vazir">در انتظار پرداخت</SelectItem>
                                <SelectItem value="partial" className="font-vazir">پرداخت جزئی</SelectItem>
                                <SelectItem value="refunded" className="font-vazir">بازگشت داده شده</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* لیست فروش‌ها */}
            <div className="space-y-4">
                {filteredSales.length === 0 ? (
                    <Card className="shadow-lg">
                        <CardContent className="text-center py-12">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium font-vazir mb-2">فروشی یافت نشد</h3>
                            <p className="text-muted-foreground font-vazir mb-4">
                                {searchTerm || statusFilter !== 'all' ? 'فیلتر خود را تغییر دهید' : 'اولین فروش خود را ثبت کنید'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <div className="space-y-2">
                                    {customers.length === 0 || products.length === 0 ? (
                                        <div className="text-sm text-gray-500 font-vazir mb-4">
                                            {customers.length === 0 && products.length === 0 && "ابتدا مشتری و محصول اضافه کنید"}
                                            {customers.length === 0 && products.length > 0 && "ابتدا مشتری اضافه کنید"}
                                            {customers.length > 0 && products.length === 0 && "ابتدا محصول اضافه کنید"}
                                        </div>
                                    ) : (
                                        <Button onClick={() => setShowNewSaleDialog(true)} className="font-vazir">
                                            <Plus className="h-4 w-4 ml-2" />
                                            ثبت فروش جدید
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredSales.map((sale) => (
                        <Card key={sale.id} className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-blue-300 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 space-x-reverse mb-3">
                                            <h3 className="text-lg font-semibold font-vazir text-gray-900 dark:text-gray-100">
                                                {sale.title || sale.invoice_number || `فروش به ${sale.customer_name}`}
                                            </h3>
                                            <Badge className={`font-vazir ${getPaymentStatusColor(sale.payment_status)}`}>
                                                {getPaymentStatusLabel(sale.payment_status)}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                                            <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-vazir">مشتری</p>
                                                    <p className="text-sm font-vazir font-medium">{sale.customer_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                <DollarSign className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-vazir">مبلغ</p>
                                                    <p className="text-sm font-vazir font-bold text-green-600">
                                                        {formatPrice(sale.total_amount, sale.currency)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                                <User className="h-4 w-4 text-purple-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-vazir">فروشنده</p>
                                                    <p className="text-sm font-vazir font-medium">{sale.sales_person_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                                <Calendar className="h-4 w-4 text-orange-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-vazir">تاریخ</p>
                                                    <p className="text-sm font-vazir font-medium">
                                                        {new Date(sale.sale_date || sale.created_at).toLocaleDateString('fa-IR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* محصولات فروش */}
                                        {sale.items && sale.items.length > 0 && (
                                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <h4 className="font-vazir font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                                    <Package className="h-4 w-4 ml-2" />
                                                    محصولات ({sale.items.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {sale.items.slice(0, 3).map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center text-sm">
                                                            <span className="font-vazir">{item.product_name}</span>
                                                            <span className="font-vazir text-gray-600">
                                                                {item.quantity} × {formatPrice(item.unit_price, 'IRR')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {sale.items.length > 3 && (
                                                        <p className="text-xs text-gray-500 font-vazir">
                                                            و {sale.items.length - 3} محصول دیگر...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="font-vazir text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                // باز کردن فاکتور در تب جدید
                                                const token = getAuthToken();
                                                const url = `/api/tenant/sales/invoice?id=${sale.id}`;
                                                
                                                // ایجاد فرم برای ارسال هدرها
                                                const form = document.createElement('form');
                                                form.method = 'GET';
                                                form.action = url;
                                                form.target = '_blank';
                                                
                                                // باز کردن در تب جدید
                                                window.open(url, '_blank');
                                                
                                                toast({
                                                    title: "فاکتور باز شد",
                                                    description: "برای ذخیره PDF از دکمه چاپ استفاده کنید",
                                                });
                                            }}
                                        >
                                            <Download className="h-4 w-4 ml-2" />
                                            مشاهده فاکتور
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="font-vazir"
                                            onClick={() => {
                                                setSelectedSale(sale);
                                                setShowSaleDetails(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 ml-2" />
                                            جزئیات
                                        </Button>
                                        <Button variant="outline" size="sm" className="font-vazir">
                                            <Edit className="h-4 w-4 ml-2" />
                                            ویرایش
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSale(sale.id)}
                                            className="font-vazir text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 ml-2" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Dialog جزئیات فروش */}
            <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
                <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="font-vazir">جزئیات فروش</DialogTitle>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-vazir text-sm text-gray-500">مشتری</Label>
                                    <p className="font-vazir font-medium">{selectedSale.customer_name}</p>
                                </div>
                                <div>
                                    <Label className="font-vazir text-sm text-gray-500">مبلغ کل</Label>
                                    <p className="font-vazir font-bold text-green-600">
                                        {formatPrice(selectedSale.total_amount, selectedSale.currency)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-vazir text-sm text-gray-500">وضعیت پرداخت</Label>
                                    <Badge className={`font-vazir ${getPaymentStatusColor(selectedSale.payment_status)}`}>
                                        {getPaymentStatusLabel(selectedSale.payment_status)}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="font-vazir text-sm text-gray-500">تاریخ فروش</Label>
                                    <p className="font-vazir">{new Date(selectedSale.sale_date || selectedSale.created_at).toLocaleDateString('fa-IR')}</p>
                                </div>
                            </div>
                            
                            {selectedSale.items && selectedSale.items.length > 0 && (
                                <div>
                                    <Label className="font-vazir text-sm text-gray-500 mb-2 block">محصولات</Label>
                                    <div className="space-y-2">
                                        {selectedSale.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <p className="font-vazir font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-gray-500 font-vazir">{item.product_category}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-vazir">{item.quantity} × {formatPrice(item.unit_price, 'IRR')}</p>
                                                    <p className="font-vazir font-bold">{formatPrice(item.total_price, 'IRR')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}