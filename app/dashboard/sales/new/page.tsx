'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, X, AlertCircle } from 'lucide-react';

export default function NewSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    customer_id: '',
    total_value: '',
    currency: 'IRR',
    probability: '50',
    expected_close_date: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers-simple?limit=100');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.customer_id) {
      setError('عنوان و مشتری الزامی است');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          total_value: formData.total_value ? parseFloat(formData.total_value) : 0,
          probability: parseInt(formData.probability),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "فروش جدید با موفقیت اضافه شد",
        });
        router.push('/dashboard/sales');
      } else {
        setError(data.message || 'خطا در ایجاد فروش');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/sales');
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    const numPrice = parseFloat(price);
    if (numPrice >= 1000000000) {
      return `${(numPrice / 1000000000).toFixed(1)} میلیارد تومان`;
    } else if (numPrice >= 1000000) {
      return `${(numPrice / 1000000).toFixed(1)} میلیون تومان`;
    } else if (numPrice >= 1000) {
      return `${(numPrice / 1000).toFixed(0)} هزار تومان`;
    } else {
      return `${numPrice.toLocaleString('fa-IR')} تومان`;
    }
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
              افزودن فروش جدید
            </h1>
            <p className="text-muted-foreground font-vazir mt-2">اطلاعات فروش جدید را وارد کنید</p>
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
          <CardTitle className="font-vazir">اطلاعات فروش</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-vazir">عنوان فروش *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="عنوان فروش"
                  required
                  className="font-vazir"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer" className="font-vazir">مشتری *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                  <SelectTrigger className="font-vazir">
                    <SelectValue placeholder="انتخاب مشتری" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id} className="font-vazir">
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_value" className="font-vazir">ارزش فروش</Label>
                <Input
                  id="total_value"
                  type="number"
                  value={formData.total_value}
                  onChange={(e) => handleInputChange('total_value', e.target.value)}
                  placeholder="ارزش فروش به تومان"
                  className="font-vazir"
                  dir="ltr"
                />
                {formData.total_value && (
                  <p className="text-xs text-blue-600 font-vazir">
                    {formatPrice(formData.total_value)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability" className="font-vazir">احتمال موفقیت (%)</Label>
                <Select value={formData.probability} onValueChange={(value) => handleInputChange('probability', value)}>
                  <SelectTrigger className="font-vazir">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="font-vazir">10% - لید جدید</SelectItem>
                    <SelectItem value="25" className="font-vazir">25% - تماس اولیه</SelectItem>
                    <SelectItem value="50" className="font-vazir">50% - نیازسنجی</SelectItem>
                    <SelectItem value="75" className="font-vazir">75% - ارسال پیشنهاد</SelectItem>
                    <SelectItem value="90" className="font-vazir">90% - مذاکره</SelectItem>
                    <SelectItem value="100" className="font-vazir">100% - بسته شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date" className="font-vazir">تاریخ پیش‌بینی بسته شدن</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                  className="font-vazir"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="font-vazir">واحد پول</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="font-vazir">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRR" className="font-vazir">تومان</SelectItem>
                    <SelectItem value="USD" className="font-vazir">دلار</SelectItem>
                    <SelectItem value="EUR" className="font-vazir">یورو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                type="submit"
                disabled={submitting || !formData.title || !formData.customer_id}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
              >
                <Save className="h-4 w-4 ml-2" />
                {submitting ? 'در حال ذخیره...' : 'ذخیره فروش'}
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