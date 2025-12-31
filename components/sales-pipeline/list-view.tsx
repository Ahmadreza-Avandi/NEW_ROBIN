'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Users,
  Filter,
  X
} from 'lucide-react';

import { Lead, LeadFilters, PipelineStageType, LeadTemperature } from '@/lib/sales-pipeline-types';

interface ListViewProps {
  leads: Lead[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onFilter: (filters: LeadFilters) => void;
  onBulkAction: (action: string, leadIds: string[]) => void;
  onLeadClick?: (lead: Lead) => void;
  onExport?: () => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const ListView: React.FC<ListViewProps> = ({
  leads,
  onSort,
  onFilter,
  onBulkAction,
  onLeadClick,
  onExport
}) => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<LeadFilters>({});

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

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: column, direction });
    onSort(column, direction);
  };

  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) return;
    onBulkAction(action, selectedLeads);
    setSelectedLeads([]);
  };

  const applyFilter = (key: keyof LeadFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilter = (key: keyof LeadFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof LeadFilters]);

  if (leads.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium font-vazir mb-2">سرنخی یافت نشد</h3>
          <p className="text-muted-foreground font-vazir">
            {hasActiveFilters ? 'فیلترهای خود را تغییر دهید یا پاک کنید' : 'اولین سرنخ خود را ایجاد کنید'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} variant="outline" className="mt-4 font-vazir">
              <X className="h-4 w-4 ml-2" />
              پاک کردن فیلترها
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
            <Filter className="h-5 w-5" />
            <span>فیلترهای پیشرفته</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="font-vazir text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 ml-1" />
                پاک کردن همه
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-vazir text-gray-700">مرحله</label>
              <Select value={filters.stage || 'all'} onValueChange={(value) => applyFilter('stage', value === 'all' ? undefined : value)}>
                <SelectTrigger className="font-vazir">
                  <SelectValue placeholder="انتخاب مرحله" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-vazir text-gray-700">دمای سرنخ</label>
              <Select value={filters.temperature || 'all'} onValueChange={(value) => applyFilter('temperature', value === 'all' ? undefined : value)}>
                <SelectTrigger className="font-vazir">
                  <SelectValue placeholder="انتخاب دما" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-vazir">همه دماها</SelectItem>
                  <SelectItem value="hot" className="font-vazir">🔥 داغ</SelectItem>
                  <SelectItem value="warm" className="font-vazir">🟡 نیمه‌فعال</SelectItem>
                  <SelectItem value="cold" className="font-vazir">❄️ سرد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-vazir text-gray-700">مسئول فروش</label>
              <Input
                placeholder="نام مسئول فروش"
                value={filters.owner || ''}
                onChange={(e) => applyFilter('owner', e.target.value || undefined)}
                className="font-vazir"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-vazir text-gray-700">جستجو</label>
              <Input
                placeholder="نام، شرکت، ایمیل..."
                value={filters.search || ''}
                onChange={(e) => applyFilter('search', e.target.value || undefined)}
                className="font-vazir"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="shadow-lg border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-vazir text-sm text-blue-800">
                  {selectedLeads.length} سرنخ انتخاب شده
                </span>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('change_stage')}
                  className="font-vazir"
                >
                  تغییر مرحله
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('assign_owner')}
                  className="font-vazir"
                >
                  تخصیص مسئول
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="font-vazir text-red-600 hover:text-red-700"
                >
                  حذف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onExport}
          className="font-vazir"
        >
          <Download className="h-4 w-4 ml-2" />
          خروجی Excel
        </Button>
      </div>

      {/* Data Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === leads.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="font-vazir p-0 h-auto"
                    >
                      نام سرنخ
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('current_pipeline_stage')}
                      className="font-vazir p-0 h-auto"
                    >
                      مرحله
                      {getSortIcon('current_pipeline_stage')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('lead_temperature')}
                      className="font-vazir p-0 h-auto"
                    >
                      دما
                      {getSortIcon('lead_temperature')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('deal_value')}
                      className="font-vazir p-0 h-auto"
                    >
                      مبلغ معامله
                      {getSortIcon('deal_value')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('success_probability')}
                      className="font-vazir p-0 h-auto"
                    >
                      احتمال موفقیت
                      {getSortIcon('success_probability')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">مسئول فروش</TableHead>
                  <TableHead className="font-vazir">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('last_followup_date')}
                      className="font-vazir p-0 h-auto"
                    >
                      آخرین تماس
                      {getSortIcon('last_followup_date')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-vazir">اقدام بعدی</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-vazir font-medium">{lead.name}</div>
                        {lead.company_name && (
                          <div className="text-sm text-gray-500 font-vazir">{lead.company_name}</div>
                        )}
                        {lead.email && (
                          <div className="text-xs text-gray-400 font-vazir">{lead.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-vazir ${getStageColor(lead.current_pipeline_stage)}`}>
                        {getStageDisplayName(lead.current_pipeline_stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-vazir ${getTemperatureColor(lead.lead_temperature)}`}>
                        {getTemperatureIcon(lead.lead_temperature)} {getTemperatureLabel(lead.lead_temperature)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-vazir">
                      {lead.deal_value ? formatPrice(lead.deal_value) : '-'}
                    </TableCell>
                    <TableCell className="font-vazir">
                      {lead.success_probability}%
                    </TableCell>
                    <TableCell className="font-vazir">
                      {lead.sales_owner || '-'}
                    </TableCell>
                    <TableCell className="font-vazir">
                      {lead.last_followup_date ? 
                        new Date(lead.last_followup_date).toLocaleDateString('fa-IR') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell className="font-vazir">
                      {lead.next_action_date ? 
                        new Date(lead.next_action_date).toLocaleDateString('fa-IR') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="font-vazir"
                            onClick={() => onLeadClick && onLeadClick(lead)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            مشاهده جزئیات
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-vazir">
                            <Edit className="h-4 w-4 ml-2" />
                            ویرایش
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-vazir text-red-600">
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListView;