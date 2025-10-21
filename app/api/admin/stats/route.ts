import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleGetStats(request: NextRequest) {
  let connection;
  
  try {
    connection = await getMasterConnection();

    // تعداد tenants بر اساس وضعیت
    const [statusCounts] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN subscription_status = 'suspended' THEN 1 ELSE 0 END) as suspended
      FROM tenants
      WHERE is_deleted = false
    `) as any[];

    const stats = statusCounts[0];

    // محاسبه درآمد ماهانه (30 روز گذشته)
    const [monthlyRevenue] = await connection.query(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM subscription_history
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND status = 'completed'
    `) as any[];

    // محاسبه درآمد سالانه (365 روز گذشته)
    const [yearlyRevenue] = await connection.query(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM subscription_history
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)
      AND status = 'completed'
    `) as any[];

    // آخرین tenants ایجاد شده
    const [recentTenants] = await connection.query(`
      SELECT tenant_key, company_name, created_at
      FROM tenants
      WHERE is_deleted = false
      ORDER BY created_at DESC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      data: {
        totalTenants: stats.total,
        activeTenants: stats.active,
        expiredTenants: stats.expired,
        suspendedTenants: stats.suspended,
        monthlyRevenue: parseFloat(monthlyRevenue[0].revenue),
        yearlyRevenue: parseFloat(yearlyRevenue[0].revenue),
        recentTenants
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت آمار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export const GET = requireAdmin(handleGetStats);
