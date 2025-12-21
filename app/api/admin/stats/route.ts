import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleGetStats(request: NextRequest) {
  let connection;
  
  try {
    connection = await getMasterConnection();

    // دریافت آمار tenants
    const [tenantStats] = await connection.query(`
      SELECT 
        COUNT(*) as totalTenants,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as activeTenants,
        SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expiredTenants,
        SUM(CASE WHEN subscription_status = 'suspended' THEN 1 ELSE 0 END) as suspendedTenants
      FROM tenants 
      WHERE is_deleted = false
    `) as any[];

    // دریافت آمار درآمد (از subscription_history)
    const [revenueStats] = await connection.query(`
      SELECT 
        SUM(CASE WHEN subscription_type = 'monthly' AND status = 'completed' 
            AND start_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN amount ELSE 0 END) as monthlyRevenue,
        SUM(CASE WHEN status = 'completed' 
            AND start_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR) THEN amount ELSE 0 END) as yearlyRevenue
      FROM subscription_history
    `) as any[];

    const stats = tenantStats[0];
    const revenue = revenueStats[0];

    return NextResponse.json({
      success: true,
      data: {
        totalTenants: stats.totalTenants || 0,
        activeTenants: stats.activeTenants || 0,
        expiredTenants: stats.expiredTenants || 0,
        suspendedTenants: stats.suspendedTenants || 0,
        monthlyRevenue: revenue.monthlyRevenue || 0,
        yearlyRevenue: revenue.yearlyRevenue || 0
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