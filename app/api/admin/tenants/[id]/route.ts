import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleGetTenant(request: NextRequest, admin: any, params: { id: string }) {
  let connection;
  
  try {
    const tenantId = params.id;

    connection = await getMasterConnection();

    // دریافت اطلاعات tenant
    const [tenants] = await connection.query(
      'SELECT * FROM tenants WHERE id = ? AND is_deleted = false',
      [tenantId]
    ) as any[];

    if (tenants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tenant یافت نشد' },
        { status: 404 }
      );
    }

    const tenant = tenants[0];

    // دریافت تاریخچه اشتراک
    const [subscriptionHistory] = await connection.query(
      'SELECT * FROM subscription_history WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );

    // دریافت لاگ فعالیت‌ها
    const [activityLogs] = await connection.query(
      'SELECT * FROM tenant_activity_logs WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50',
      [tenantId]
    );

    return NextResponse.json({
      success: true,
      data: {
        tenant,
        subscriptionHistory,
        activityLogs
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت جزئیات tenant:', error);
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin((req, admin) => handleGetTenant(req, admin, params))(request);
}
