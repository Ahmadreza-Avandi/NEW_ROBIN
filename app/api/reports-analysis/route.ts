import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'overview';
        const period = searchParams.get('period') || '30';

        let data = {};

        switch (type) {
            case 'overview':
                data = await getOverviewAnalysis(parseInt(period));
                break;
            case 'sales':
                data = await getSalesAnalysis(parseInt(period));
                break;
            case 'customers':
                data = await getCustomersAnalysis(parseInt(period));
                break;
            default:
                data = await getOverviewAnalysis(parseInt(period));
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error in reports-analysis:', error);
        return NextResponse.json(
            { success: false, error: 'خطا در تحلیل گزارشات' },
            { status: 500 }
        );
    }
}

async function getOverviewAnalysis(days: number) {
    try {
        const results = await executeQuery(`
            SELECT 
                COUNT(DISTINCT c.id) as total_customers,
                COUNT(DISTINCT d.id) as total_deals,
                COALESCE(SUM(d.total_value), 0) as total_deal_value,
                COUNT(DISTINCT CASE WHEN d.stage_code = 'closed_won' THEN d.id END) as won_deals
            FROM customers c
            LEFT JOIN deals d ON c.id = d.customer_id
            WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [days]);

        return results[0] || {
            total_customers: 0,
            total_deals: 0,
            total_deal_value: 0,
            won_deals: 0
        };
    } catch (error) {
        console.error('Error in overview analysis:', error);
        return {
            total_customers: 0,
            total_deals: 0,
            total_deal_value: 0,
            won_deals: 0
        };
    }
}

async function getSalesAnalysis(days: number) {
    try {
        const results = await executeQuery(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as deals_count,
                SUM(total_value) as total_value
            FROM deals
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `, [days]);

        return results;
    } catch (error) {
        console.error('Error in sales analysis:', error);
        return [];
    }
}

async function getCustomersAnalysis(days: number) {
    try {
        const results = await executeQuery(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_customers
            FROM customers
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `, [days]);

        return results;
    } catch (error) {
        console.error('Error in customers analysis:', error);
        return [];
    }
}