'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useMemo } from 'react';
import {
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Building2,
  Eye,
  Edit,
  Thermometer
} from 'lucide-react';

import { Lead, PipelineStage, PipelineStageType } from '@/lib/sales-pipeline-types';

interface KanbanViewProps {
  stages: PipelineStage[];
  leads: Lead[];
  onStageChange: (leadId: string, newStage: PipelineStageType) => Promise<void>;
  onLeadClick: (lead: Lead) => void;
}

interface LeadCardProps {
  lead: Lead;
  index: number;
  onLeadClick: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, index, onLeadClick }) => {
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

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'text-red-600 bg-red-100 border-red-200';
      case 'warm': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'cold': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'hot': return '🔥';
      case 'warm': return '🟡';
      case 'cold': return '❄️';
      default: return '⚪';
    }
  };

  const getTemperatureLabel = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'داغ';
      case 'warm': return 'نیمه‌فعال';
      case 'cold': return 'سرد';
      default: return 'نامشخص';
    }
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
        >
          <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
            lead.lead_temperature === 'hot' ? 'border-l-red-500' :
            lead.lead_temperature === 'warm' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          } ${snapshot.isDragging ? 'shadow-2xl bg-white' : 'hover:shadow-md'}`}>
            <CardContent className="p-4">
              {/* Header with name and temperature */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-vazir font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                    {lead.name}
                  </h4>
                  {lead.company_name && (
                    <p className="text-xs text-gray-500 font-vazir mt-1 flex items-center">
                      <Building2 className="h-3 w-3 ml-1" />
                      {lead.company_name}
                    </p>
                  )}
                </div>
                <Badge className={`text-xs font-vazir ${getTemperatureColor(lead.lead_temperature)}`}>
                  {getTemperatureIcon(lead.lead_temperature)} {getTemperatureLabel(lead.lead_temperature)}
                </Badge>
              </div>

              {/* Deal value and probability */}
              {lead.deal_value && (
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-700 dark:text-green-300">
                      <DollarSign className="h-4 w-4 ml-1" />
                      <span className="text-sm font-vazir font-bold">
                        {formatPrice(lead.deal_value)}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-vazir">
                      احتمال: {lead.success_probability}%
                    </div>
                  </div>
                </div>
              )}

              {/* Contact information */}
              <div className="space-y-1 mb-3">
                {lead.email && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3 ml-1" />
                    <span className="font-vazir truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Phone className="h-3 w-3 ml-1" />
                    <span className="font-vazir">{lead.phone}</span>
                  </div>
                )}
              </div>

              {/* Sales owner and dates */}
              <div className="space-y-1 mb-3">
                {lead.sales_owner && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3 ml-1" />
                    <span className="font-vazir">{lead.sales_owner}</span>
                  </div>
                )}
                {lead.last_followup_date && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3 ml-1" />
                    <span className="font-vazir">
                      آخرین تماس: {new Date(lead.last_followup_date).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
                {lead.next_action_date && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                    <Calendar className="h-3 w-3 ml-1" />
                    <span className="font-vazir">
                      اقدام بعدی: {new Date(lead.next_action_date).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 space-x-reverse pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeadClick(lead);
                    }}
                    className="flex-1 text-xs font-vazir h-8"
                  >
                    <Eye className="h-3 w-3 ml-1" />
                    مشاهده
                  </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit action
                  }}
                  className="flex-1 text-xs font-vazir h-8"
                >
                  <Edit className="h-3 w-3 ml-1" />
                  ویرایش
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

const KanbanView: React.FC<KanbanViewProps> = ({
  stages,
  leads,
  onStageChange,
  onLeadClick
}) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Helper functions - تعریف در ابتدا
  const getStageEnglishName = (stageName: string): PipelineStageType => {
    // اگر قبلاً انگلیسیه، همونو برگردون
    const englishStages = ['new_lead', 'contacted', 'needs_analysis', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'];
    if (englishStages.includes(stageName as PipelineStageType)) {
      return stageName as PipelineStageType;
    }
    
    // mapping کامل برای همه حالات
    const stageMapping: Record<string, PipelineStageType> = {
      // فارسی استاندارد
      'سرنخ جدید': 'new_lead',
      'تماس اولیه': 'contacted',
      'نیازسنجی': 'needs_analysis', 
      'ارسال پیشنهاد': 'proposal_sent',
      'مذاکره': 'negotiation',
      'برنده شده': 'closed_won',
      'از دست رفته': 'closed_lost',
      
      // فارسی موجود در دیتابیس
      'جذب': 'new_lead',
      'تماس و مشاوره اولیه': 'contacted',
      'ارائه پیشنهاد': 'proposal_sent',
      'مذاکره و بستن قرارداد': 'negotiation',
      'فروش و تحویل محصول': 'closed_won'
    };
    
    return stageMapping[stageName] || 'new_lead';
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

  // Get unique stages by English name
  const uniqueStages = useMemo(() => {
    const seen = new Set<PipelineStageType>();
    return stages.filter(stage => {
      const englishName = getStageEnglishName(stage.name);
      if (seen.has(englishName)) {
        return false;
      }
      seen.add(englishName);
      return true;
    });
  }, [stages]);

  // Group leads by stage (using English stage names) - memoized for stability
  const leadsByStage = useMemo(() => {
    console.log('🔍 Raw stages from API:', stages.map(s => ({ name: s.name, display_name: s.display_name })));
    console.log('🎯 Unique stages:', uniqueStages.map(s => ({ name: s.name, english: getStageEnglishName(s.name) })));
    
    return uniqueStages.reduce((acc, stage) => {
      const englishStageName = getStageEnglishName(stage.name);
      acc[englishStageName] = leads.filter(lead => {
        const leadEnglishStage = getStageEnglishName(lead.current_pipeline_stage);
        return leadEnglishStage === englishStageName;
      });
      return acc;
    }, {} as Record<PipelineStageType, Lead[]>);
  }, [uniqueStages, leads]);

  const handleDragStart = (start: any) => {
    const lead = leads.find(l => l.id === start.draggableId);
    setDraggedLead(lead || null);
  };

  const handleDragEnd = async (result: DropResult) => {
    setDraggedLead(null);
    
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as PipelineStageType;
    await onStageChange(draggableId, newStage);
  };

  if (stages.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Thermometer className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium font-vazir mb-2">مراحل پایپ‌لاین تعریف نشده</h3>
          <p className="text-muted-foreground font-vazir">
            برای استفاده از نمای کانبان، ابتدا مراحل پایپ‌لاین را تعریف کنید
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4">
        {uniqueStages.map((stage) => {
          const stableDroppableId = getStageEnglishName(stage.name);
          const stageLeads = leadsByStage[stableDroppableId] || [];
          const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
          
          return (
            <div key={stage.name} className="flex-shrink-0 w-80">
              <Card className="h-full shadow-lg border-t-4 border-t-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-vazir">
                      {getStageDisplayName(stableDroppableId)}
                    </CardTitle>
                    <Badge className={`font-vazir ${getStageColor(stableDroppableId)}`}>
                      {stageLeads.length}
                    </Badge>
                  </div>
                  {totalValue > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-vazir">
                      ارزش کل: {totalValue >= 1000000 ? 
                        `${(totalValue / 1000000).toFixed(1)} میلیون تومان` : 
                        `${totalValue.toLocaleString('fa-IR')} تومان`
                      }
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Droppable droppableId={stableDroppableId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] transition-colors duration-200 rounded-lg p-2 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300' 
                            : 'bg-gray-50/50 dark:bg-gray-800/50'
                        }`}
                      >
                        {stageLeads.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-gray-400 dark:text-gray-600 font-vazir text-sm">
                              {snapshot.isDraggingOver ? 'رها کنید...' : 'سرنخی در این مرحله نیست'}
                            </div>
                          </div>
                        ) : (
                          stageLeads.map((lead, index) => (
                            <LeadCard
                              key={lead.id}
                              lead={lead}
                              index={index}
                              onLeadClick={onLeadClick}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;