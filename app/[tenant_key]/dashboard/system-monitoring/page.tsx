'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, Star, MessageSquare, RefreshCw, Calendar, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function SystemMonitoringPage() {
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch('/api/tenant/monitoring', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        }
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "خطا",
          description: result.message || "خطا در دریافت داده‌ها",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} میلیارد`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} میلیون`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} هزار`;
    }
    return value.toLocaleString('fa-IR');
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return moment(`${year}-${month}-01`).format('jMMMM jYYYY');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-vazir">در حال بارگذاری داده‌ها...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground font-vazir mb-4">داده‌ای یافت نشد</p>
          <Button onClick={loadMonitoringData} className="font-vazir">
            <RefreshCw className="h-4 w-4 ml-2" />
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const monthlySalesData = (data.monthlySales || []).reverse().map((item: any) => ({
    month: formatMonth(item.month),
    فروش: parseInt(item.count),
    درآمد: parseInt(item.revenue) / 1000000
  }));

  const weeklySalesData = (data.weeklySales || []).reverse().map((item: any) => ({
    week: moment(item.date).format('jMM/jDD'),
    فروش: parseInt(item.count),
    درآمد: parseInt(item.revenue) / 1000000
  }));

  const paymentStatusData = (data.paymentStatus || []).map((item: any) => ({
    name: item.payment_status === 'paid' ? 'پرداخت شده' :
          item.payment_status === 'pending' ? 'در انتظار' :
          item.payment_status === 'partial' ? 'پرداخت جزئی' : 'بازگشت',
    value: parseInt(item.count),
    amount: parseInt(item.total)
  }));

  const feedbackData = (data.feedbacks || []).map((item: any) => ({
    name: `${item.rating} ستاره`,
    value: parseInt(item.count)
  }));

  const satisfaction = data.satisfaction || {};
  const avgScore = parseFloat(satisfaction.avg_score) || 0;
  const satisfactionRate = satisfaction.total_customers > 0
    ? ((satisfaction.satisfied / satisfaction.total_customers) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            مانیتورینگ فروش
          </h1>
          <p className="text-muted-foreground font-vazir mt-2">تحلیل جامع عملکرد فروش و رضایت مشتریان</p>
        </div>
        <Button onClick={loadMonitoringData} disabled={loading} className="font-vazir">
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir text-green-700">کل درآمد</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 font-vazir">
              {formatCurrency(stats.total_revenue || 0)} تومان
            </div>
            <p className="text-xs text-green-600 mt-1 font-vazir">
              {(stats.total_sales || 0).toLocaleString('fa-IR')} فروش
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir text-blue-700">درآمد ماه جاری</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 font-vazir">
              {formatCurrency(stats.revenue_this_month || 0)} تومان
            </div>
            <p className="text-xs text-blue-600 mt-1 font-vazir">
              {(stats.sales_this_month || 0).toLocaleString('fa-IR')} فروش
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir text-purple-700">کل مشتریان</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 font-vazir">
              {(stats.total_customers || 0).toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-purple-600 mt-1 font-vazir">
              رضایت: {satisfactionRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir text-amber-700">نرخ پرداخت</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 font-vazir">
              {stats.total_sales > 0 ? ((stats.paid_sales / stats.total_sales) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-amber-600 mt-1 font-vazir">
              {(stats.paid_sales || 0).toLocaleString('fa-IR')} از {(stats.total_sales || 0).toLocaleString('fa-IR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={timeRange === 'weekly' ? 'default' : 'outline'}
          onClick={() => setTimeRange('weekly')}
          className="font-vazir"
        >
          <Calendar className="h-4 w-4 ml-2" />
          هفتگی
        </Button>
        <Button
          variant={timeRange === 'monthly' ? 'default' : 'outline'}
          onClick={() => setTimeRange('monthly')}
          className="font-vazir"
        >
          <Calendar className="h-4 w-4 ml-2" />
          ماهانه
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-vazir">روند فروش و درآمد</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={timeRange === 'monthly' ? monthlySalesData : weeklySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'monthly' ? 'month' : 'week'} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="فروش" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area yAxisId="right" type="monotone" dataKey="درآمد" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-vazir">وضعیت پرداخت</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-vazir flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                رضایت مشتریان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-vazir text-green-700">مشتریان راضی</p>
                    <p className="text-2xl font-bold text-green-900 font-vazir">
                      {(satisfaction.satisfied || 0).toLocaleString('fa-IR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-vazir text-green-600">{satisfactionRate}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-vazir text-yellow-700">میانگین رضایت</p>
                    <p className="text-2xl font-bold text-yellow-900 font-vazir">
                      {avgScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(avgScore) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-vazir text-red-700">نیاز به بهبود</p>
                    <p className="text-2xl font-bold text-red-900 font-vazir">
                      {(satisfaction.unsatisfied || 0).toLocaleString('fa-IR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-vazir text-red-600">
                      {satisfaction.total_customers > 0 ? ((satisfaction.unsatisfied / satisfaction.total_customers) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-vazir flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              توزیع بازخوردها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={feedbackData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
