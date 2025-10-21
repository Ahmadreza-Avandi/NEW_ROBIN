'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Brain, TrendingUp, MessageCircle, BarChart3, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';

interface FeedbackAnalysis {
    summary: string;
    sentiment_analysis: {
        positive: number;
        neutral: number;
        negative: number;
    };
    key_themes: string[];
    recommendations: string[];
    priority_issues: string[];
    customer_satisfaction_trend: string;
}

export default function FeedbackAnalysisPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
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
            const response = await fetch('/api/feedback/analyze', {
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
                throw new Error('خطا در تحلیل بازخوردها');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setError('خطا در تحلیل بازخوردها. لطفاً دوباره تلاش کنید.');
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Brain className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">تحلیل بازخوردها با هوش مصنوعی</h1>
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
                            {loading ? 'در حال تحلیل...' : 'تحلیل بازخوردها'}
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
                                <MessageCircle className="h-5 w-5" />
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

                    {/* Sentiment Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                تحلیل احساسات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analysis.sentiment_analysis.positive}%
                                    </div>
                                    <div className="text-sm text-green-700">مثبت</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {analysis.sentiment_analysis.neutral}%
                                    </div>
                                    <div className="text-sm text-yellow-700">خنثی</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {analysis.sentiment_analysis.negative}%
                                    </div>
                                    <div className="text-sm text-red-700">منفی</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Themes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>موضوعات کلیدی</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysis.key_themes.map((theme, index) => (
                                    <Badge key={index} variant="secondary">
                                        {theme}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Priority Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                مسائل اولویت‌دار
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.priority_issues.map((issue, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
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

                    {/* Customer Satisfaction Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>روند رضایت مشتری</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={analysis.customer_satisfaction_trend}
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