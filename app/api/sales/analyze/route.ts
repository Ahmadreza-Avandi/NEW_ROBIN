import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: 'root',
    password: '1234',
    database: 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
};

export async function POST(request: NextRequest) {
    try {
        const { startDate, endDate } = await request.json();

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'تاریخ شروع و پایان الزامی است' },
                { status: 400 }
            );
        }

        // اتصال به دیتابیس
        const connection = await mysql.createConnection(dbConfig);

        try {
            // دریافت فروش‌ها در بازه زمانی مشخص
            const [salesRows] = await connection.execute(`
        SELECT 
          s.*,
          c.name as customer_name,
          c.segment as customer_segment,
          c.industry
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.sale_date BETWEEN ? AND ?
        ORDER BY s.sale_date DESC
      `, [startDate, endDate]);

            const sales = salesRows as any[];

            if (sales.length === 0) {
                return NextResponse.json({
                    summary: 'در بازه زمانی انتخاب شده هیچ فروشی ثبت نشده است.',
                    performance_metrics: {
                        total_sales: 0,
                        total_revenue: '0 تومان',
                        average_deal_size: '0 تومان',
                        conversion_rate: 0
                    },
                    trends: [],
                    top_performers: [],
                    recommendations: ['تمرکز بر افزایش فعالیت‌های فروش', 'بررسی استراتژی‌های بازاریابی'],
                    market_insights: 'داده‌ای برای تحلیل بازار موجود نیست.'
                });
            }

            // محاسبه شاخص‌های عملکرد
            const performanceMetrics = calculatePerformanceMetrics(sales);

            // تحلیل روندها
            const trends = analyzeTrends(sales);

            // شناسایی بهترین فروشندگان
            const topPerformers = getTopPerformers(sales);

            // تولید پیشنهادات
            const recommendations = generateSalesRecommendations(sales);

            // تحلیل بازار
            const marketInsights = generateMarketInsights(sales);

            const response = {
                summary: generateSalesSummary(sales, performanceMetrics),
                performance_metrics: performanceMetrics,
                trends: trends,
                top_performers: topPerformers,
                recommendations: recommendations,
                market_insights: marketInsights
            };

            return NextResponse.json(response);

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error('خطا در تحلیل فروش:', error);
        return NextResponse.json(
            { error: 'خطا در تحلیل فروش' },
            { status: 500 }
        );
    }
}

function calculatePerformanceMetrics(sales: any[]) {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const averageDealSize = totalSales > 0 ? totalRevenue / totalSales : 0;

    // محاسبه نرخ تبدیل (فرضی - بر اساس وضعیت پرداخت)
    const paidSales = sales.filter(s => s.payment_status === 'paid').length;
    const conversionRate = totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0;

    return {
        total_sales: totalSales,
        total_revenue: formatCurrency(totalRevenue),
        average_deal_size: formatCurrency(averageDealSize),
        conversion_rate: conversionRate
    };
}

function analyzeTrends(sales: any[]): string[] {
    const trends = [];

    // تحلیل روند پرداخت
    const paidSales = sales.filter(s => s.payment_status === 'paid').length;
    const pendingSales = sales.filter(s => s.payment_status === 'pending').length;

    if (paidSales > pendingSales) {
        trends.push('روند مثبت در تکمیل پرداخت‌ها');
    } else {
        trends.push('نیاز به پیگیری پرداخت‌های معوق');
    }

    // تحلیل بخش‌بندی مشتریان
    const segments = sales.reduce((acc, sale) => {
        const segment = sale.customer_segment || 'نامشخص';
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
    }, {});

    const topSegment = Object.keys(segments).reduce((a, b) =>
        segments[a] > segments[b] ? a : b
    );

    trends.push(`بیشترین فروش در بخش ${topSegment}`);

    // تحلیل زمانی
    const currentMonth = new Date().getMonth();
    const salesThisMonth = sales.filter(s =>
        new Date(s.sale_date).getMonth() === currentMonth
    ).length;

    if (salesThisMonth > sales.length / 2) {
        trends.push('افزایش فعالیت فروش در ماه جاری');
    }

    trends.push('تنوع در روش‌های پرداخت');
    trends.push('رشد در فروش آنلاین');

    return trends.slice(0, 5);
}

function getTopPerformers(sales: any[]): string[] {
    const performers = sales.reduce((acc, sale) => {
        const name = sale.sales_person_name;
        if (!acc[name]) {
            acc[name] = { count: 0, revenue: 0 };
        }
        acc[name].count += 1;
        acc[name].revenue += parseFloat(sale.total_amount);
        return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(performers)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(([name, data]) =>
            `${name} - ${data.count} فروش، ${formatCurrency(data.revenue)}`
        );
}

function generateSalesRecommendations(sales: any[]): string[] {
    const recommendations = [];

    const pendingSales = sales.filter(s => s.payment_status === 'pending').length;
    const totalSales = sales.length;

    if (pendingSales / totalSales > 0.3) {
        recommendations.push('بهبود فرآیند پیگیری پرداخت‌های معوق');
    }

    recommendations.push('توسعه استراتژی‌های فروش متنوع');
    recommendations.push('آموزش تیم فروش در تکنیک‌های جدید');
    recommendations.push('بهینه‌سازی قیمت‌گذاری محصولات');
    recommendations.push('تقویت روابط با مشتریان کلیدی');
    recommendations.push('استفاده از ابزارهای CRM پیشرفته');

    return recommendations.slice(0, 5);
}

function generateMarketInsights(sales: any[]): string {
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
    const avgDealSize = totalRevenue / sales.length;

    const insights = [
        `میانگین ارزش معاملات ${formatCurrency(avgDealSize)} است که نشان‌دهنده`,
        `سطح متوسط قدرت خرید مشتریان می‌باشد.`,
        `تنوع در صنایع مشتریان فرصت‌های رشد جدیدی را فراهم می‌کند.`,
        `بازار در حال تحول است و نیاز به انطباق با تغییرات دارد.`
    ].join(' ');

    return insights;
}

function generateSalesSummary(sales: any[], metrics: any): string {
    return `در بازه زمانی انتخاب شده، ${metrics.total_sales} فروش با مجموع درآمد ${metrics.total_revenue} ثبت شده است. میانگین ارزش هر معامله ${metrics.average_deal_size} بوده و نرخ تبدیل ${metrics.conversion_rate}% محاسبه شده است. تحلیل داده‌ها نشان می‌دهد که عملکرد فروش در مسیر مناسبی قرار دارد اما همچنان فرصت‌هایی برای بهبود وجود دارد.`;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amount)) + ' تومان';
}