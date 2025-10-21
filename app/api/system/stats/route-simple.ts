import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
    try {
        console.log('🔍 Starting simple stats API...');

        // تست اتصال دیتابیس
        const testQuery = await executeQuery('SELECT 1 as test');
        console.log('✅ Database connection test passed');

        // کوئری‌های ساده
        const results = await Promise.allSettled([
            // تعداد مشتریان
            executeQuery('SELECT COUNT(*) as count FROM customers'),
            
            // تعداد فروش‌ها
            executeQuery('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM sales'),
            
            // تعداد بازخوردها
            executeQuery('SELECT COUNT(*) as count FROM feedback'),
            
            // فروش‌های اخیر (7 روز گذشته)
            executeQuery(`
                SELECT 
                    DATE(sale_date) as sale_day,
                    COUNT(*) as sale_count,
                    COALESCE(SUM(total_amount), 0) as revenue
                FROM sales 
                WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(sale_date)
                ORDER BY sale_day DESC
                LIMIT 7
            `),
            
            // وضعیت فروش‌ها
            executeQuery(`
                SELECT 
                    payment_status,
                    COUNT(*) as count
                FROM sales 
                GROUP BY payment_status
            `),
            
            // بازخوردها بر اساس نوع
            executeQuery(`
                SELECT 
                    type,
                    COUNT(*) as count
                FROM feedback 
                GROUP BY type
            `)
        ]);

        console.log('✅ All queries executed');

        // پردازش نتایج
        const [
            customersResult,
            salesResult,
            feedbackResult,
            weeklyResult,
            salesStatusResult,
            feedbackTypeResult
        ] = results;

        // استخراج داده‌ها
        const totalCustomers = customersResult.status === 'fulfilled' 
            ? (customersResult.value as any[])[0]?.count || 0 
            : 0;

        const salesData = salesResult.status === 'fulfilled' 
            ? (salesResult.value as any[])[0] || { count: 0, revenue: 0 }
            : { count: 0, revenue: 0 };

        const totalFeedbacks = feedbackResult.status === 'fulfilled' 
            ? (feedbackResult.value as any[])[0]?.count || 0 
            : 0;

        const weeklyData = weeklyResult.status === 'fulfilled' 
            ? (weeklyResult.value as any[]) || []
            : [];

        const salesStatusData = salesStatusResult.status === 'fulfilled' 
            ? (salesStatusResult.value as any[]) || []
            : [];

        const feedbackTypeData = feedbackTypeResult.status === 'fulfilled' 
            ? (feedbackTypeResult.value as any[]) || []
            : [];

        // فرمت کردن داده‌ها برای چارت
        const weeklyRevenue = formatWeeklyData(weeklyData);
        const salesByStatus = formatSalesByStatus(salesStatusData);
        const feedbackDistribution = formatFeedbackDistribution(feedbackTypeData);

        const response = {
            success: true,
            data: {
                // آمار کلی
                totalCustomers: parseInt(totalCustomers),
                totalSales: parseInt(salesData.count),
                totalRevenue: parseFloat(salesData.revenue),
                totalFeedbacks: parseInt(totalFeedbacks),
                
                // داده‌های چارت
                weeklyRevenue,
                salesByStatus,
                feedbackDistribution,
                
                // آمار رشد (mock)
                growth: {
                    customers: { percentage: 12, trend: 'up' },
                    sales: { percentage: 8, trend: 'up' },
                    revenue: { percentage: 15, trend: 'up' },
                    feedback: { percentage: 5, trend: 'up' }
                },
                
                // فعالیت‌های اخیر (ساده)
                recentActivities: [
                    { description: 'سیستم آمار به‌روزرسانی شد', time: 'اکنون' },
                    { description: 'داده‌های جدید پردازش شد', time: '۱ ساعت پیش' }
                ]
            }
        };

        console.log('✅ Response prepared successfully');
        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Error in simple stats API:', error);
        
        // لاگ جزئیات بیشتر
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json(
            { 
                success: false, 
                error: 'خطا در دریافت آمار سیستم',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// توابع کمکی ساده
function formatWeeklyData(data: any[]) {
    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    
    if (data.length === 0) {
        return persianDays.map(day => ({ name: day, revenue: 0 }));
    }

    // ساده‌ترین روش: فقط آخرین 7 روز
    const result = persianDays.map(day => ({ name: day, revenue: 0 }));
    
    data.forEach((row, index) => {
        if (index < 7) {
            result[index] = {
                name: persianDays[index] || `روز ${index + 1}`,
                revenue: parseFloat(row.revenue) || 0
            };
        }
    });

    return result;
}

function formatSalesByStatus(data: any[]) {
    const statusNames = {
        'pending': 'در انتظار',
        'partial': 'جزئی', 
        'paid': 'پرداخت شده',
        'refunded': 'بازگشت'
    };

    if (data.length === 0) {
        return [
            { name: 'در انتظار', value: 0 },
            { name: 'پرداخت شده', value: 0 }
        ];
    }

    return data.map(row => ({
        name: statusNames[row.payment_status as keyof typeof statusNames] || row.payment_status,
        value: parseInt(row.count) || 0
    }));
}

function formatFeedbackDistribution(data: any[]) {
    const typeNames = {
        'complaint': 'شکایت',
        'suggestion': 'پیشنهاد', 
        'praise': 'تشکر',
        'csat': 'رضایت',
        'nps': 'وفاداری',
        'ces': 'سهولت'
    };

    if (data.length === 0) {
        return [
            { name: 'شکایت', value: 0 },
            { name: 'پیشنهاد', value: 0 },
            { name: 'تشکر', value: 0 }
        ];
    }

    return data.map(row => ({
        name: typeNames[row.type as keyof typeof typeNames] || row.type,
        value: parseInt(row.count) || 0
    }));
}