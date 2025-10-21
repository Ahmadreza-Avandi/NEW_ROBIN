import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import moment from 'moment-jalaali';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
};

export async function GET() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            // Get total customers
            const [customerRows] = await connection.execute('SELECT COUNT(*) as count FROM customers');
            const totalCustomers = (customerRows as any[])[0].count;

            // Get total sales
            const [salesRows] = await connection.execute('SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM sales');
            const salesData = (salesRows as any[])[0];
            const totalSales = salesData.count;
            const totalRevenue = salesData.revenue || 0;

            // Get total feedbacks
            const [feedbackRows] = await connection.execute('SELECT COUNT(*) as count FROM feedback');
            const totalFeedbacks = (feedbackRows as any[])[0].count;

            // Get weekly revenue data (last 7 days)
            const [weeklyRevenueRows] = await connection.execute(`
        SELECT 
          DATE(sale_date) as sale_day,
          DAYNAME(sale_date) as day_name,
          DAYOFWEEK(sale_date) as day_num,
          SUM(total_amount) as revenue
        FROM sales 
        WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(sale_date), DAYOFWEEK(sale_date), DAYNAME(sale_date)
        ORDER BY sale_day
      `);

            // Get monthly revenue data (last 6 months)
            const [monthlyRevenueRows] = await connection.execute(`
        SELECT 
          DATE_FORMAT(sale_date, '%Y-%m') as month_key,
          MONTHNAME(sale_date) as month_name,
          MONTH(sale_date) as month_num,
          YEAR(sale_date) as year_num,
          SUM(total_amount) as revenue
        FROM sales 
        WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(sale_date, '%Y-%m'), YEAR(sale_date), MONTH(sale_date), MONTHNAME(sale_date)
        ORDER BY YEAR(sale_date), MONTH(sale_date)
      `);

            // Get feedback distribution
            const [feedbackDistRows] = await connection.execute(`
        SELECT 
          type,
          COUNT(*) as count
        FROM feedback 
        GROUP BY type
      `);

            // Get customer satisfaction data (average scores by month)
            const [satisfactionRows] = await connection.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month_key,
          MONTHNAME(created_at) as month_name,
          AVG(score) as avg_satisfaction
        FROM feedback 
        WHERE score IS NOT NULL 
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at), MONTHNAME(created_at)
        ORDER BY YEAR(created_at), MONTH(created_at)
      `);

            // Get sales by status
            const [salesStatusRows] = await connection.execute(`
        SELECT 
          payment_status,
          COUNT(*) as count
        FROM sales 
        GROUP BY payment_status
      `);

            // Get customers by segment
            const [customerSegmentRows] = await connection.execute(`
        SELECT 
          segment,
          COUNT(*) as count
        FROM customers 
        WHERE segment IS NOT NULL
        GROUP BY segment
      `);

            // Get recent activities from database
            const [recentActivitiesRows] = await connection.execute(`
        (SELECT 'مشتری جدید ثبت شد' as description, created_at as activity_time, 'customer' as type FROM customers ORDER BY created_at DESC LIMIT 2)
        UNION ALL
        (SELECT 'فروش جدید تکمیل شد' as description, created_at as activity_time, 'sale' as type FROM sales ORDER BY created_at DESC LIMIT 2)
        UNION ALL
        (SELECT 'بازخورد جدید دریافت شد' as description, created_at as activity_time, 'feedback' as type FROM feedback ORDER BY created_at DESC LIMIT 2)
        ORDER BY activity_time DESC
        LIMIT 10
      `);

            // Format data for charts
            const weeklyRevenue = formatWeeklyData(weeklyRevenueRows as any[]);
            const monthlyRevenue = formatMonthlyData(monthlyRevenueRows as any[]);
            const feedbackDistribution = formatFeedbackDistribution(feedbackDistRows as any[]);
            const satisfactionData = formatSatisfactionData(satisfactionRows as any[]);
            const salesByStatus = formatSalesByStatus(salesStatusRows as any[]);
            const customersBySegment = formatCustomersBySegment(customerSegmentRows as any[]);
            const recentActivities = formatRecentActivities(recentActivitiesRows as any[]);

            // Calculate growth percentages (mock for now)
            const customerGrowth = calculateGrowthPercentage(totalCustomers, 'customers');
            const salesGrowth = calculateGrowthPercentage(totalSales, 'sales');
            const revenueGrowth = calculateGrowthPercentage(totalRevenue, 'revenue');
            const feedbackGrowth = calculateGrowthPercentage(totalFeedbacks, 'feedback');

            const response = {
                success: true,
                data: {
                    totalCustomers,
                    totalSales,
                    totalRevenue,
                    totalFeedbacks,
                    weeklyRevenue,
                    monthlyRevenue,
                    feedbackDistribution,
                    satisfactionData,
                    salesByStatus,
                    customersBySegment,
                    recentActivities,
                    growth: {
                        customers: customerGrowth,
                        sales: salesGrowth,
                        revenue: revenueGrowth,
                        feedback: feedbackGrowth
                    }
                }
            };

            return NextResponse.json(response);

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { success: false, error: 'خطا در دریافت آمار سیستم' },
            { status: 500 }
        );
    }
}

function formatWeeklyData(data: any[]) {
    moment.loadPersian({ dialect: 'persian-modern' });
    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const weeklyData = persianDays.map((day, index) => ({
        name: day,
        revenue: 0
    }));

    data.forEach(row => {
        // Convert Gregorian date to Persian and get day name
        const persianDate = moment(row.sale_day);
        const dayOfWeek = persianDate.day(); // 0=Saturday, 1=Sunday, ..., 6=Friday
        if (dayOfWeek >= 0 && dayOfWeek < 7) {
            weeklyData[dayOfWeek].revenue = parseFloat(row.revenue) || 0;
        }
    });

    return weeklyData;
}

function formatMonthlyData(data: any[]) {
    moment.loadPersian({ dialect: 'persian-modern' });

    return data.map(row => {
        // Convert first day of the month to Persian
        const gregorianDate = moment(`${row.year_num}-${row.month_num.toString().padStart(2, '0')}-01`);
        const persianMonthName = gregorianDate.format('jMMMM');

        return {
            name: persianMonthName,
            revenue: parseFloat(row.revenue) || 0
        };
    });
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
        value: parseInt(row.count)
    }));
}

function formatSatisfactionData(data: any[]) {
    moment.loadPersian({ dialect: 'persian-modern' });

    if (data.length === 0) {
        // Generate mock data for last 6 months
        const mockData = [];
        for (let i = 5; i >= 0; i--) {
            const date = moment().subtract(i, 'months');
            mockData.push({
                name: date.format('jMMMM'),
                satisfaction: Math.random() * 2 + 3 // Random between 3-5
            });
        }
        return mockData;
    }

    return data.map(row => {
        const [year, month] = row.month_key.split('-');
        const gregorianDate = moment(`${year}-${month}-01`);

        return {
            name: gregorianDate.format('jMMMM'),
            satisfaction: parseFloat(row.avg_satisfaction) || 0
        };
    });
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
        value: parseInt(row.count)
    }));
}

function formatCustomersBySegment(data: any[]) {
    const segmentNames = {
        'enterprise': 'سازمانی',
        'small_business': 'کسب‌وکار کوچک',
        'individual': 'فردی'
    };

    if (data.length === 0) {
        return [
            { name: 'کسب‌وکار کوچک', value: 0 },
            { name: 'سازمانی', value: 0 },
            { name: 'فردی', value: 0 }
        ];
    }

    return data.map(row => ({
        name: segmentNames[row.segment as keyof typeof segmentNames] || row.segment,
        value: parseInt(row.count)
    }));
}

function formatRecentActivities(data: any[]) {
    if (data.length === 0) {
        return [
            { description: 'هیچ فعالیت اخیری یافت نشد', time: '' }
        ];
    }

    return data.map(row => {
        const now = new Date();
        const activityTime = new Date(row.activity_time);
        const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));

        let timeText = '';
        if (diffInHours < 1) {
            timeText = 'کمتر از یک ساعت پیش';
        } else if (diffInHours < 24) {
            timeText = `${convertToPersianNumbers(diffInHours)} ساعت پیش`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            timeText = `${convertToPersianNumbers(diffInDays)} روز پیش`;
        }

        return {
            description: row.description,
            time: timeText
        };
    });
}

function calculateGrowthPercentage(currentValue: number, type: string): { percentage: number; trend: 'up' | 'down' | 'stable' } {
    // Mock calculation - in real implementation, compare with previous period
    const mockGrowths = {
        customers: 12,
        sales: 8,
        revenue: 15,
        feedback: 5
    };

    const percentage = mockGrowths[type as keyof typeof mockGrowths] || 0;
    return {
        percentage,
        trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable'
    };
}

function convertToPersianNumbers(num: number): string {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}