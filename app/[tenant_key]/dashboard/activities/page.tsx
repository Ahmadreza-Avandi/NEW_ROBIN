'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import { CustomerSearch } from '@/components/ui/customer-search';
import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });
import {
  Plus,
  Phone,
  Calendar,
  Mail,
  Clock,
  Filter,
  Search,
  AlertCircle,
  Activity as ActivityIcon,
  Trash2,
  RefreshCw,
  User,
  CalendarDays,
  X
} from 'lucide-react';

interface Activity {
  id: string;
  customer_id: string;
  customer_name: string;
  type: string;
  title: string;
  description?: string;
  start_time: string;
  outcome: string;
  performed_by_name?: string;
  created_at: string;
}

export default function ActivitiesPage() {
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [performedByFilter, setPerformedByFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();

  const [newActivity, setNewActivity] = useState({
    customer_id: '',
    type: 'call',
    title: '',
    description: '',
    outcome: 'completed'
  });

  // Get auth token from cookies
  const getAuthToken = () => {
    if (typeof document === 'undefined') return '';
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1] || '';
  };

  useEffect(() => {
    loadActivities();
    loadCustomers();
    loadCoworkers();
  }, [searchTerm, filterType, startDate, endDate, performedByFilter, selectedCustomer]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      if (startDate) {
        // Convert Persian date to Gregorian
        const parts = startDate.split('/');
        if (parts.length === 3) {
          const gregorianDate = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
          params.append('start_date', gregorianDate);
        }
      }
      if (endDate) {
        // Convert Persian date to Gregorian
        const parts = endDate.split('/');
        if (parts.length === 3) {
          const gregorianDate = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
          params.append('end_date', gregorianDate);
        }
      }
      if (performedByFilter !== 'all') params.append('performed_by', performedByFilter);
      if (selectedCustomer) params.append('customer_id', selectedCustomer.id);

      const token = getAuthToken();
      const response = await fetch(`/api/tenant/activities?${params.toString()}`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setActivities(data.data || []);
      } else {
        setError(data.message || 'خطا در دریافت فعالیت‌ها');
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/customers-simple?limit=1000', {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
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

  const loadCoworkers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/coworkers', {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setCoworkers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading coworkers:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.customer_id || !newActivity.title) {
      setError('مشتری و عنوان الزامی است');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          ...newActivity,
          start_time: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "فعالیت با موفقیت ثبت شد",
        });
        setShowAddForm(false);
        setNewActivity({
          customer_id: '',
          type: 'call',
          title: '',
          description: '',
          outcome: 'completed'
        });
        loadActivities();
      } else {
        setError(data.message || 'خطا در ثبت فعالیت');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      setError('خطا در اتصال به سرور');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('آیا از حذف این فعالیت اطمینان دارید؟')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tenant/activities?id=${activityId}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "فعالیت با موفقیت حذف شد",
        });
        loadActivities();
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در حذف فعالیت",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'email': return Mail;
      default: return ActivityIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'تماس تلفنی';
      case 'meeting': return 'جلسه';
      case 'email': return 'ایمیل';
      default: return type;
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'completed': return 'تکمیل شده';
      case 'follow_up_needed': return 'نیاز به پیگیری';
      case 'successful': return 'موفق';
      default: return outcome;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'follow_up_needed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'successful': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-vazir">در حال بارگذاری فعالیت‌ها...</p>
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
            مدیریت فعالیت‌ها
          </h1>
          <p className="text-muted-foreground font-vazir mt-2">پیگیری و ثبت تمام تعاملات با مشتریان</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" onClick={loadActivities} disabled={loading} className="font-vazir">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
          >
            <Plus className="h-4 w-4 ml-2" />
            فعالیت جدید
          </Button>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">کل فعالیت‌ها</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">{activities.length.toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">تماس‌ها</CardTitle>
            <Phone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 font-vazir">
              {activities.filter(a => a.type === 'call').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">جلسات</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 font-vazir">
              {activities.filter(a => a.type === 'meeting').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">نیاز به پیگیری</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 font-vazir">
              {activities.filter(a => a.outcome === 'follow_up_needed').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فرم افزودن فعالیت */}
      {showAddForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-vazir">ثبت فعالیت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 font-vazir">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-vazir">مشتری *</Label>
                <CustomerSearch
                  customers={customers}
                  selectedCustomer={customers.find(c => c.id === newActivity.customer_id)}
                  onCustomerSelect={(customer) => setNewActivity({ ...newActivity, customer_id: customer?.id || '' })}
                  placeholder="جستجو و انتخاب مشتری..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">نوع فعالیت</Label>
                <Select value={newActivity.type} onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}>
                  <SelectTrigger className="font-vazir">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call" className="font-vazir">تماس تلفنی</SelectItem>
                    <SelectItem value="meeting" className="font-vazir">جلسه</SelectItem>
                    <SelectItem value="email" className="font-vazir">ایمیل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">عنوان *</Label>
                <Input
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="عنوان فعالیت"
                  className="font-vazir"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir">نتیجه</Label>
                <Select value={newActivity.outcome} onValueChange={(value) => setNewActivity({ ...newActivity, outcome: value })}>
                  <SelectTrigger className="font-vazir">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed" className="font-vazir">تکمیل شده</SelectItem>
                    <SelectItem value="follow_up_needed" className="font-vazir">نیاز به پیگیری</SelectItem>
                    <SelectItem value="successful" className="font-vazir">موفق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="font-vazir">توضیحات</Label>
                <Textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="توضیحات تفصیلی فعالیت..."
                  rows={3}
                  className="font-vazir"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse mt-6">
              <Button onClick={handleAddActivity} className="font-vazir">
                ثبت فعالیت
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setError('');
              }} className="font-vazir">
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* فیلترها */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
            <Filter className="h-5 w-5" />
            <span>فیلتر فعالیت‌ها</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* ردیف اول فیلترها */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی عنوان یا مشتری..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 font-vazir"
                  dir="rtl"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="font-vazir">
                  <SelectValue placeholder="نوع فعالیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-vazir">همه انواع</SelectItem>
                  <SelectItem value="call" className="font-vazir">تماس تلفنی</SelectItem>
                  <SelectItem value="meeting" className="font-vazir">جلسه</SelectItem>
                  <SelectItem value="email" className="font-vazir">ایمیل</SelectItem>
                </SelectContent>
              </Select>

              <Select value={performedByFilter} onValueChange={setPerformedByFilter}>
                <SelectTrigger className="font-vazir">
                  <SelectValue placeholder="فیلتر همکار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-vazir">همه همکاران</SelectItem>
                  {coworkers.map(coworker => (
                    <SelectItem key={coworker.id} value={coworker.id} className="font-vazir">
                      {coworker.full_name || coworker.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setStartDate('');
                  setEndDate('');
                  setPerformedByFilter('all');
                  setSelectedCustomer(null);
                }}
                className="font-vazir"
              >
                <X className="h-4 w-4 ml-2" />
                پاک کردن فیلترها
              </Button>
            </div>

            {/* ردیف دوم - فیلتر تاریخ و مشتری */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  تاریخ شروع (فارسی)
                </Label>
                <PersianDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="انتخاب تاریخ شروع"
                  className="font-vazir"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  تاریخ پایان (فارسی)
                </Label>
                <PersianDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="انتخاب تاریخ پایان"
                  className="font-vazir"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-vazir flex items-center gap-2">
                  <User className="h-4 w-4" />
                  فیلتر بر اساس مشتری
                </Label>
                <CustomerSearch
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onCustomerSelect={setSelectedCustomer}
                  placeholder="جستجو و انتخاب مشتری..."
                />
              </div>
            </div>

            {/* نمایش فیلترهای فعال */}
            {(startDate || endDate || selectedCustomer || performedByFilter !== 'all' || filterType !== 'all' || searchTerm) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm font-vazir text-muted-foreground">فیلترهای فعال:</span>

                {searchTerm && (
                  <Badge variant="secondary" className="font-vazir">
                    جستجو: {searchTerm}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filterType !== 'all' && (
                  <Badge variant="secondary" className="font-vazir">
                    نوع: {getTypeLabel(filterType)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setFilterType('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {startDate && (
                  <Badge variant="secondary" className="font-vazir">
                    از تاریخ: {startDate}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setStartDate('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {endDate && (
                  <Badge variant="secondary" className="font-vazir">
                    تا تاریخ: {endDate}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setEndDate('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {selectedCustomer && (
                  <Badge variant="secondary" className="font-vazir">
                    مشتری: {selectedCustomer.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {performedByFilter !== 'all' && (
                  <Badge variant="secondary" className="font-vazir">
                    همکار: {coworkers.find(c => c.id === performedByFilter)?.full_name || 'نامشخص'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setPerformedByFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* لیست فعالیت‌ها */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ActivityIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium font-vazir mb-2">فعالیتی یافت نشد</h3>
              <p className="text-muted-foreground font-vazir mb-4">
                اولین فعالیت خود را ثبت کنید
              </p>
              <Button onClick={() => setShowAddForm(true)} className="font-vazir">
                <Plus className="h-4 w-4 ml-2" />
                ثبت فعالیت
              </Button>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);

            return (
              <Card key={activity.id} className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 space-x-reverse mb-2">
                          <h4 className="font-medium font-vazir">{activity.title}</h4>
                          <Badge className={`font-vazir ${getActivityColor(activity.type)}`}>
                            {getTypeLabel(activity.type)}
                          </Badge>
                          <Badge className={`font-vazir ${getOutcomeColor(activity.outcome)}`}>
                            {getOutcomeLabel(activity.outcome)}
                          </Badge>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 mt-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-vazir">{activity.customer_name}</span>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-vazir">
                              {new Date(activity.start_time).toLocaleDateString('fa-IR')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-vazir">
                              {activity.performed_by_name || 'نامشخص'}
                            </span>
                          </div>
                        </div>

                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-3 font-vazir">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-vazir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}