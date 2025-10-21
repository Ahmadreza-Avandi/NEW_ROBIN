// مثال استفاده از ProductSelector در فرم افزودن مشتری
'use client';

import { useState } from 'react';
import { ProductSelector } from '@/components/ui/product-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductInterest {
  productId: string;
  interestLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

export default function CustomerFormWithProducts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    segment: 'small_business',
    priority: 'medium',
    // سایر فیلدهای مشتری...
  });

  const [selectedProducts, setSelectedProducts] = useState<ProductInterest[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ابتدا مشتری را ایجاد کنید
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const customerData = await customerResponse.json();

      if (customerData.success) {
        const customerId = customerData.data.id;

        // سپس علاقه‌مندی‌های محصول را ثبت کنید
        if (selectedProducts.length > 0) {
          await Promise.all(
            selectedProducts.map(async (interest) => {
              await fetch('/api/customer-product-interests', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  customer_id: customerId,
                  product_id: interest.productId,
                  interest_level: interest.interestLevel,
                  notes: interest.notes,
                }),
              });
            })
          );
        }

        alert('مشتری با موفقیت ایجاد شد!');
        // ریدایرکت یا پاک کردن فرم
      } else {
        throw new Error(customerData.message);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('خطا در ایجاد مشتری');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold font-vazir">افزودن مشتری جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات پایه مشتری */}
        <Card>
          <CardHeader>
            <CardTitle className="font-vazir">اطلاعات پایه</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-vazir">نام شرکت *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="نام شرکت یا فرد"
                required
                className="font-vazir"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-vazir">ایمیل</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@domain.com"
                className="font-vazir"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-vazir">تلفن</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="09123456789"
                className="font-vazir"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="font-vazir">صنعت</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="مثال: دامداری، کشاورزی"
                className="font-vazir"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment" className="font-vazir">بخش</Label>
              <Select 
                value={formData.segment} 
                onValueChange={(value) => setFormData({ ...formData, segment: value })}
              >
                <SelectTrigger className="font-vazir">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual" className="font-vazir">فردی</SelectItem>
                  <SelectItem value="small_business" className="font-vazir">کسب‌وکار کوچک</SelectItem>
                  <SelectItem value="enterprise" className="font-vazir">سازمانی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-vazir">اولویت</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="font-vazir">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="font-vazir">پایین</SelectItem>
                  <SelectItem value="medium" className="font-vazir">متوسط</SelectItem>
                  <SelectItem value="high" className="font-vazir">بالا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* انتخاب محصولات */}
        <ProductSelector
          selectedProducts={selectedProducts}
          onSelectionChange={setSelectedProducts}
        />

        {/* دکمه‌های عمل */}
        <div className="flex justify-end space-x-4 space-x-reverse">
          <Button type="button" variant="outline" className="font-vazir">
            انصراف
          </Button>
          <Button type="submit" disabled={loading} className="font-vazir">
            {loading ? 'در حال ذخیره...' : 'ذخیره مشتری'}
          </Button>
        </div>
      </form>
    </div>
  );
}