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
import { ArrowRight, Save, X, AlertCircle, Loader2 } from 'lucide-react';

interface CustomerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: number;
  segment?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const customerId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'Iran',
    industry: '',
    company_size: '',
    annual_revenue: '',
    segment: '',
    priority: 'medium',
    status: 'prospect',
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`/api/tenant/customers/${customerId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const customerData = data.data;
        setCustomer(customerData);
        setFormData({
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          website: customerData.website || '',
          address: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          country: customerData.country || 'Iran',
          industry: customerData.industry || '',
          company_size: customerData.company_size || '',
          annual_revenue: customerData.annual_revenue ? customerData.annual_revenue.toString() : '',
          segment: customerData.segment || '',
          priority: customerData.priority || 'medium',
          status: customerData.status || 'prospect',
        });
      } else {
        setError(data.message || 'خطا در دریافت اطلاعات مشتری');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('نام مشتری الزامی است');
      return;
    }

    if (submitting) {
      return; // Prevent double submission
    }

    setSubmitting(true);
    setError('');

    try {
      const token = getAuthToken();

      const response = await fetch(`/api/tenant/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
        },
        body: JSON.stringify({
          ...formData,
          annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "اطلاعات مشتری با موفقیت به‌روزرسانی شد",
        });
        router.push(`/dashboard/customers/${customerId}`);
      } else {
        setError(data.message || 'خطا در به‌روزرسانی مشتری');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  if (!customerId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-vazir">شناسه مشتری نامعتبر</h2>
          <p className="text-muted-foreground font-vazir mt-2">شناسه مشتری مورد نظر نامعتبر است</p>
          <Button onClick={() => router.push('/dashboard/customers')} className="mt-4 font-vazir">
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
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-vazir">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-vazir">مشتری یافت نشد</h2>
          <p className="text-muted-foreground font-vazir mt-2">مشتری مورد نظر وجود ندارد</p>
          <Button onClick={() => router.push('/dashboard/customers')} className="mt-4 font-vazir">
            بازگشت به لیست مشتریان
          </Button>
        </div>
      </div>
    );
  }

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
              ویرایش مشتری
            </h1>
            <p className="text-muted-foreground font-vazir mt-2">ویرایش اطلاعات {customer.name}</p>
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

      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 relative">
        {submitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-vazir text-lg">در حال ذخیره تغییرات...</span>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-vazir">اطلاعات مشتری</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اطلاعات اصلی */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">اطلاعات اصلی</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-vazir">نام مشتری *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="نام شرکت یا فرد"
                    required
                    disabled={submitting}
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@company.com"
                    className="font-vazir"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-vazir">تلفن</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="font-vazir">وب‌سایت</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://company.com"
                    className="font-vazir"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* آدرس */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">آدرس</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="font-vazir">آدرس</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="آدرس کامل..."
                    rows={3}
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-vazir">شهر</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="تهران"
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="font-vazir">استان</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="تهران"
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* اطلاعات کسب‌وکار */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">اطلاعات کسب‌وکار</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-vazir">صنعت</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="فناوری اطلاعات"
                    className="font-vazir"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size" className="font-vazir">اندازه شرکت</Label>
                  <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب اندازه شرکت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10" className="font-vazir">۱-۱۰ نفر</SelectItem>
                      <SelectItem value="11-50" className="font-vazir">۱۱-۵۰ نفر</SelectItem>
                      <SelectItem value="51-200" className="font-vazir">۵۱-۲۰۰ نفر</SelectItem>
                      <SelectItem value="201-1000" className="font-vazir">۲۰۱-۱۰۰۰ نفر</SelectItem>
                      <SelectItem value="1000+" className="font-vazir">بیش از ۱۰۰۰ نفر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_revenue" className="font-vazir">درآمد سالانه (تومان)</Label>
                  <Input
                    id="annual_revenue"
                    type="number"
                    value={formData.annual_revenue}
                    onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                    placeholder="۱۰۰۰۰۰۰۰۰"
                    className="font-vazir"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* تنظیمات CRM */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-vazir">تنظیمات CRM</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="segment" className="font-vazir">بخش *</Label>
                  <Select value={formData.segment} onValueChange={(value) => handleInputChange('segment', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب بخش" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise" className="font-vazir">سازمانی</SelectItem>
                      <SelectItem value="small_business" className="font-vazir">کسب‌وکار کوچک</SelectItem>
                      <SelectItem value="individual" className="font-vazir">فردی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="font-vazir">اولویت</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب اولویت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="font-vazir">پایین</SelectItem>
                      <SelectItem value="medium" className="font-vazir">متوسط</SelectItem>
                      <SelectItem value="high" className="font-vazir">بالا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-vazir">وضعیت</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="font-vazir">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect" className="font-vazir">نیاز به پیگیری</SelectItem>
                      <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                      <SelectItem value="inactive" className="font-vazir">غیرفعال</SelectItem>
                      <SelectItem value="customer" className="font-vazir">مشتری</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                type="submit"
                disabled={submitting || !formData.name}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره تغییرات
                  </>
                )}
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