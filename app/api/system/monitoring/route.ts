import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admin/ceo to access system monitoring
        if (user.role !== 'ceo' && user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'weekly'; // weekly, monthly
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // تعیین بازه زمانی
        let dateFilter = '';
        let dateParams: any[] = [];

        if (startDate && endDate) {
            dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
            dateParams = [startDate, endDate];
        } else if (period === 'weekly') {
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        } else if (period === 'monthly') {
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        }

        // آمار مشتریان بر اساس وضعیت
        const customerStats = await executeQuery(`
            SELECT 
                status,
                COUNT(*) as count
            FROM customers 
            ${dateFilter}
            GROUP BY status
        `, dateParams);

        // آمار فروش بر اساس وضعیت پرداخت
        const salesStats = await executeQuery(`
            SELECT 
                payment_status,
                COUNT(*) as count,
                SUM(total_amount) as total_amount
            FROM sales 
            ${dateFilter}
            GROUP BY payment_status
        `, dateParams);

        // آمار بازخوردها بر اساس نوع
        const feedbackStats = await executeQuery(`
            SELECT 
                type,
                COUNT(*) as count,
                AVG(score) as avg_score
            FROM feedback 
            ${dateFilter}
            GROUP BY type
        `, dateParams);

        // آمار بازخوردها بر اساس احساسات
        const feedbackSentimentStats = await executeQuery(`
            SELECT 
                sentiment,
                COUNT(*) as count
            FROM feedback 
            WHERE sentiment IS NOT NULL
            ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
            GROUP BY sentiment
        `, dateParams);

        // آمار درآمد ماهانه (6 ماه گذشته)
        const monthlyRevenue = await executeQuery(`
            SELECT 
                DATE_FORMAT(sale_date, '%Y-%m') as month,
                SUM(total_amount) as revenue,
                COUNT(*) as sales_count
            FROM sales 
            WHERE payment_status = 'paid' 
            AND sale_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
            ORDER BY month DESC
        `);

        // آمار فعالیت‌ها بر اساس نوع
        const activityStats = await executeQuery(`
            SELECT 
                type,
                COUNT(*) as count,
                outcome,
                COUNT(*) as outcome_count
            FROM activities 
            ${dateFilter}
            GROUP BY type, outcome
        `, dateParams);

        // آمار فعالیت‌های روزانه (7 روز گذشته)
        const dailyActivities = await executeQuery(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                type
            FROM activities 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at), type
            ORDER BY date DESC
        `);

        // آمار مشتریان جدید (ماهانه)
        const monthlyCustomers = await executeQuery(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as new_customers
            FROM customers 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);

        // آمار کلی سیستم
        const systemOverview = await executeQuery(`
            SELECT 
                (SELECT COUNT(*) FROM customers) as total_customers,
                (SELECT COUNT(*) FROM customers WHERE status = 'active') as active_customers,
                (SELECT COUNT(*) FROM sales) as total_sales,
                (SELECT SUM(total_amount) FROM sales WHERE payment_status = 'paid') as total_revenue,
                (SELECT COUNT(*) FROM feedback) as total_feedback,
                (SELECT AVG(score) FROM feedback WHERE score IS NOT NULL) as avg_feedback_score,
                (SELECT COUNT(*) FROM activities) as total_activities,
                (SELECT COUNT(*) FROM documents WHERE status != 'deleted') as total_documents
        `);

        const overview = systemOverview[0] || {};

        return NextResponse.json({
            success: true,
            data: {
                period,
                overview: {
                    totalCustomers: overview.total_customers || 0,
                    activeCustomers: overview.active_customers || 0,
                    totalSales: overview.total_sales || 0,
                    totalRevenue: overview.total_revenue || 0,
                    totalFeedback: overview.total_feedback || 0,
                    avgFeedbackScore: parseFloat(overview.avg_feedback_score || 0),
                    totalActivities: overview.total_activities || 0,
                    totalDocuments: overview.total_documents || 0
                },
                customerStats: customerStats.map((item: any) => ({
                    name: item.status === 'active' ? 'فعال' :
                        item.status === 'prospect' ? 'احتمالی' :
                            item.status === 'inactive' ? 'غیرفعال' : 'پیگیری',
                    value: item.count,
                    status: item.status
                })),
                salesStats: salesStats.map((item: any) => ({
                    name: item.payment_status === 'paid' ? 'پرداخت شده' :
                        item.payment_status === 'pending' ? 'در انتظار' :
                            item.payment_status === 'partial' ? 'جزئی' : 'بازگشتی',
                    value: item.count,
                    amount: item.total_amount || 0,
                    status: item.payment_status
                })),
                feedbackStats: feedbackStats.map((item: any) => ({
                    name: item.type === 'csat' ? 'رضایت مشتری' :
                        item.type === 'nps' ? 'توصیه به دیگران' :
                            item.type === 'ces' ? 'سهولت استفاده' :
                                item.type === 'complaint' ? 'شکایت' :
                                    item.type === 'suggestion' ? 'پیشنهاد' : 'تشکر',
                    value: item.count,
                    avgScore: parseFloat(item.avg_score || 0),
                    type: item.type
                })),
                feedbackSentimentStats: feedbackSentimentStats.map((item: any) => ({
                    name: item.sentiment === 'positive' ? 'مثبت' :
                        item.sentiment === 'negative' ? 'منفی' : 'خنثی',
                    value: item.count,
                    sentiment: item.sentiment
                })),
                monthlyRevenue: monthlyRevenue.map((item: any) => ({
                    month: item.month,
                    revenue: item.revenue || 0,
                    salesCount: item.sales_count || 0
                })),
                activityStats: activityStats.reduce((acc: any, item: any) => {
                    const type = item.type === 'call' ? 'تماس' :
                        item.type === 'email' ? 'ایمیل' :
                            item.type === 'meeting' ? 'جلسه' : 'سایر';

                    if (!acc[type]) {
                        acc[type] = { total: 0, successful: 0, followUp: 0, completed: 0 };
                    }

                    acc[type].total += item.count;

                    if (item.outcome === 'successful') {
                        acc[type].successful += item.count;
                    } else if (item.outcome === 'follow_up_needed') {
                        acc[type].followUp += item.count;
                    } else if (item.outcome === 'completed') {
                        acc[type].completed += item.count;
                    }

                    return acc;
                }, {}),
                dailyActivities: dailyActivities.reduce((acc: any, item: any) => {
                    const date = item.date;
                    if (!acc[date]) {
                        acc[date] = { date, total: 0, call: 0, email: 0, meeting: 0, other: 0 };
                    }

                    acc[date].total += item.count;

                    if (item.type === 'call') {
                        acc[date].call += item.count;
                    } else if (item.type === 'email') {
                        acc[date].email += item.count;
                    } else if (item.type === 'meeting') {
                        acc[date].meeting += item.count;
                    } else {
                        acc[date].other += item.count;
                    }

                    return acc;
                }, {}),
                monthlyCustomers: monthlyCustomers.map((item: any) => ({
                    month: item.month,
                    newCustomers: item.new_customers || 0
                }))
            }
        });

    } catch (error) {
        console.error('System monitoring error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get monitoring data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}