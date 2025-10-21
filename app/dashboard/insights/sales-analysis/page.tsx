'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Brain, TrendingUp, DollarSign, BarChart3, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';

interface SalesAnalysis {
    summary: string;
    performance_metrics: {
        total_sales: number;
        total_revenue: string;
        average_deal_size: string;
        conversion_rate: number;
    };
    trends: string[];
    top_performers: string[];
    recommendations: string[];
    market_insights: string;
}

export default function SalesAnalysisPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [analysis, setAnalysis] = useState<SalesAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!startDate || !endDate) {
            setError('لطفاً تاریخ شروع و پایان را انتخاب کنید');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/sales/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                }),
            });

            if (!response.ok) {
                throw new Error('خطا در تحلیل فروش');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setError('خطا در تحلیل فروش. لطفاً دوباره تلاش کنید.');
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Brain className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold">تحلیل فروش با هوش مصنوعی</h1>
            </div>

            {/* Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        انتخاب بازه زمانی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium mb-2 block">تاریخ شروع</label>
                            <PersianDatePicker
                                value={startDate}
                                onChange={setStartDate}
                                placeholder="انتخاب تاریخ شروع"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">تاریخ پایان</label>
                            <PersianDatePicker
                                value={endDate}
                                onChange={setEndDate}
                                placeholder="انتخاب تاریخ پایان"
                            />
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'در حال تحلیل...' : 'تحلیل فروش'}
                        </Button>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-6">
                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                خلاصه تحلیل
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={analysis.summary}
                                readOnly
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                شاخص‌های عملکرد
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {analysis.performance_metrics.total_sales}
                                    </div>
                                    <div className="text-sm text-blue-700">تعداد فروش</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analysis.performance_metrics.total_revenue}
                                    </div>
                                    <div className="text-sm text-green-700">درآمد کل</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {analysis.performance_metrics.average_deal_size}
                                    </div>
                                    <div className="text-sm text-purple-700">میانگین معامله</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {analysis.performance_metrics.conversion_rate}%
                                    </div>
                                    <div className="text-sm text-orange-700">نرخ تبدیل</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                روندهای فروش
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysis.trends.map((trend, index) => (
                                    <Badge key={index} variant="outline">
                                        {trend}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-yellow-500" />
                                بهترین فروشندگان
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.top_performers.map((performer, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <span>{performer}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-500" />
                                پیشنهادات بهبود
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.recommendations.map((recommendation, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Market Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>بینش‌های بازار</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={analysis.market_insights}
                                readOnly
                                className="min-h-[80px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}