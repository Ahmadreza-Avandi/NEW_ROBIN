import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

async function handleGetCustomerStats(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // آمار کلی مشتریان
      const [totalStats] = await connection.query(`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
          COUNT(CASE WHEN status = 'follow_up' THEN 1 END) as follow_up_customers,
          COUNT(CASE WHEN segment = 'enterprise' THEN 1 END) as enterprise_customers,
          AVG(COALESCE(satisfaction_score, 0)) as avg_satisfaction,
          SUM(COALESCE(potential_value, 0)) as total_potential_value,
          SUM(COALESCE(actual_value, 0)) as total_actual_value
        FROM customers 
        WHERE tenant_key = ?
      `, [tenantKey]) as any[];

      // آمار محصولات علاقه‌مند
      const [productStats] = await connection.query(`
        SELECT COUNT(DISTINCT customer_id) as customers_with_interests
        FROM customer_product_interests cpi
        WHERE EXISTS (
          SELECT 1 FROM customers c 
          WHERE c.id = cpi.customer_id AND c.tenant_key = ?
        )
      `, [tenantKey]) as any[];

      // آمار مشتریان جدید در 30 روز گذشته
      const [newCustomersStats] = await connection.query(`
        SELECT 
          COUNT(*) as new_customers_30d,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_customers_7d
        FROM customers 
        WHERE tenant_key = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [tenantKey]) as any[];

      const stats = totalStats[0] || {};
      const productStat = productStats[0] || {};
      const newStats = newCustomersStats[0] || {};

      return NextResponse.json({
        success: true,
        data: {
          total_customers: stats.total_customers || 0,
          active_customers: stats.active_customers || 0,
          inactive_customers: stats.inactive_customers || 0,
          follow_up_customers: stats.follow_up_customers || 0,
          enterprise_customers: stats.enterprise_customers || 0,
          avg_satisfaction: parseFloat(stats.avg_satisfaction || 0),
          total_potential_value: parseFloat(stats.total_potential_value || 0),
          total_actual_value: parseFloat(stats.total_actual_value || 0),
          customers_with_interests: productStat.customers_with_interests || 0,
          new_customers_30d: newStats.new_customers_30d || 0,
          new_customers_7d: newStats.new_customers_7d || 0
        }
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت آمار مشتریان:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantAuth(handleGetCustomerStats);