'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight, Edit, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
    updated_at: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const tenantKey = params?.tenant_key as string;
    const productId = params?.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProduct();
    }, [productId, tenantKey]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError('');

            if (!tenantKey || !productId) {
                setError('شناسه محصول یا tenant یافت نشد');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/tenant/products/${productId}`, {
                headers: {
                    'X-Tenant-Key': tenantKey
                }
            });
            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                setError(data.message || 'محصول یافت نشد');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setError('خطا در اتصال به سرور');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'قیمت تعریف نشده';

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-vazir">در حال بارگذاری محصول...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-2xl mx-auto mt-10 animate-fade-in-up">
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="font-vazir text-xl text-destructive flex items-center">
                            <AlertCircle className="h-5 w-5 ml-2" />
                            {error || 'محصول یافت نشد'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2 space-x-reverse">
                            <Link href={`/${tenantKey}/dashboard/products`}>
                                <Button variant="outline" className="font-vazir">
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                    بازگشت به لیست محصولات
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={loadProduct} className="font-vazir">
                                تلاش مجدد
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        جزئیات محصول
                    </h1>
                    <p className="text-muted-foreground font-vazir mt-2">مشاهده اطلاعات کامل محصول</p>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <Link href={`/${tenantKey}/dashboard/products`}>
                        <Button variant="outline" className="font-vazir">
                            <ArrowRight className="h-4 w-4 ml-2" />
                            بازگشت
                        </Button>
                    </Link>
                    <Link href={`/${tenantKey}/dashboard/products/${productId}/edit`}>
                        <Button className="font-vazir">
                            <Edit className="h-4 w-4 ml-2" />
                            ویرایش
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Product Details */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="font-vazir text-2xl flex items-center mb-2">
                                <Package className="h-6 w-6 ml-2" />
                                {product.name}
                            </CardTitle>
                            {product.category && (
                                <Badge variant="outline" className="font-vazir">
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
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* اطلاعات اصلی */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium font-vazir mb-2">توضیحات</h3>
                                <p className="text-muted-foreground font-vazir">
                                    {product.description || 'توضیحاتی ارائه نشده است'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium font-vazir mb-2">قیمت</h3>
                                <p className="text-lg font-bold text-primary font-vazir">
                                    {formatPrice(product.price, product.currency)}
                                </p>
                            </div>

                            {product.sku && (
                                <div>
                                    <h3 className="font-medium font-vazir mb-2">کد محصول (SKU)</h3>
                                    <p className="text-muted-foreground font-vazir font-mono">
                                        {product.sku}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* اطلاعات تکمیلی */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium font-vazir mb-2">تاریخ ایجاد</h3>
                                <p className="text-muted-foreground font-vazir">
                                    {new Date(product.created_at).toLocaleDateString('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium font-vazir mb-2">آخرین بروزرسانی</h3>
                                <p className="text-muted-foreground font-vazir">
                                    {new Date(product.updated_at).toLocaleDateString('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium font-vazir mb-2">شناسه محصول</h3>
                                <p className="text-xs text-muted-foreground font-vazir font-mono break-all">
                                    {product.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
