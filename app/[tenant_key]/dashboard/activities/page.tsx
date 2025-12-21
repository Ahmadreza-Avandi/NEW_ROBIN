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
  X,
  Users,
  ShoppingCart,
  DollarSign,
  Package
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

interface RecentItem {
  id: string;
  name: string;
  date?: string;
  type?: string;
  amount?: number;
}

export default function ActivitiesPage() {
  const params = useParams();
  const tenantKey = Array.isArray(params?.tenant_key) ? params.tenant_key[0] : (params?.tenant_key as string) || '';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('today'); // Default to today
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [performedByFilter, setPerformedByFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Recent data states
  const [recentMeetings, setRecentMeetings] = useState<RecentItem[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentItem[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentItem[]>([]);
  
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
    // Set today's date as default
    if (dateFilter === 'today') {
      const today = moment().format('jYYYY/jMM/jDD');
      setStartDate(today);
      setEndDate(today);
    } else if (dateFilter === 'week') {
      const startOfWeek = moment().startOf('week').format('jYYYY/jMM/jDD');
      const endOfWeek = moment().endOf('week').format('jYYYY/jMM/jDD');
      setStartDate(startOfWeek);
      setEndDate(endOfWeek);
    } else if (dateFilter === 'month') {
      const startOfMonth = moment().startOf('month').format('jYYYY/jMM/jDD');
      const endOfMonth = moment().endOf('month').format('jYYYY/jMM/jDD');
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    } else if (dateFilter === 'all') {
      setStartDate('');
      setEndDate('');
    }
  }, [dateFilter]);

  useEffect(() => {
    loadActivities();
    loadCustomers();
    loadCoworkers();
  }, [searchTerm, filterType, startDate, endDate, performedByFilter, selectedCustomer]);

  // Update recent data when activities change
  useEffect(() => {
    if (activities.length > 0) {
      updateRecentData();
    } else {
      loadRecentData();
    }
  }, [activities]);

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

  const updateRecentData = () => {
    // Get recent meetings from current activities
    const meetings = activities
      .filter(a => a.type === 'meeting')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        name: m.title,
        date: m.start_time,
        type: m.customer_name || 'نامشخص'
      }));
    setRecentMeetings(meetings);

    // Get recent calls from current activities
    const calls = activities
      .filter(a => a.type === 'call')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        name: c.title,
        date: c.start_time,
        type: c.customer_name || 'نامشخص'
      }));
    setRecentCalls(calls);
  };

  const loadRecentData = async () => {
    try {
      const token = getAuthToken();
      
      // Load recent meetings (from activities table)
      const meetingsResponse = await fetch(`/api/tenant/activities?type=meeting&limit=3&sort=desc`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const meetingsData = await meetingsResponse.json();
      if (meetingsData.success && meetingsData.data) {
        setRecentMeetings(meetingsData.data.slice(0, 3).map((m: Activity) => ({
          id: m.id,
          name: m.title,
          date: m.start_time,
          type: m.customer_name || 'نامشخص'
        })));
      }

      // Load recent calls (from activities table)
      const callsResponse = await fetch(`/api/tenant/activities?type=call&limit=3&sort=desc`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const callsData = await callsResponse.json();
      if (callsData.success && callsData.data) {
        setRecentCalls(callsData.data.slice(0, 3).map((c: Activity) => ({
          id: c.id,
          name: c.title,
          date: c.start_time,
          type: c.customer_name || 'نامشخص'
        })));
      }

      // Load recent customers (last 3 created)
      const customersResponse = await fetch(`/api/tenant/customers?limit=3&sort=created_at&order=desc`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const customersData = await customersResponse.json();
      if (customersData.success && customersData.data) {
        setRecentCustomers(customersData.data.slice(0, 3).map((c: any) => ({
          id: c.id,
          name: c.name,
          date: c.created_at,
          type: c.segment || 'مشتری'
        })));
      }

      // Load recent products (last 3 created)
      const productsResponse = await fetch(`/api/tenant/products/list?limit=50`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const productsData = await productsResponse.json();
      if (productsData.success && productsData.data) {
        // Sort by creation date and take last 3
        const sortedProducts = productsData.data
          .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 3);
        
        setRecentProducts(sortedProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.category || 'محصول'
        })));
      }

      // Load recent sales (last 3)
      const salesResponse = await fetch(`/api/tenant/sales?limit=3&sort=desc`, {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const salesData = await salesResponse.json();
      if (salesData.success && salesData.data) {
        setRecentSales(salesData.data.slice(0, 3).map((s: any) => ({
          id: s.id,
          name: s.customer_name || 'نامشخص',
          date: s.sale_date,
          amount: s.total_amount
        })));
      }
    } catch (error) {
      console.error('Error loading recent data:', error);
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
          'X-Tenant-Key': tenantKey,
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
    <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-blue-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
            <ActivityIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              مدیریت فعالیت‌ها
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-vazir mt-1">پیگیری و ثبت تمام تعاملات با مشتریان</p>
          </div>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" onClick={loadActivities} disabled={loading} className="font-vazir shadow hover:shadow-lg transition-all">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-vazir shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-lg"
          >
            <Plus className="h-5 w-5 ml-2" />
            فعالیت جدید
          </Button>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium font-vazir text-white/90">کل فعالیت‌ها</CardTitle>
            <ActivityIcon className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-vazir">{activities.length.toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium font-vazir text-white/90">تماس‌ها</CardTitle>
            <Phone className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-vazir">
              {activities.filter(a => a.type === 'call').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium font-vazir text-white/90">جلسات</CardTitle>
            <Calendar className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-vazir">
              {activities.filter(a => a.type === 'meeting').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-500 to-orange-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium font-vazir text-white/90">نیاز به پیگیری</CardTitle>
            <AlertCircle className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-vazir">
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
            <div className="grid gap-4 md:grid-cols-5">
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

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="font-vazir">
                  <SelectValue placeholder="فیلتر زمانی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today" className="font-vazir">امروز</SelectItem>
                  <SelectItem value="week" className="font-vazir">این هفته</SelectItem>
                  <SelectItem value="month" className="font-vazir">این ماه</SelectItem>
                  <SelectItem value="custom" className="font-vazir">سفارشی</SelectItem>
                  <SelectItem value="all" className="font-vazir">همه</SelectItem>
                </SelectContent>
              </Select>

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
                      {coworker.name || coworker.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setDateFilter('today');
                  setPerformedByFilter('all');
                  setSelectedCustomer(null);
                }}
                className="font-vazir"
              >
                <X className="h-4 w-4 ml-2" />
                پاک کردن فیلترها
              </Button>
            </div>

            {/* ردیف دوم - فیلتر تاریخ سفارشی و مشتری */}
            {dateFilter === 'custom' && (
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
              </div>
            )}

            {/* فیلتر مشتری */}
            <div className="grid gap-4 md:grid-cols-1">
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
            {(dateFilter !== 'today' || selectedCustomer || performedByFilter !== 'all' || filterType !== 'all' || searchTerm) && (
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

                {dateFilter !== 'today' && (
                  <Badge variant="secondary" className="font-vazir">
                    زمان: {dateFilter === 'week' ? 'این هفته' : 
                           dateFilter === 'month' ? 'این ماه' : 
                           dateFilter === 'all' ? 'همه' : 'سفارشی'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setDateFilter('today')}
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
                    همکار: {coworkers.find(c => c.id === performedByFilter)?.name || 'نامشخص'}
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

      {/* کادرهای مینیمال - فعالیت‌های اخیر */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* جلسات اخیر */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-vazir text-green-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              جلسات اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => (
                <div key={meeting.id} className="text-xs border-b border-green-100 pb-1 last:border-b-0">
                  <div className="font-medium text-green-800 truncate">{meeting.name}</div>
                  <div className="text-green-600 text-[10px]">{meeting.type}</div>
                  <div className="text-green-500 text-[10px]">
                    {new Date(meeting.date).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-green-600">جلسه‌ای ثبت نشده</div>
            )}
          </CardContent>
        </Card>

        {/* تماس‌های اخیر */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-50 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-vazir text-blue-700 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              تماس‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentCalls.length > 0 ? (
              recentCalls.map((call) => (
                <div key={call.id} className="text-xs border-b border-blue-100 pb-1 last:border-b-0">
                  <div className="font-medium text-blue-800 truncate">{call.name}</div>
                  <div className="text-blue-600 text-[10px]">{call.type}</div>
                  <div className="text-blue-500 text-[10px]">
                    {new Date(call.date).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-blue-600">تماسی ثبت نشده</div>
            )}
          </CardContent>
        </Card>

        {/* مشتریان اخیر */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-50 border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-vazir text-purple-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              مشتریان اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="text-xs border-b border-purple-100 pb-1 last:border-b-0">
                  <div className="font-medium text-purple-800 truncate">{customer.name}</div>
                  <div className="text-purple-600 text-[10px]">{customer.type || 'مشتری'}</div>
                  <div className="text-purple-500 text-[10px]">
                    {customer.date ? new Date(customer.date).toLocaleDateString('fa-IR') : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-purple-600">مشتری جدیدی نیست</div>
            )}
          </CardContent>
        </Card>

        {/* محصولات اخیر */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-50 border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-vazir text-orange-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              محصولات اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="text-xs border-b border-orange-100 pb-1 last:border-b-0">
                  <div className="font-medium text-orange-800 truncate">{product.name}</div>
                  <div className="text-orange-600 text-[10px]">{product.type || 'محصول'}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-orange-600">محصول جدیدی نیست</div>
            )}
          </CardContent>
        </Card>

        {/* فروش‌های اخیر */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-vazir text-emerald-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              فروش‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="text-xs border-b border-emerald-100 pb-1 last:border-b-0">
                  <div className="font-medium text-emerald-800 truncate">{sale.name}</div>
                  <div className="text-emerald-600 text-[10px]">
                    {sale.amount ? `${sale.amount.toLocaleString('fa-IR')} تومان` : 'فروش'}
                  </div>
                  <div className="text-emerald-500 text-[10px]">
                    {sale.date ? new Date(sale.date).toLocaleDateString('fa-IR') : ''}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-emerald-600">فروش جدیدی نیست</div>
            )}
          </CardContent>
        </Card>
      </div>

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