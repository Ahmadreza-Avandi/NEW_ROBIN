'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Target,
  Activity,
  CheckSquare,
  FileText,
  History,
  Edit,
  Save,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  ExternalLink
} from 'lucide-react';

import { Lead, PipelineStageType, LeadTemperature } from '@/lib/sales-pipeline-types';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  tenantKey: string;
  onLeadUpdated?: () => void;
}

interface LeadDetailsData {
  lead: Lead;
  stats: {
    total_activities: number;
    total_tasks: number;
    completed_tasks: number;
    total_documents: number;
    stage_changes: number;
    days_in_pipeline: number;
  };
  interested_products: any[];
  contacts: any[];
  recent_activities: any[];
  pending_tasks: any[];
  recent_documents: any[];
}

interface StageChangeData {
  new_stage: PipelineStageType;
  reason?: string;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isOpen,
  onClose,
  leadId,
  tenantKey,
  onLeadUpdated
}) => {
  const [leadData, setLeadData] = useState<LeadDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [showStageChange, setShowStageChange] = useState(false);
  const [stageChangeData, setStageChangeData] = useState<StageChangeData>({
    new_stage: 'new_lead'
  });
  const { toast } = useToast();

  // Utility function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  // Load lead details when modal opens
  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadDetails();
    }
  }, [isOpen, leadId]);

  const loadLeadDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline/lead/${leadId}/details`, {
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
        setLeadData(data.data);
        setEditedLead(data.data.lead);
        setStageChangeData({
          new_stage: data.data.lead.current_pipeline_stage
        });
      } else {
        setError(data.message || 'خطا در دریافت جزئیات سرنخ');
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
      setError('مشکل در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveChanges = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline/lead/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        },
        body: JSON.stringify(editedLead)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "موفقیت",
          description: "اطلاعات سرنخ با موفقیت به‌روزرسانی شد",
        });
        setIsEditing(false);
        loadLeadDetails();
        if (onLeadUpdated) onLeadUpdated();
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در به‌روزرسانی اطلاعات",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const handleStageChange = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/${tenantKey}/sales-pipeline/lead/${leadId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        },
        body: JSON.stringify(stageChangeData)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "موفقیت",
          description: "مرحله سرنخ با موفقیت تغییر کرد",
        });
        setShowStageChange(false);
        loadLeadDetails();
        if (onLeadUpdated) onLeadUpdated();
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

  const getStageDisplayName = (stageName: PipelineStageType) => {
    const stageNames = {
      'new_lead': 'سرنخ جدید',
      'contacted': 'تماس اولیه',
      'needs_analysis': 'نیازسنجی',
      'proposal_sent': 'ارسال پیشنهاد',
      'negotiation': 'مذاکره',
      'closed_won': 'برنده شده',
      'closed_lost': 'از دست رفته'
    };
    return stageNames[stageName] || stageName;
  };

  const getStageColor = (stageName: PipelineStageType) => {
    const colors = {
      'new_lead': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'needs_analysis': 'bg-purple-100 text-purple-800 border-purple-200',
      'proposal_sent': 'bg-orange-100 text-orange-800 border-orange-200',
      'negotiation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'closed_won': 'bg-green-100 text-green-800 border-green-200',
      'closed_lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[stageName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTemperatureColor = (temperature: LeadTemperature) => {
    switch (temperature) {
      case 'hot': return 'text-red-600 bg-red-100 border-red-200';
      case 'warm': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'cold': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTemperatureIcon = (temperature: LeadTemperature) => {
    switch (temperature) {
      case 'hot': return '🔥';
      case 'warm': return '🟡';
      case 'cold': return '❄️';
      default: return '⚪';
    }
  };

  const getTemperatureLabel = (temperature: LeadTemperature) => {
    switch (temperature) {
      case 'hot': return 'داغ';
      case 'warm': return 'نیمه‌فعال';
      case 'cold': return 'سرد';
      default: return 'نامشخص';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-vazir text-xl flex items-center space-x-2 space-x-reverse">
            <User className="h-6 w-6 text-blue-600" />
            <span>جزئیات سرنخ</span>
            {leadData && (
              <Badge className={`font-vazir ${getStageColor(leadData.lead.current_pipeline_stage)}`}>
                {getStageDisplayName(leadData.lead.current_pipeline_stage)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-vazir">در حال بارگذاری جزئیات...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-vazir mb-4">{error}</p>
            <Button onClick={loadLeadDetails} variant="outline" className="font-vazir">
              تلاش مجدد
            </Button>
          </div>
        )}

        {leadData && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveChanges();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="font-vazir"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 ml-1" />
                      ذخیره
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 ml-1" />
                      ویرایش
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStageChange(!showStageChange)}
                  className="font-vazir"
                >
                  <Target className="h-4 w-4 ml-1" />
                  تغییر مرحله
                </Button>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedLead(leadData.lead);
                    }}
                    className="font-vazir"
                  >
                    <X className="h-4 w-4 ml-1" />
                    انصراف
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge className={`font-vazir ${getTemperatureColor(leadData.lead.lead_temperature)}`}>
                  {getTemperatureIcon(leadData.lead.lead_temperature)} {getTemperatureLabel(leadData.lead.lead_temperature)}
                </Badge>
                <span className="text-sm text-gray-500 font-vazir">
                  {leadData.stats.days_in_pipeline} روز در پایپ‌لاین
                </span>
              </div>
            </div>

            {/* Stage Change Interface */}
            {showStageChange && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="font-vazir text-lg">تغییر مرحله سرنخ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-vazir">مرحله جدید</Label>
                      <Select
                        value={stageChangeData.new_stage}
                        onValueChange={(value) => setStageChangeData(prev => ({ ...prev, new_stage: value as PipelineStageType }))}
                      >
                        <SelectTrigger className="font-vazir">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_lead" className="font-vazir">سرنخ جدید</SelectItem>
                          <SelectItem value="contacted" className="font-vazir">تماس اولیه</SelectItem>
                          <SelectItem value="needs_analysis" className="font-vazir">نیازسنجی</SelectItem>
                          <SelectItem value="proposal_sent" className="font-vazir">ارسال پیشنهاد</SelectItem>
                          <SelectItem value="negotiation" className="font-vazir">مذاکره</SelectItem>
                          <SelectItem value="closed_won" className="font-vazir">برنده شده</SelectItem>
                          <SelectItem value="closed_lost" className="font-vazir">از دست رفته</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-vazir">دلیل تغییر (اختیاری)</Label>
                      <Input
                        value={stageChangeData.reason || ''}
                        onChange={(e) => setStageChangeData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="دلیل تغییر مرحله..."
                        className="font-vazir"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button onClick={handleStageChange} className="font-vazir">
                      تایید تغییر
                    </Button>
                    <Button variant="outline" onClick={() => setShowStageChange(false)} className="font-vazir">
                      انصراف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 font-vazir">
                <TabsTrigger value="overview" className="font-vazir">اطلاعات کلی</TabsTrigger>
                <TabsTrigger value="activities" className="font-vazir">تایم‌لاین</TabsTrigger>
                <TabsTrigger value="tasks" className="font-vazir">وظایف</TabsTrigger>
                <TabsTrigger value="documents" className="font-vazir">اسناد</TabsTrigger>
                <TabsTrigger value="history" className="font-vazir">تاریخچه</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-vazir flex items-center space-x-2 space-x-reverse">
                        <User className="h-5 w-5" />
                        <span>اطلاعات پایه</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-vazir">نام سرنخ</Label>
                        {isEditing ? (
                          <Input
                            value={editedLead.name || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, name: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <p className="font-vazir text-lg font-semibold">{leadData.lead.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">شرکت</Label>
                        {isEditing ? (
                          <Input
                            value={editedLead.company_name || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, company_name: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir">{leadData.lead.company_name || 'تعریف نشده'}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">ایمیل</Label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={editedLead.email || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, email: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir">{leadData.lead.email || 'تعریف نشده'}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">تلفن</Label>
                        {isEditing ? (
                          <Input
                            value={editedLead.phone || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, phone: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir">{leadData.lead.phone || 'تعریف نشده'}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-vazir flex items-center space-x-2 space-x-reverse">
                        <DollarSign className="h-5 w-5" />
                        <span>اطلاعات معامله</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-vazir">مبلغ معامله</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editedLead.deal_value || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, deal_value: Number(e.target.value) || undefined }))}
                            className="font-vazir"
                          />
                        ) : (
                          <p className="font-vazir text-lg font-bold text-green-600">
                            {formatPrice(leadData.lead.deal_value || 0)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">احتمال موفقیت</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editedLead.success_probability || 50}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, success_probability: Number(e.target.value) || 50 }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir text-lg font-semibold">{leadData.lead.success_probability}%</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">مسئول فروش</Label>
                        {isEditing ? (
                          <Input
                            value={editedLead.sales_owner || ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, sales_owner: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir">{leadData.lead.sales_owner || 'تعریف نشده'}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">تاریخ اقدام بعدی</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editedLead.next_action_date ? editedLead.next_action_date.split('T')[0] : ''}
                            onChange={(e) => setEditedLead(prev => ({ ...prev, next_action_date: e.target.value }))}
                            className="font-vazir"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-vazir">
                              {leadData.lead.next_action_date ? 
                                new Date(leadData.lead.next_action_date).toLocaleDateString('fa-IR') : 
                                'تعریف نشده'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-vazir">{leadData.stats.total_activities}</div>
                      <div className="text-sm text-gray-600 font-vazir">فعالیت</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-vazir">{leadData.stats.completed_tasks}/{leadData.stats.total_tasks}</div>
                      <div className="text-sm text-gray-600 font-vazir">وظایف تکمیل شده</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-vazir">{leadData.stats.total_documents}</div>
                      <div className="text-sm text-gray-600 font-vazir">سند</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <History className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-vazir">{leadData.stats.stage_changes}</div>
                      <div className="text-sm text-gray-600 font-vazir">تغییر مرحله</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              {/* Activities Timeline Tab */}
              <TabsContent value="activities" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-vazir">تایم‌لاین فعالیت‌ها</h3>
                  <Button size="sm" className="font-vazir">
                    <Plus className="h-4 w-4 ml-1" />
                    فعالیت جدید
                  </Button>
                </div>
                <div className="space-y-4">
                  {leadData.recent_activities.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-vazir">هیچ فعالیتی ثبت نشده است</p>
                      </CardContent>
                    </Card>
                  ) : (
                    leadData.recent_activities.map((activity: any) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-vazir font-medium">{activity.title}</h4>
                                <span className="text-sm text-gray-500 font-vazir">
                                  {new Date(activity.created_at).toLocaleDateString('fa-IR')}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="text-gray-600 font-vazir mt-1">{activity.description}</p>
                              )}
                              {activity.performed_by_name && (
                                <p className="text-sm text-gray-500 font-vazir mt-2">
                                  توسط: {activity.performed_by_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-vazir">وظایف</h3>
                  <Button size="sm" className="font-vazir">
                    <Plus className="h-4 w-4 ml-1" />
                    وظیفه جدید
                  </Button>
                </div>
                <div className="space-y-4">
                  {leadData.pending_tasks.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-vazir">هیچ وظیفه‌ای تعریف نشده است</p>
                      </CardContent>
                    </Card>
                  ) : (
                    leadData.pending_tasks.map((task: any) => (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className={`p-2 rounded-full ${
                              task.status === 'completed' ? 'bg-green-100' : 
                              task.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              <CheckSquare className={`h-4 w-4 ${
                                task.status === 'completed' ? 'text-green-600' : 
                                task.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-vazir font-medium">{task.title}</h4>
                                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="font-vazir">
                                  {task.status === 'completed' ? 'تکمیل شده' : 'در انتظار'}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-gray-600 font-vazir mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                {task.assigned_to_name && (
                                  <span className="text-sm text-gray-500 font-vazir">
                                    مسئول: {task.assigned_to_name}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span className="text-sm text-gray-500 font-vazir flex items-center">
                                    <Clock className="h-3 w-3 ml-1" />
                                    {new Date(task.due_date).toLocaleDateString('fa-IR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-vazir">اسناد</h3>
                  <Button size="sm" className="font-vazir">
                    <Plus className="h-4 w-4 ml-1" />
                    آپلود سند
                  </Button>
                </div>
                <div className="space-y-4">
                  {leadData.recent_documents.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-vazir">هیچ سندی آپلود نشده است</p>
                      </CardContent>
                    </Card>
                  ) : (
                    leadData.recent_documents.map((document: any) => (
                      <Card key={document.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-vazir font-medium">{document.title}</h4>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-500 font-vazir">
                                {document.original_filename} • {Math.round(document.file_size / 1024)} KB
                              </p>
                              <p className="text-sm text-gray-500 font-vazir">
                                آپلود شده در {new Date(document.created_at).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-vazir">تاریخچه تغییرات</h3>
                </div>
                <div className="space-y-4">
                  {leadData.lead.pipeline_history && leadData.lead.pipeline_history.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-vazir">هیچ تغییری ثبت نشده است</p>
                      </CardContent>
                    </Card>
                  ) : (
                    leadData.lead.pipeline_history?.map((historyEntry: any) => (
                      <Card key={historyEntry.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <History className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-vazir font-medium">
                                    تغییر از {historyEntry.from_stage ? getStageDisplayName(historyEntry.from_stage) : 'ابتدا'} 
                                    به {getStageDisplayName(historyEntry.to_stage)}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500 font-vazir">
                                  {new Date(historyEntry.changed_at).toLocaleDateString('fa-IR')}
                                </span>
                              </div>
                              {historyEntry.change_reason && (
                                <p className="text-gray-600 font-vazir mt-1">دلیل: {historyEntry.change_reason}</p>
                              )}
                              {historyEntry.changed_by_name && (
                                <p className="text-sm text-gray-500 font-vazir mt-2">
                                  توسط: {historyEntry.changed_by_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;