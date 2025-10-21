import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // آمار کلی مشتریان
    const totalStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'follow_up' THEN 1 END) as follow_up_customers,
        COUNT(CASE WHEN segment = 'enterprise' THEN 1 END) as enterprise_customers,
        AVG(COALESCE(satisfaction_score, 0)) as avg_satisfaction,
        SUM(COALESCE(potential_value, 0)) as total_potential_value
      FROM customers
    `);

    // آمار محصولات علاقه‌مند
    const productStats = await executeQuery(`
      SELECT COUNT(DISTINCT customer_id) as customers_with_interests
      FROM customer_product_interests
    `);

    const stats = totalStats[0] || {};
    const productStat = productStats[0] || {};

    return NextResponse.json({
      success: true,
      data: {
        total_customers: stats.total_customers || 0,
        active_customers: stats.active_customers || 0,
        follow_up_customers: stats.follow_up_customers || 0,
        enterprise_customers: stats.enterprise_customers || 0,
        avg_satisfaction: parseFloat(stats.avg_satisfaction || 0),
        total_potential_value: parseFloat(stats.total_potential_value || 0),
        customers_with_interests: productStat.customers_with_interests || 0
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت آمار' },
      { status: 500 }
    );
  }
}