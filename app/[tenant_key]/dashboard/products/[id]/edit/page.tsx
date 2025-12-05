'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    image?: string;
    category?: string;
    price?: number;
    currency?: string;
    status: 'active' | 'inactive';
    sku?: string;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const tenantKey = params?.tenant_key as string;
    const productId = params?.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        category: '',
        price: '',
        currency: 'IRR',
        status: 'active' as 'active' | 'inactive',
        sku: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

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
                const productData = data.data;
                setProduct(productData);
                setFormData({
                    name: productData.name || '',
                    description: productData.description || '',
                    image: productData.image || '',
                    category: productData.category || '',
                    price: productData.price?.toString() || '',
                    currency: productData.currency || 'IRR',
                    status: productData.status || 'active',
                    sku: productData.sku || ''
                });
                // تنظیم پیش‌نمایش تصویر موجود
                if (productData.image) {
                    setImagePreview(productData.image);
                }
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/products/upload-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "خطا",
                description: "خطا در آپلود تصویر",
                variant: "destructive",
            });
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.price.trim()) {
            toast({
                variant: "destructive",
                title: "خطا",
                description: "نام محصول و قیمت الزامی است",
            });
            return;
        }

        try {
            setSaving(true);

            // اگر تصویر جدید انتخاب شده، اول آپلود کن
            let imageUrl = formData.image;
            if (imageFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const response = await fetch(`/api/tenant/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-Key': tenantKey
                },
                body: JSON.stringify({
                    id: productId,
                    ...formData,
                    image: imageUrl,
                    price: parseFloat(formData.price)
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "محصول با موفقیت بروزرسانی شد",
                });
                router.push(`/${tenantKey}/dashboard/products/${productId}`);
            } else {
                toast({
                    variant: "destructive",
                    title: "خطا",
                    description: data.message || 'خطا در بروزرسانی محصول',
                });
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast({
                variant: "destructive",
                title: "خطا",
                description: "خطا در اتصال به سرور",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${tenantKey}/dashboard/products/${productId}`);
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
                            <Button 
                                variant="outline" 
                                onClick={() => router.push(`/${tenantKey}/dashboard/products`)}
                                className="font-vazir"
                            >
                                <ArrowRight className="h-4 w-4 ml-2" />
                                بازگشت به لیست محصولات
                            </Button>
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
                        ویرایش محصول
                    </h1>
                    <p className="text-muted-foreground font-vazir mt-2">ویرایش اطلاعات محصول</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="font-vazir"
                >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    بازگشت
                </Button>
            </div>

            {/* Form */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-vazir">اطلاعات محصول</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* نام محصول */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-vazir">نام محصول *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="نام محصول را وارد کنید"
                                    className="font-vazir"
                                    dir="rtl"
                                    required
                                />
                            </div>

                            {/* دسته‌بندی */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="font-vazir">دسته‌بندی</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="دسته‌بندی محصول"
                                    className="font-vazir"
                                    dir="rtl"
                                />
                            </div>

                            {/* قیمت */}
                            <div className="space-y-2">
                                <Label htmlFor="price" className="font-vazir">قیمت *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="قیمت محصول"
                                    className="font-vazir"
                                    dir="rtl"
                                    required
                                />
                            </div>

                            {/* واحد پول */}
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="font-vazir">واحد پول</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="font-vazir">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IRR" className="font-vazir">ریال</SelectItem>
                                        <SelectItem value="USD" className="font-vazir">دلار</SelectItem>
                                        <SelectItem value="EUR" className="font-vazir">یورو</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* کد محصول */}
                            <div className="space-y-2">
                                <Label htmlFor="sku" className="font-vazir">کد محصول (SKU)</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                                    placeholder="کد یکتای محصول"
                                    className="font-vazir"
                                    dir="rtl"
                                />
                            </div>

                            {/* وضعیت */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="font-vazir">وضعیت</Label>
                                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger className="font-vazir">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                                        <SelectItem value="inactive" className="font-vazir">غیرفعال</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* توضیحات */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-vazir">توضیحات</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="توضیحات محصول..."
                                className="font-vazir min-h-[100px]"
                                dir="rtl"
                            />
                        </div>

                        {/* تصویر محصول */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium font-vazir">تصویر محصول</h3>
                            <div className="space-y-4">
                                {imagePreview ? (
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={imagePreview}
                                            alt="پیش‌نمایش"
                                            className="w-full h-64 object-cover rounded-lg border-2 border-border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 left-2 font-vazir"
                                        >
                                            <X className="h-4 w-4 ml-1" />
                                            حذف تصویر
                                        </Button>
                                        {!imageFile && formData.image && (
                                            <div className="mt-2">
                                                <Label htmlFor="image-upload-change" className="cursor-pointer">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="font-vazir w-full"
                                                        onClick={() => document.getElementById('image-upload-change')?.click()}
                                                    >
                                                        <ImageIcon className="h-4 w-4 ml-2" />
                                                        تغییر تصویر
                                                    </Button>
                                                </Label>
                                                <Input
                                                    id="image-upload-change"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <Label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium font-vazir">
                                                    برای آپلود تصویر کلیک کنید
                                                </p>
                                                <p className="text-xs text-muted-foreground font-vazir">
                                                    JPG, PNG, WEBP یا GIF (حداکثر 5MB)
                                                </p>
                                            </div>
                                        </Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="flex justify-between pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="font-vazir"
                            >
                                انصراف
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || uploadingImage}
                                className="font-vazir"
                            >
                                {uploadingImage ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                        در حال آپلود تصویر...
                                    </>
                                ) : saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 ml-2" />
                                        ذخیره تغییرات
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}