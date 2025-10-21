'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
    CheckCircle, 
    Circle, 
    Clock, 
    User, 
    Calendar,
    MessageSquare,
    Loader2,
    TrendingUp
} from 'lucide-react';

interface PipelineStage {
    id: string;
    name: string;
    code: string;
    description: string;
    stage_order: number;
    color: string;
    isCompleted: boolean;
    completedAt: string | null;
    completedBy: string | null;
    notes: string | null;
    isCurrent: boolean;
}

interface PipelineData {
    customerId: string;
    currentStage: any;
    stages: PipelineStage[];
    overallProgress: number;
}

interface SalesPipelineProgressProps {
    customerId: string;
    onUpdate?: () => void;
}

export default function SalesPipelineProgress({ customerId, onUpdate }: SalesPipelineProgressProps) {
    const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [showNotes, setShowNotes] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchPipelineData();
    }, [customerId]);

    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    const fetchPipelineData = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            const response = await fetch(`/api/customers/${customerId}/pipeline`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setPipelineData(data.data);
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در دریافت فرآیند فروش",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching pipeline:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStageAction = async (stageId: string, action: 'complete' | 'uncomplete') => {
        try {
            setUpdating(stageId);
            const token = getAuthToken();

            const response = await fetch(`/api/customers/${customerId}/pipeline`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    stageId,
                    action,
                    notes: action === 'complete' ? notes : null
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفق",
                    description: "فرآیند فروش با موفقیت به‌روزرسانی شد"
                });
                setShowNotes(null);
                setNotes('');
                fetchPipelineData();
                onUpdate?.();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در به‌روزرسانی فرآیند فروش",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating pipeline:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="mr-2 font-vazir">در حال بارگذاری...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!pipelineData) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <p className="text-muted-foreground font-vazir">فرآیند فروش یافت نشد</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>فرآیند فروش</span>
                    <Badge variant="secondary" className="mr-auto font-vazir">
                        %{pipelineData.overallProgress} تکمیل شده
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* نوار پیشرفت کلی */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium font-vazir">پیشرفت کلی</span>
                            <span className="text-sm text-muted-foreground font-vazir">
                                {pipelineData.stages.filter(s => s.isCompleted).length} از {pipelineData.stages.length} مرحله
                            </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                                style={{ width: `${pipelineData.overallProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* مراحل فرآیند فروش */}
                    <div className="space-y-4">
                        {pipelineData.stages.map((stage, index) => (
                            <div key={stage.id} className="relative">
                                {/* خط اتصال */}
                                {index < pipelineData.stages.length - 1 && (
                                    <div className="absolute right-6 top-12 w-0.5 h-16 bg-border" />
                                )}
                                
                                <div className={`flex items-start space-x-4 space-x-reverse p-4 rounded-lg border transition-all duration-300 ${
                                    stage.isCurrent 
                                        ? 'border-primary bg-primary/5 shadow-md' 
                                        : stage.isCompleted 
                                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                            : 'border-border bg-muted/30'
                                }`}>
                                    {/* آیکون وضعیت */}
                                    <div className="flex-shrink-0 mt-1">
                                        {updating === stage.id ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        ) : stage.isCompleted ? (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        ) : stage.isCurrent ? (
                                            <Clock className="h-6 w-6 text-primary" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* محتوای مرحله */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium font-vazir">{stage.name}</h4>
                                                <p className="text-sm text-muted-foreground font-vazir">{stage.description}</p>
                                            </div>
                                            <div className="flex space-x-2 space-x-reverse">
                                                {stage.isCompleted ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStageAction(stage.id, 'uncomplete')}
                                                        disabled={updating === stage.id}
                                                        className="font-vazir"
                                                    >
                                                        لغو تکمیل
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowNotes(stage.id);
                                                            setNotes('');
                                                        }}
                                                        disabled={updating === stage.id}
                                                        className="font-vazir"
                                                    >
                                                        تکمیل مرحله
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* اطلاعات تکمیل */}
                                        {stage.isCompleted && (
                                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                                                {stage.completedBy && (
                                                    <div className="flex items-center space-x-1 space-x-reverse">
                                                        <User className="h-4 w-4" />
                                                        <span className="font-vazir">{stage.completedBy}</span>
                                                    </div>
                                                )}
                                                {stage.completedAt && (
                                                    <div className="flex items-center space-x-1 space-x-reverse">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="font-vazir">{formatDate(stage.completedAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* یادداشت */}
                                        {stage.notes && (
                                            <div className="flex items-start space-x-2 space-x-reverse text-sm">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <p className="text-muted-foreground font-vazir">{stage.notes}</p>
                                            </div>
                                        )}

                                        {/* فرم یادداشت */}
                                        {showNotes === stage.id && (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div>
                                                    <Label htmlFor="notes" className="font-vazir">یادداشت (اختیاری)</Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder="توضیحات مرحله..."
                                                        className="mt-1 font-vazir"
                                                        dir="rtl"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="flex space-x-2 space-x-reverse">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStageAction(stage.id, 'complete')}
                                                        disabled={updating === stage.id}
                                                        className="font-vazir"
                                                    >
                                                        تأیید تکمیل
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setShowNotes(null)}
                                                        disabled={updating === stage.id}
                                                        className="font-vazir"
                                                    >
                                                        انصراف
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}