import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleRenewSubscription(request: NextRequest, admin: any, params: { id: string }) {
  let connection;
  
  try {
    const tenantId = params.id;
    const body = await request.json();
    const { plan_key, months, amount, note } = body;

    if (!plan_key || !months || !amount) {
      return NextResponse.json(
        { success: false, message: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    connection = await getMasterConnection();

    // دریافت اطلاعات tenant
    const [tenants] = await connection.query(
      'SELECT * FROM tenants WHERE id = ?',
      [tenantId]
    );

    if (tenants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tenant یافت نشد' },
        { status: 404 }
      );
    }

    const tenant = tenants[0];

    // محاسبه تاریخ جدید
    const currentEnd = new Date(tenant.subscription_end);
    const newEnd = new Date(currentEnd);
    newEnd.setMonth(newEnd.getMonth() + parseInt(months));

    // به‌روزرسانی tenant
    await connection.query(
      `UPDATE tenants 
       SET subscription_end = ?, 
           subscription_plan = ?,
           subscription_status = 'active',
           updated_at = NOW()
       WHERE id = ?`,
      [newEnd, plan_key, tenantId]
    );

    // ثبت در subscription_history
    await connection.query(
      `INSERT INTO subscription_history 
       (tenant_id, plan_key, subscription_type, start_date, end_date, amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [tenantId, plan_key, months === 12 ? 'yearly' : 'monthly', currentEnd, newEnd, amount, note || '']
    );

    // ثبت لاگ
    await connection.query(
      `INSERT INTO tenant_activity_logs 
       (tenant_id, activity_type, description, metadata, performed_by)
       VALUES (?, 'subscription_renewed', ?, ?, ?)`,
      [
        tenantId,
        `اشتراک تمدید شد: ${plan_key} برای ${months} ماه`,
        JSON.stringify({ plan_key, months, amount }),
        admin.email
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'اشتراک با موفقیت تمدید شد'
    });

  } catch (error) {
    console.error('❌ خطا در تمدید اشتراک:', error);
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
  return requireAdmin((req, admin) => handleRenewSubscription(req, admin, params))(request);
}
