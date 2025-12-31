'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/lib/types';
import { ImportDialog } from '@/components/ui/import-dialog';

import {
  Plus,
  Users,
  TrendingUp,
  Star,
  Search,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  Calendar,
  Target,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Tag,
  DollarSign,
  RefreshCw,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import moment from 'moment-jalaali';

// تعریف فیلدهای ایمپورت مشتریان (مطابق با فرمت اکسل)
// ترتیب فیلدها مطابق با فایل اکسل شما
const customerImportFields = [
  { key: 'name', label: 'نام و نام خانوادگی', required: true },
  { key: 'company_name', label: 'نام شرکت', required: false },
  { key: 'segment', label: 'بخش', required: false },
  { key: 'email', label: 'ایمیل', required: false },
  { key: 'phone', label: 'تلفن', required: false },
  { key: 'priority', label: 'اولویت', required: false },
  { key: 'address', label: 'آدرس', required: false },
  { key: 'city', label: 'شهر', required: false },
  { key: 'state', label: 'استان', required: false },
  { key: 'industry', label: 'صنعت', required: false },
  { key: 'company_size', label: 'اندازه شرکت', required: false },
  { key: 'annual_revenue', label: 'درآمد سالیانه', required: false },
  { key: 'website', label: 'وبسایت', required: false },
];

export default function CustomersPage() {
  const router = useRouter();
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleImport = async (file: File, mappings: Record<string, string>) => {
    console.log('🚀 Starting import with mappings:', mappings);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mappings', JSON.stringify(mappings));

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      console.log('📤 Sending request to /api/import/customers');
      const response = await fetch('/api/tenant/import/customers', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': (params?.tenant_key as string) || tenantKey,
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh customers list
      await loadCustomers();
      return result;

    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  };
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const [cityFilter, setCityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // States for filter options
  const [industries, setIndustries] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const { toast } = useToast();

  // Utility function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load customers on component mount and when filters/page change
  useEffect(() => {
    loadCustomers();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, segmentFilter, priorityFilter, industryFilter, cityFilter, sourceFilter, productFilter, typeFilter]);

  // Load filter options and stats
  useEffect(() => {
    loadFilterOptions();
    loadStats();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // TODO: Implement filter-options API
      // const response = await fetch('/api/tenant/customers/filter-options');
      // const data = await response.json();

      // if (data.success) {
      //   setIndustries(data.industries || []);
      //   setAssignedUsers(data.assignedUsers || []);
      //   setCities(data.cities || []);
      //   setSources(data.sources || []);
      //   setProducts(data.products || []);
      // }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/customers/stats', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (segmentFilter !== 'all') params.append('segment', segmentFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (industryFilter !== 'all') params.append('industry', industryFilter);
      if (cityFilter !== 'all') params.append('city', cityFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (productFilter !== 'all') params.append('product', productFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const token = getAuthToken();
      const response = await fetch(`/api/tenant/customers?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers || data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCustomers(data.pagination.total || 0);
        }
      } else {
        setError(data.message || 'خطا در دریافت مشتریان');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'inactive': return 'غیرفعال';
      case 'follow_up': return 'نیاز به پیگیری';
      case 'rejected': return 'رد شده';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'follow_up': return 'destructive';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'enterprise': return 'سازمانی';
      case 'small_business': return 'کسب‌وکار کوچک';
      case 'individual': return 'فردی';
      default: return segment;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'بالا';
      case 'medium': return 'متوسط';
      case 'low': return 'پایین';
      default: return priority || 'متوسط';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lead': return 'سرنخ';
      case 'customer': return 'مشتری';
      default: return type || 'سرنخ';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'new_lead': return 'لید جدید';
      case 'contacted': return 'تماس برقرار شده';
      case 'needs_analysis': return 'نیازسنجی';
      case 'proposal_sent': return 'ارسال پیشنهاد';
      case 'negotiation': return 'مذاکره';
      case 'closed_won': return 'بسته شده - برنده';
      case 'closed_lost': return 'بسته شده - بازنده';
      default: return stage;
    }
  };

  const getStageProgress = (stage: string) => {
    const stages = ['new_lead', 'contacted', 'needs_analysis', 'proposal_sent', 'negotiation', 'closed_won'];
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const columns = [
    {
      key: 'name',
      label: 'مشتری',
      sortable: true,
      render: (value: string, row: Customer) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-white font-vazir">
              {value.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/dashboard/customers/${row.id}`}
              className="font-medium font-vazir hover:text-primary transition-colors"
            >
              {value}
            </Link>
            <div className="flex items-center space-x-2 space-x-reverse mt-1">
              <span className="text-sm text-muted-foreground font-vazir">{row.email}</span>
              {row.priority === 'high' && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'نوع',
      sortable: true,
      render: (value: string) => (
        <Badge className={`font-vazir ${getTypeColor(value)}`}>
          {getTypeLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'وضعیت',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getStatusColor(value)} className={`font-vazir ${getStatusBadgeClass(value)}`}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'segment',
      label: 'بخش',
      sortable: true,
      render: (value: string) => (
        <span className="font-vazir">{getSegmentLabel(value)}</span>
      ),
    },
    {
      key: 'salesPipeline',
      label: 'مسیر فروش',
      render: (value: any, row: Customer) => {
        if (!value) return <span className="text-muted-foreground font-vazir">تعریف نشده</span>;

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-vazir">{getStageName(value.currentStage)}</span>
              <span className="text-xs text-muted-foreground font-vazir">
                %{value.successProbability?.toLocaleString('fa-IR')}
              </span>
            </div>
            <Progress value={getStageProgress(value.currentStage)} className="h-1" />
          </div>
        );
      },
    },
    {
      key: 'potentialValue',
      label: 'ارزش بالقوه',
      sortable: true,
      render: (value: number) => (
        <span className="font-vazir font-medium">
          {value ? `${(value / 1000000).toLocaleString('fa-IR')}M تومان` : 'تعریف نشده'}
        </span>
      ),
    },
    {
      key: 'satisfactionScore',
      label: 'رضایت',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1 space-x-reverse">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-vazir">{value?.toLocaleString('fa-IR') || 'ندارد'}</span>
        </div>
      ),
    },
    {
      key: 'interested_products_names',
      label: 'محصولات علاقه‌مند',
      render: (value: string, row: any) => (
        <div className="max-w-xs">
          {value ? (
            <div className="text-sm font-vazir">
              <span className="text-muted-foreground">
                {row.interested_products_count || 0} محصول
              </span>
              <div className="text-xs text-muted-foreground mt-1 truncate" title={value}>
                {value}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground font-vazir text-sm">بدون علاقه‌مندی</span>
          )}
        </div>
      ),
    },
    {
      key: 'assigned_user_name',
      label: 'اضافه شده توسط',
      sortable: true,
      render: (value: string, row: Customer) => (
        <span className="font-vazir">{value || row.assignedTo || 'نامشخص'}</span>
      ),
    },
    {
      key: 'lastInteraction',
      label: 'آخرین تعامل',
      sortable: true,
      render: (value: string) => (
        <span className="font-vazir">
          {value ? new Date(value).toLocaleDateString('fa-IR') : 'ندارد'}
        </span>
      ),
    },
  ];

  const handleEditCustomer = (customer: Customer) => {
    // هدایت به صفحه ویرایش مشتری
    router.push(`/dashboard/customers/${customer.id}/edit`);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`آیا از حذف مشتری "${customer.name}" اطمینان دارید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tenant/customers/${customer.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Key': (params?.tenant_key as string) || tenantKey
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفقیت",
          description: "مشتری با موفقیت حذف شد",
        });
        loadCustomers(); // بارگذاری مجدد لیست
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در حذف مشتری",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    moment.loadPersian({ dialect: 'persian-modern' });

    const exportData = customers.map(customer => ({
      'نام': customer.name,
      'ایمیل': customer.email || '-',
      'تلفن': customer.phone || '-',
      'شرکت': customer.company_name || '-',
      'وضعیت': getStatusLabel(customer.status),
      'بخش': getSegmentLabel(customer.segment || ''),
      'اولویت': getPriorityLabel(customer.priority || ''),
      'ارزش بالقوه': customer.potentialValue ? `${(customer.potentialValue / 1000000).toLocaleString('fa-IR')} میلیون تومان` : '-',
      'امتیاز رضایت': customer.satisfaction_score ? parseFloat(customer.satisfaction_score.toString()).toLocaleString('fa-IR') : '-',
      'مسئول': customer.assigned_user_name || '-',
      'آخرین تعامل': customer.last_interaction ? moment(customer.last_interaction).format('jYYYY/jMM/jDD') : '-',
      'تاریخ ایجاد': customer.created_at ? moment(customer.created_at).format('jYYYY/jMM/jDD') : '-',
      'یادداشت': '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'مشتریان');

    const fileName = `customers_${moment().format('jYYYY-jMM-jDD')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "موفق",
      description: "فایل اکسل با موفقیت دانلود شد"
    });
  };

  // آمار مشتریان (از کل دیتابیس)
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const followUpCustomers = customers.filter(c => c.status === 'follow_up').length;
  const enterpriseCustomers = customers.filter(c => c.segment === 'enterprise').length;
  const avgSatisfaction = customers.length > 0 ? customers.reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / customers.length : 0;
  const totalPotentialValue = customers.reduce((sum, c) => sum + (c.potentialValue || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-vazir">در حال بارگذاری مشتریان...</p>
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
            مدیریت مشتریان
          </h1>
          <p className="text-muted-foreground font-vazir mt-2">مدیریت کامل مشتریان و فرآیند فروش</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" onClick={() => { loadCustomers(); loadStats(); }} disabled={loading} className="font-vazir">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={customers.length === 0}
            className="font-vazir"
          >
            <FileSpreadsheet className="h-4 w-4 ml-2" />
            خروجی اکسل
          </Button>
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="font-vazir"
          >
            <Upload className="h-4 w-4 ml-2" />
            ایمپورت از اکسل
          </Button>
          <Link href="/dashboard/customers/new">
            <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir">
              <Plus className="h-4 w-4 ml-2" />
              افزودن مشتری
            </Button>
          </Link>
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleImport}
        fields={customerImportFields}
        title="ایمپورت مشتریان از اکسل"
        type="customers"
      />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 space-x-reverse text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-vazir">{error}</span>
              <Button variant="outline" size="sm" onClick={loadCustomers} className="mr-auto font-vazir">
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">کل مشتریان</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">{(stats.total_customers || 0).toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">فعال</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 font-vazir">{(stats.active_customers || 0).toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">نیاز به پیگیری</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 font-vazir">{(stats.follow_up_customers || 0).toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">سازمانی</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">{(stats.enterprise_customers || 0).toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">میانگین رضایت</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 font-vazir">{(stats.avg_satisfaction || 0).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}</div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">ارزش کل</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">
              {stats.total_potential_value > 0 ? `${(stats.total_potential_value / 1000000000).toFixed(1)}B تومان` : '۰ تومان'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فیلترها */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
            <Filter className="h-5 w-5" />
            <span>فیلتر مشتریان</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-9">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی نام، ایمیل یا تلفن..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 font-vazir"
                dir="rtl"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="نوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه انواع</SelectItem>
                <SelectItem value="lead" className="font-vazir">سرنخ</SelectItem>
                <SelectItem value="customer" className="font-vazir">مشتری</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه وضعیت‌ها</SelectItem>
                <SelectItem value="active" className="font-vazir">فعال</SelectItem>
                <SelectItem value="inactive" className="font-vazir">غیرفعال</SelectItem>
                <SelectItem value="follow_up" className="font-vazir">نیاز به پیگیری</SelectItem>
                <SelectItem value="rejected" className="font-vazir">رد شده</SelectItem>
                <SelectItem value="prospect" className="font-vazir">احتمالی</SelectItem>
                <SelectItem value="customer" className="font-vazir">مشتری</SelectItem>
              </SelectContent>
            </Select>

            <Select value={segmentFilter} onValueChange={(value) => {
              setSegmentFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="بخش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه بخش‌ها</SelectItem>
                <SelectItem value="enterprise" className="font-vazir">سازمانی</SelectItem>
                <SelectItem value="small_business" className="font-vazir">کسب‌وکار کوچک</SelectItem>
                <SelectItem value="individual" className="font-vazir">فردی</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => {
              setPriorityFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه اولویت‌ها</SelectItem>
                <SelectItem value="high" className="font-vazir">بالا</SelectItem>
                <SelectItem value="medium" className="font-vazir">متوسط</SelectItem>
                <SelectItem value="low" className="font-vazir">پایین</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={(value) => {
              setIndustryFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="صنعت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه صنایع</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry} className="font-vazir">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>



            <Select value={cityFilter} onValueChange={(value) => {
              setCityFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="شهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه شهرها</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city} className="font-vazir">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={(value) => {
              setProductFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="محصول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه محصولات</SelectItem>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id} className="font-vazir">
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSegmentFilter('all');
                setPriorityFilter('all');
                setIndustryFilter('all');
                setCityFilter('all');
                setSourceFilter('all');
                setProductFilter('all');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className="font-vazir"
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* مشتریان اولویت بالا */}
      {customers.filter(c => c.priority === 'high').length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-red-700 dark:text-red-300 font-vazir">
              <AlertTriangle className="h-5 w-5" />
              <span>مشتریان اولویت بالا</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {customers.filter(c => c.priority === 'high').map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-vazir">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium font-vazir">{customer.name}</p>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant={getStatusColor(customer.status)} className={`font-vazir ${getStatusBadgeClass(customer.status)}`}>
                          {getStatusLabel(customer.status)}
                        </Badge>
                        {customer.potentialValue && (
                          <span className="text-sm text-muted-foreground font-vazir">
                            {(customer.potentialValue / 1000000).toLocaleString('fa-IR')}M تومان
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button size="sm" variant="outline" className="font-vazir">
                      <Phone className="h-4 w-4 ml-1" />
                      تماس
                    </Button>
                    <Link href={`/dashboard/customers/${customer.id}`}>
                      <Button size="sm" className="font-vazir">
                        <Eye className="h-4 w-4 ml-1" />
                        مشاهده
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول مشتریان */}
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-vazir">
              همه مشتریان ({totalCustomers.toLocaleString('fa-IR')} مورد)
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-vazir">تعداد در صفحه:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 font-vazir">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="font-vazir">۱۰</SelectItem>
                  <SelectItem value="20" className="font-vazir">۲۰</SelectItem>
                  <SelectItem value="50" className="font-vazir">۵۰</SelectItem>
                  <SelectItem value="100" className="font-vazir">۱۰۰</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-vazir">مشتری‌ای یافت نشد</p>
              <Link href="/dashboard/customers/new">
                <Button className="mt-4 font-vazir">
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن اولین مشتری
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <DataTable
                data={customers}
                columns={columns}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                searchable={false}
                pageSize={customers.length}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground font-vazir space-y-1">
                    <div>
                      نمایش {((currentPage - 1) * itemsPerPage + 1).toLocaleString('fa-IR')} تا {Math.min(currentPage * itemsPerPage, totalCustomers).toLocaleString('fa-IR')} از {totalCustomers.toLocaleString('fa-IR')} مورد
                    </div>
                    <div>
                      صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="font-vazir"
                    >
                      قبلی
                    </Button>

                    {/* صفحات */}
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="font-vazir w-8 h-8 p-0"
                          >
                            {pageNum.toLocaleString('fa-IR')}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="font-vazir"
                    >
                      بعدی
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}