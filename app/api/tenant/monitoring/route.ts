import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // فروش ماهانه
      const [monthlySales] = await conn.query(`
        SELECT 
          DATE_FORMAT(sale_date, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(total_amount) as revenue
        FROM sales
        WHERE tenant_key = ? AND sale_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `, [tenantKey]);

      // فروش هفتگی
      const [weeklySales] = await conn.query(`
        SELECT 
          YEARWEEK(sale_date) as week,
          DATE_FORMAT(sale_date, '%Y-%m-%d') as date,
          COUNT(*) as count,
          SUM(total_amount) as revenue
        FROM sales
        WHERE tenant_key = ? AND sale_date >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
        GROUP BY YEARWEEK(sale_date), DATE_FORMAT(sale_date, '%Y-%m-%d')
        ORDER BY week DESC
        LIMIT 8
      `, [tenantKey]);

      // وضعیت پرداخت
      const [paymentStatus] = await conn.query(`
        SELECT 
          payment_status,
          COUNT(*) as count,
          SUM(total_amount) as total
        FROM sales
        WHERE tenant_key = ?
        GROUP BY payment_status
      `, [tenantKey]);

      // برترین مشتریان
      const [topCustomers] = await conn.query(`
        SELECT 
          c.id,
          c.name,
          COUNT(s.id) as sales_count,
          SUM(s.total_amount) as total_revenue
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id AND s.tenant_key = ?
        WHERE c.tenant_key = ?
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
        LIMIT 10
      `, [tenantKey, tenantKey]);

      // رضایت مشتریان
      const [satisfaction] = await conn.query(`
        SELECT 
          AVG(satisfaction_score) as avg_score,
          COUNT(*) as total_customers,
          SUM(CASE WHEN satisfaction_score >= 4 THEN 1 ELSE 0 END) as satisfied,
          SUM(CASE WHEN satisfaction_score < 3 THEN 1 ELSE 0 END) as unsatisfied
        FROM customers
        WHERE tenant_key = ? AND satisfaction_score IS NOT NULL
      `, [tenantKey]);

      // بازخوردها - استفاده از score به جای rating
      const [feedbacks] = await conn.query(`
        SELECT 
          COALESCE(score, 0) as rating,
          COUNT(*) as count
        FROM feedback
        WHERE tenant_key = ?
        GROUP BY score
        ORDER BY score DESC
      `, [tenantKey]);

      // فروشندگان برتر
      const [topSalespeople] = await conn.query(`
        SELECT 
          sales_person_name,
          COUNT(*) as sales_count,
          SUM(total_amount) as total_revenue
        FROM sales
        WHERE tenant_key = ?
        GROUP BY sales_person_name
        ORDER BY total_revenue DESC
        LIMIT 5
      `, [tenantKey]);

      // آمار کلی
      const [stats] = await conn.query(`
        SELECT 
          (SELECT COUNT(*) FROM sales WHERE tenant_key = ?) as total_sales,
          (SELECT SUM(total_amount) FROM sales WHERE tenant_key = ?) as total_revenue,
          (SELECT COUNT(*) FROM customers WHERE tenant_key = ?) as total_customers,
          (SELECT COUNT(*) FROM sales WHERE tenant_key = ? AND payment_status = 'paid') as paid_sales,
          (SELECT COUNT(*) FROM sales WHERE tenant_key = ? AND sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as sales_this_month,
          (SELECT SUM(total_amount) FROM sales WHERE tenant_key = ? AND sale_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as revenue_this_month
      `, [tenantKey, tenantKey, tenantKey, tenantKey, tenantKey, tenantKey]);

      return NextResponse.json({
        success: true,
        data: {
          monthlySales,
          weeklySales,
          paymentStatus,
          topCustomers,
          satisfaction: satisfaction[0] || {},
          feedbacks,
          topSalespeople,
          stats: stats[0] || {}
        }
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت داده‌های مانیتورینگ:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
