'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerSearch } from '@/components/ui/customer-search';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, DollarSign } from 'lucide-react';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

export default function NewSalePage() {
  const params = useParams();
  const router = useRouter();
  const tenantKey = (params?.tenant_key as string) || '';
  const { toast } = useToast();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    total_amount: '',
    currency: 'IRR',
    payment_status: 'pending',
    payment_method: '',
    invoice_number: '',
    sale_date: moment().format('jYYYY/jMM/jDD'),
    delivery_date: '',
    payment_due_date: '',
    notes: ''
  });

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/customers-simple?limit=1000', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        }
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customer.id,
        customer_name: customer.name
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.total_amount) {
      toast({
        title: "خطا",
        description: "مشتری و مبلغ الزامی است",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // تبدیل تاریخ شمسی به میلادی
      const gregorianDate = moment(formData.sale_date, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');

      const response = await fetch('/api/tenant/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        },
        body: JSON.stringify({
          ...formData,
          sale_date: gregorianDate,
          total_amount: parseFloat(formData.total_amount)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "فروش با موفقیت ثبت شد",
        });
        router.push(`/${tenantKey}/dashboard/sales`);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${tenantKey}/dashboard/sales`)}
          className="hover:bg-primary/10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ثبت فروش جدید
          </h1>
          <p className="text-muted-foreground font-vazir mt-2">اطلاعات فروش را وارد کنید</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-vazir flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              اطلاعات فروش
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* مشتری */}
            <div className="space-y-2">
              <Label className="font-vazir">مشتری *</Label>
              <CustomerSearch
                customers={customers}
                selectedCustomer={customers.find(c => c.id === formData.customer_id)}
                onCustomerSelect={handleCustomerSelect}
                placeholder="جستجو و انتخاب مشتری..."
              />
            </div>

            {/* ردیف اول */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-vazir">مبلغ (تومان) *</Label>
                <Input
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  placeholder="مثال: 1000000"
                  className="font-vazir"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">شماره فاکتور</Label>
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="مثال: INV-001"
                  className="font-vazir"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">تاریخ فروش</Label>
                <PersianDatePicker
                  value={formData.sale_date}
                  onChange={(value) => setFormData({ ...formData, sale_date: value })}
                  placeholder="انتخاب تاریخ"
                />
              </div>
            </div>

            {/* ردیف دوم */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-vazir">وضعیت پرداخت</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger className="font-vazir">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="font-vazir">در انتظار</SelectItem>
                    <SelectItem value="partial" className="font-vazir">پرداخت جزئی</SelectItem>
                    <SelectItem value="paid" className="font-vazir">پرداخت شده</SelectItem>
                    <SelectItem value="refunded" className="font-vazir">بازگشت داده شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">روش پرداخت</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger className="font-vazir">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقد" className="font-vazir">نقد</SelectItem>
                    <SelectItem value="کارت به کارت" className="font-vazir">کارت به کارت</SelectItem>
                    <SelectItem value="چک" className="font-vazir">چک</SelectItem>
                    <SelectItem value="اعتباری" className="font-vazir">اعتباری</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">واحد پول</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
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

            {/* یادداشت */}
            <div className="space-y-2">
              <Label className="font-vazir">یادداشت</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="توضیحات اضافی..."
                className="font-vazir"
                dir="rtl"
                rows={4}
              />
            </div>

            {/* دکمه‌ها */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
              >
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'در حال ثبت...' : 'ثبت فروش'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${tenantKey}/dashboard/sales`)}
                className="font-vazir"
              >
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
