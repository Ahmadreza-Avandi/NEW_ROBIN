'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    category?: string;
    price?: number;
    currency?: string;
    status: 'active' | 'inactive';
    sku?: string;
    created_at: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categories, setCategories] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        console.log('🚀 Component mounted, loading initial data');
        loadProducts(); // بارگذاری اولیه محصولات
    }, []);

    useEffect(() => {
        console.log('useEffect triggered - Filters changed:', { searchTerm, categoryFilter, statusFilter });
        const timeoutId = setTimeout(() => {
            loadProducts();
        }, searchTerm ? 500 : 0); // debounce برای جستجو

        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, statusFilter]);

    const loadCategories = async () => {
        try {
            console.log('📂 Loading categories...');
            const response = await fetch('/api/products/categories');
            const data = await response.json();
            console.log('📂 Categories response:', data);
            if (data.success) {
                setCategories(data.data || []);
                console.log('📂 Categories loaded:', data.data?.length || 0);
            }
        } catch (error) {
            console.error('❌ Error loading categories:', error);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (searchTerm.trim()) params.append('search', searchTerm.trim());
            if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
            if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

            const url = `/api/products?${params.toString()}`;
            console.log('🔍 Loading products with URL:', url);
            console.log('📊 Current filters:', { searchTerm, categoryFilter, statusFilter });

            const response = await fetch(url);
            const data = await response.json();

            console.log('✅ API Response:', data);
            console.log('📦 Products count:', data.data?.length || 0);

            if (data.success) {
                setProducts(data.data || []);
                console.log('✨ Products state updated with', data.data?.length || 0, 'items');

                // استخراج دسته‌بندی‌های منحصر به فرد
                const allCategories = data.data
                    .map((p: Product) => p.category)
                    .filter((cat: string | undefined) => cat && cat.trim() !== '');
                const categorySet = new Set(allCategories);
                const uniqueCategories = Array.from(categorySet) as string[];
                setCategories(uniqueCategories);
            } else {
                setError(data.message || 'خطا در دریافت محصولات');
                console.error('❌ API Error:', data.message);
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            setError('خطا در اتصال به سرور');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'فعال';
            case 'inactive': return 'غیرفعال';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'قیمت تعریف نشده';
        
        // تبدیل به واحدهای مناسب
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} میلیارد ${currency || 'تومان'}`;
        } else if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} میلیون ${currency || 'تومان'}`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)} هزار ${currency || 'تومان'}`;
        } else {
            return `${price.toLocaleString('fa-IR')} ${currency || 'تومان'}`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-vazir">در حال بارگذاری محصولات...</p>
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
                        مدیریت محصولات
                    </h1>
                    <p className="text-muted-foreground font-vazir mt-2">مدیریت کامل محصولات و خدمات</p>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" onClick={loadProducts} disabled={loading} className="font-vazir">
                        <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </Button>
                    <Button 
                        onClick={() => window.location.href = '/dashboard/products/new'}
                        className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
                    >
                        <Plus className="h-4 w-4 ml-2" />
                        افزودن محصول
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 space-x-reverse text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-vazir">{error}</span>
                            <Button variant="outline" size="sm" onClick={loadProducts} className="mr-auto font-vazir">
                                تلاش مجدد
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* آمار کلی */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">کل محصولات</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-vazir">{products.length.toLocaleString('fa-IR')}</div>
                    </CardContent>
                </Card>

                <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">محصولات فعال</CardTitle>
                        <Package className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 font-vazir">
                            {products.filter(p => p.status === 'active').length.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">دسته‌بندی‌ها</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-vazir">{categories.length.toLocaleString('fa-IR')}</div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-vazir">محصولات غیرفعال</CardTitle>
                        <Package className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600 font-vazir">
                            {products.filter(p => p.status === 'inactive').length.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* فیلترها */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
                        <Filter className="h-5 w-5" />
                        <span>فیلتر محصولات</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="جستجوی نام، توضیحات یا SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 font-vazir"
                                dir="rtl"
                            />
                        </div>

                        <Select 
                            value={categoryFilter} 
                            onValueChange={(value) => {
                                console.log('🔄 Category filter changed from', categoryFilter, 'to:', value);
                                setCategoryFilter(value);
                            }}
                        >
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="دسته‌بندی" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه دسته‌ها</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category} className="font-vazir">
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select 
                            value={statusFilter} 
                            onValueChange={(value) => {
                                console.log('🔄 Status filter changed from', statusFilter, 'to:', value);
                                setStatusFilter(value);
                            }}
                        >
                            <SelectTrigger className="font-vazir">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-vazir">همه وضعیت‌ها</SelectItem>
                                <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                                <SelectItem value="inactive" className="font-vazir">غیرفعال</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* لیست محصولات */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium font-vazir mb-2">محصولی یافت نشد</h3>
                        <p className="text-muted-foreground font-vazir mb-4">
                            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                                ? 'فیلترهای خود را تغییر دهید یا محصول جدید اضافه کنید'
                                : 'اولین محصول خود را اضافه کنید'
                            }
                        </p>
                        <Button 
                            onClick={() => window.location.href = '/dashboard/products/new'}
                            className="font-vazir"
                        >
                            <Plus className="h-4 w-4 ml-2" />
                            افزودن محصول
                        </Button>
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product.id} className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="font-vazir text-lg mb-2">{product.name}</CardTitle>
                                        {product.category && (
                                            <Badge variant="outline" className="font-vazir mb-2">
                                                {product.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge className={`font-vazir ${getStatusColor(product.status)}`}>
                                        {getStatusLabel(product.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {product.description && (
                                        <p className="text-sm text-muted-foreground font-vazir line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium font-vazir text-primary">
                                            {formatPrice(product.price, product.currency)}
                                        </span>
                                        {product.sku && (
                                            <span className="text-xs text-muted-foreground font-vazir">
                                                SKU: {product.sku}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-muted-foreground font-vazir">
                                        ایجاد شده: {new Date(product.created_at).toLocaleDateString('fa-IR')}
                                    </div>

                                    <div className="flex space-x-2 space-x-reverse pt-2">
                                        <Button variant="outline" size="sm" className="flex-1 font-vazir">
                                            ویرایش
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 font-vazir">
                                            مشاهده
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