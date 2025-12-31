'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Users,
  Target,
  Thermometer,
  Calendar,
  User,
  BarChart3,
  List,
  Columns,
  Download
} from 'lucide-react';

// Import types
import { 
  Lead, 
  PipelineStage, 
  PipelineStats, 
  LeadFilters,
  CreateLeadRequest,
  PipelineStageType,
  LeadTemperature
} from '@/lib/sales-pipeline-types';

// Import components
import KanbanView from '@/components/sales-pipeline/kanban-view';
import ListView from '@/components/sales-pipeline/list-view';
import LeadDetailsModal from '@/components/sales-pipeline/lead-details-modal-simple';

export default function SalesPipelinePage() {
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';
  const { toast } = useToast();

  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View and filter state
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');
  const [filters, setFilters] = useState<LeadFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // New lead dialog state
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [newLead, setNewLead] = useState<CreateLeadRequest>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    deal_value: undefined,
    success_probability: 50,
    sales_owner: '',
    next_action_date: '',
    source: '',
    notes: ''
  });

  // Lead details modal state
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Utility function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  // Load pipeline data
  useEffect(() => {
    loadPipelineData();
  }, [tenantKey]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setLeads(data.data.leads || []);
        setStages(data.data.stages || []);
        setStats(data.data.stats || null);
      } else {
        setError(data.message || 'خطا در دریافت اطلاعات پایپ‌لاین');
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
      setError('مشکل در اتصال به سرور - لطفاً صفحه را رفرش کنید');
      setLeads([]);
      setStages([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // This will be implemented when we have the actual data
    // For now, we'll just trigger a re-render
  };

  const handleCreateLead = async () => {
    try {
      if (!newLead.name.trim()) {
        toast({
          title: "خطا",
          description: "نام سرنخ الزامی است",
          variant: "destructive"
        });
        return;
      }

      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        },
        body: JSON.stringify(newLead)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "موفقیت",
          description: "سرنخ جدید با موفقیت ایجاد شد",
        });
        setShowNewLeadDialog(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          company_name: '',
          deal_value: undefined,
          success_probability: 50,
          sales_owner: '',
          next_action_date: '',
          source: '',
          notes: ''
        });
        loadPipelineData();
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در ایجاد سرنخ",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const handleStageChange = async (leadId: string, newStage: PipelineStageType) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline/lead/${leadId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        },
        body: JSON.stringify({ new_stage: newStage })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "موفقیت",
          description: "مرحله سرنخ با موفقیت تغییر کرد",
        });
        loadPipelineData();
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در تغییر مرحله",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error changing stage:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '0 تومان';
    
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} میلیارد تومان`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} میلیون تومان`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} هزار تومان`;
    } else {
      return `${price.toLocaleString('fa-IR')} تومان`;
    }
  };

  const getTemperatureColor = (temperature: LeadTemperature) => {
    switch (temperature) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-yellow-600 bg-yellow-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setShowLeadDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-vazir">در حال بارگذاری پایپ‌لاین فروش...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 min-h-screen">
        <Card className="shadow-lg border-red-200">
          <CardContent className="text-center py-12">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium font-vazir mb-2 text-red-800 dark:text-red-200">مشکل در اتصال</h3>
            <p className="text-red-600 dark:text-red-400 font-vazir mb-4">{error}</p>
            <div className="space-x-2 space-x-reverse">
              <Button onClick={loadPipelineData} className="font-vazir">
                <RefreshCw className="h-4 w-4 ml-2" />
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              پایپ‌لاین فروش
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-vazir mt-1">مدیریت کامل فرآیند فروش و پیگیری سرنخ‌ها</p>
          </div>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" onClick={loadPipelineData} disabled={loading} className="font-vazir shadow hover:shadow-lg transition-all">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
          <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-vazir shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-lg">
                <Plus className="h-5 w-5 ml-2" />
                سرنخ جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="font-vazir text-xl">ایجاد سرنخ جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-vazir">نام سرنخ *</Label>
                    <Input
                      value={newLead.name}
                      onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="نام شخص یا شرکت"
                      className="font-vazir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-vazir">نام شرکت</Label>
                    <Input
                      value={newLead.company_name}
                      onChange={(e) => setNewLead(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="نام شرکت"
                      className="font-vazir"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-vazir">ایمیل</Label>
                    <Input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@domain.com"
                      className="font-vazir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-vazir">تلفن</Label>
                    <Input
                      value={newLead.phone}
                      onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="09123456789"
                      className="font-vazir"
                    />
                  </div>
                </div>

                {/* Deal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-vazir">مبلغ احتمالی معامله (تومان)</Label>
                    <Input
                      type="number"
                      value={newLead.deal_value || ''}
                      onChange={(e) => setNewLead(prev => ({ ...prev, deal_value: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="1000000"
                      className="font-vazir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-vazir">احتمال موفقیت (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newLead.success_probability}
                      onChange={(e) => setNewLead(prev => ({ ...prev, success_probability: Number(e.target.value) || 50 }))}
                      className="font-vazir"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-vazir">مسئول فروش</Label>
                    <Input
                      value={newLead.sales_owner}
                      onChange={(e) => setNewLead(prev => ({ ...prev, sales_owner: e.target.value }))}
                      placeholder="نام مسئول فروش"
                      className="font-vazir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-vazir">تاریخ اقدام بعدی</Label>
                    <Input
                      type="date"
                      value={newLead.next_action_date}
                      onChange={(e) => setNewLead(prev => ({ ...prev, next_action_date: e.target.value }))}
                      className="font-vazir"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-vazir">منبع سرنخ</Label>
                  <Input
                    value={newLead.source}
                    onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="وب‌سایت، تماس تلفنی، معرفی و..."
                    className="font-vazir"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-vazir">یادداشت</Label>
                  <Textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="توضیحات اضافی..."
                    className="font-vazir"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button variant="outline" onClick={() => setShowNewLeadDialog(false)} className="font-vazir">
                    انصراف
                  </Button>
                  <Button 
                    onClick={handleCreateLead} 
                    disabled={!newLead.name.trim()}
                    className="font-vazir bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ایجاد سرنخ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium font-vazir text-white/90">کل سرنخ‌ها</CardTitle>
              <Users className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-vazir">{stats.total_leads.toLocaleString('fa-IR')}</div>
              <p className="text-white/70 text-sm font-vazir mt-1">سرنخ فعال</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium font-vazir text-white/90">ارزش کل معاملات</CardTitle>
              <TrendingUp className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold font-vazir">
                {formatPrice(stats.total_deal_value)}
              </div>
              <p className="text-white/70 text-sm font-vazir mt-1">پتانسیل درآمد</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium font-vazir text-white/90">نرخ تبدیل</CardTitle>
              <BarChart3 className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-vazir">
                {stats.conversion_rate.toFixed(1)}%
              </div>
              <p className="text-white/70 text-sm font-vazir mt-1">موفقیت فروش</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-500 to-pink-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium font-vazir text-white/90">سرنخ‌های داغ</CardTitle>
              <Thermometer className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-vazir">
                {stats.hot_leads_count.toLocaleString('fa-IR')}
              </div>
              <p className="text-white/70 text-sm font-vazir mt-1">نیاز به پیگیری فوری</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Switcher and Filters */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
              <Filter className="h-5 w-5" />
              <span>نمایش و فیلتر</span>
            </CardTitle>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                variant={currentView === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('kanban')}
                className="font-vazir"
              >
                <Columns className="h-4 w-4 ml-2" />
                کانبان
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="font-vazir"
              >
                <List className="h-4 w-4 ml-2" />
                لیست
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی نام سرنخ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 font-vazir"
                dir="rtl"
              />
            </div>
            <Select value={filters.stage || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value === 'all' ? undefined : value as PipelineStageType }))}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="فیلتر مرحله" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه مراحل</SelectItem>
                <SelectItem value="new_lead" className="font-vazir">سرنخ جدید</SelectItem>
                <SelectItem value="contacted" className="font-vazir">تماس اولیه</SelectItem>
                <SelectItem value="needs_analysis" className="font-vazir">نیازسنجی</SelectItem>
                <SelectItem value="proposal_sent" className="font-vazir">ارسال پیشنهاد</SelectItem>
                <SelectItem value="negotiation" className="font-vazir">مذاکره</SelectItem>
                <SelectItem value="closed_won" className="font-vazir">برنده شده</SelectItem>
                <SelectItem value="closed_lost" className="font-vazir">از دست رفته</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.temperature || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, temperature: value === 'all' ? undefined : value as LeadTemperature }))}>
              <SelectTrigger className="font-vazir">
                <SelectValue placeholder="فیلتر دما" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه دماها</SelectItem>
                <SelectItem value="hot" className="font-vazir">🔥 داغ</SelectItem>
                <SelectItem value="warm" className="font-vazir">🟡 نیمه‌فعال</SelectItem>
                <SelectItem value="cold" className="font-vazir">❄️ سرد</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="مسئول فروش..."
              value={filters.owner || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, owner: e.target.value || undefined }))}
              className="font-vazir"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {currentView === 'kanban' ? (
          <KanbanView
            stages={stages}
            leads={leads}
            onStageChange={handleStageChange}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <ListView
            leads={leads}
            onSort={(column, direction) => {
              // Handle sorting - will be implemented
              console.log('Sort:', column, direction);
            }}
            onFilter={(newFilters) => {
              setFilters(newFilters);
            }}
            onBulkAction={(action, leadIds) => {
              // Handle bulk actions - will be implemented
              console.log('Bulk action:', action, leadIds);
            }}
            onLeadClick={handleLeadClick}
            onExport={() => {
              // Handle export - will be implemented
              console.log('Export leads');
            }}
          />
        )}
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isOpen={showLeadDetails}
        onClose={() => setShowLeadDetails(false)}
        leadId={selectedLeadId}
        tenantKey={tenantKey}
        onLeadUpdated={loadPipelineData}
      />
    </div>
  );
}