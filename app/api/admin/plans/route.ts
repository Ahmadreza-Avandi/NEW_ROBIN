import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleGetPlans(request: NextRequest) {
  let connection;
  
  try {
    connection = await getMasterConnection();

    const [plans] = await connection.query(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC'
    );

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('❌ خطا در دریافت پلن‌ها:', error);
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

async function handleCreatePlan(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { plan_key, plan_name, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, description, features } = body;

    if (!plan_key || !plan_name || !price_monthly || !price_yearly) {
      return NextResponse.json(
        { success: false, message: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    connection = await getMasterConnection();

    // بررسی تکراری نبودن plan_key
    const [existing] = await connection.query(
      'SELECT id FROM subscription_plans WHERE plan_key = ?',
      [plan_key]
    ) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'این کلید پلن قبلا استفاده شده است' },
        { status: 400 }
      );
    }

    await connection.query(
      `INSERT INTO subscription_plans 
       (plan_key, plan_name, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, description, features, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [plan_key, plan_name, price_monthly, price_yearly, max_users, max_customers, max_storage_mb, description || '', JSON.stringify(features || {})]
    );

    return NextResponse.json({
      success: true,
      message: 'پلن با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('❌ خطا در ایجاد پلن:', error);
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

export const GET = requireAdmin(handleGetPlans);
export const POST = requireAdmin(handleCreatePlan);
