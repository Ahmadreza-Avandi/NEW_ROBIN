import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleActivateTenant(request: NextRequest, admin: any, params: { id: string }) {
  let connection;
  
  try {
    const tenantId = params.id;

    connection = await getMasterConnection();

    // به‌روزرسانی وضعیت
    await connection.query(
      `UPDATE tenants 
       SET subscription_status = 'active',
           updated_at = NOW()
       WHERE id = ?`,
      [tenantId]
    );

    // ثبت لاگ
    await connection.query(
      `INSERT INTO tenant_activity_logs 
       (tenant_id, activity_type, description, performed_by)
       VALUES (?, 'account_activated', 'حساب کاربری فعال شد', ?)`,
      [tenantId, admin.email]
    );

    return NextResponse.json({
      success: true,
      message: 'حساب با موفقیت فعال شد'
    });

  } catch (error) {
    console.error('❌ خطا در فعال‌سازی حساب:', error);
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin((req, admin) => handleActivateTenant(req, admin, params))(request);
}
