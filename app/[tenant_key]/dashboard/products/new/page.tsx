'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, X, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    price: '',
    currency: 'IRR',
    status: 'active',
    sku: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // نمایش پیش‌نمایش
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

    console.log('📸 [Image Upload] شروع آپلود تصویر...');
    console.log('📸 [Image Upload] نام فایل:', imageFile.name);
    console.log('📸 [Image Upload] حجم فایل:', (imageFile.size / 1024).toFixed(2), 'KB');
    console.log('📸 [Image Upload] نوع فایل:', imageFile.type);

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('📤 [Image Upload] ارسال درخواست آپلود...');
      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 [Image Upload] پاسخ دریافت شد - Status:', response.status);
      const data = await response.json();
      console.log('📊 [Image Upload] داده‌های پاسخ:', data);

      if (data.success) {
        console.log('✅ [Image Upload] تصویر با موفقیت آپلود شد:', data.data.url);
        return data.data.url;
      } else {
        console.error('❌ [Image Upload] خطا در آپلود:', data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('💥 [Image Upload] خطای غیرمنتظره:', error);
      console.error('💥 [Image Upload] جزئیات خطا:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "خطا",
        description: "خطا در آپلود تصویر",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
      console.log('🏁 [Image Upload] پایان فرآیند آپلود');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 [Product Form] شروع ثبت محصول...');
    console.log('📋 [Product Form] داده‌های فرم:', formData);
    console.log('🔑 [Product Form] Tenant Key:', tenantKey);

    if (!formData.name) {
      console.error('❌ [Product Form] نام محصول خالی است');
      setError('نام محصول الزامی است');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // اول عکس رو آپلود کن (اگر وجود داره)
      let imageUrl = formData.image;
      if (imageFile) {
        console.log('📸 [Product Form] شروع آپلود تصویر...');
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('✅ [Product Form] تصویر آپلود شد:', uploadedUrl);
        } else {
          console.warn('⚠️ [Product Form] آپلود تصویر ناموفق بود');
        }
      }

      const requestBody = {
        ...formData,
        image: imageUrl,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      console.log('📤 [Product Form] ارسال درخواست به API...');
      console.log('📦 [Product Form] Body:', requestBody);

      const response = await fetch('/api/tenant/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Key': tenantKey
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 [Product Form] پاسخ دریافت شد - Status:', response.status);

      const data = await response.json();
      console.log('📊 [Product Form] داده‌های پاسخ:', data);

      if (data.success) {
        console.log('✅ [Product Form] محصول با موفقیت ثبت شد');
        toast({
          title: "موفقیت",
          description: "محصول جدید با موفقیت اضافه شد",
        });
        router.push(`/${tenantKey}/dashboard/products`);
      } else {
        console.error('❌ [Product Form] خطا در ثبت محصول:', data.message);
        setError(data.message || 'خطا در ایجاد محصول');
      }
    } catch (error) {
      console.error('💥 [Product Form] خطای غیرمنتظره:', error);
      console.error('💥 [Product Form] جزئیات خطا:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError('خطا در اتصال به سرور');
    } finally {
      setSubmitting(false);
      console.log('🏁 [Product Form] پایان فرآیند ثبت محصول');
    }
  };

  const handleCancel = () => {
    router.push(`/${tenantKey}/dashboard/products`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="hover:bg-primary/10"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              افزودن محصول جدید
            </h1>
            <p className="text-muted-foreground font-vazir mt-2">اطلاعات محصول جدید را وارد کنید</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 space-x-reverse text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-vazir">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-vazir">اطلاعات محصول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اطلاعات اصلی */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">اطلاعات اصلی</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-vazir">نام محصول *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="نام محصول"
                    required
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="font-vazir">دسته‌بندی</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="دسته‌بندی محصول"
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="font-vazir">کد محصول (SKU)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="کد یکتای محصول"
                    className="font-vazir"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-vazir">وضعیت</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                      <SelectItem value="inactive" className="font-vazir">غیرفعال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-vazir">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="توضیحات کامل محصول..."
                  rows={4}
                  className="font-vazir"
                  dir="rtl"
                />
              </div>
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

            {/* قیمت‌گذاری */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">قیمت‌گذاری</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-vazir">قیمت</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="قیمت محصول"
                    className="font-vazir"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground font-vazir">
                    مثال: ۱۰۰۰۰۰۰ برای یک میلیون تومان
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="font-vazir">واحد پول</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب واحد پول" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IRR" className="font-vazir">تومان</SelectItem>
                      <SelectItem value="USD" className="font-vazir">دلار</SelectItem>
                      <SelectItem value="EUR" className="font-vazir">یورو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* نمایش قیمت فرمت شده */}
              {formData.price && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-vazir text-blue-800">
                    <strong>قیمت نمایشی:</strong> {(() => {
                      const price = parseFloat(formData.price);
                      if (price >= 1000000000) {
                        return `${(price / 1000000000).toFixed(1)} میلیارد ${formData.currency === 'IRR' ? 'تومان' : formData.currency}`;
                      } else if (price >= 1000000) {
                        return `${(price / 1000000).toFixed(1)} میلیون ${formData.currency === 'IRR' ? 'تومان' : formData.currency}`;
                      } else if (price >= 1000) {
                        return `${(price / 1000).toFixed(0)} هزار ${formData.currency === 'IRR' ? 'تومان' : formData.currency}`;
                      } else {
                        return `${price.toLocaleString('fa-IR')} ${formData.currency === 'IRR' ? 'تومان' : formData.currency}`;
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                type="submit"
                disabled={submitting || uploadingImage || !formData.name}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
              >
                <Save className="h-4 w-4 ml-2" />
                {uploadingImage ? 'در حال آپلود تصویر...' : submitting ? 'در حال ذخیره...' : 'ذخیره محصول'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
                className="font-vazir"
              >
                <X className="h-4 w-4 ml-2" />
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}