import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleUpdatePlan(request: NextRequest, admin: any, params: { id: string }) {
  let connection;
  
  try {
    const planId = params.id;
    const body = await request.json();
    const { plan_name, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, description, features } = body;

    if (!plan_name || !price_monthly || !price_yearly) {
      return NextResponse.json(
        { success: false, message: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    connection = await getMasterConnection();

    await connection.query(
      `UPDATE subscription_plans 
       SET plan_name = ?, price_monthly = ?, price_yearly = ?, 
           max_users = ?, max_customers = ?, max_storage_mb = ?,
           description = ?, features = ?, updated_at = NOW()
       WHERE id = ?`,
      [plan_name, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, description || '', JSON.stringify(features || {}), planId]
    );

    return NextResponse.json({
      success: true,
      message: 'پلن با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی پلن:', error);
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin((req, admin) => handleUpdatePlan(req, admin, params))(request);
}
