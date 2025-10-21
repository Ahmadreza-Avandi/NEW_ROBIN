import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleDeactivatePlan(request: NextRequest, admin: any, params: { id: string }) {
  let connection;
  
  try {
    const planId = params.id;

    connection = await getMasterConnection();

    await connection.query(
      `UPDATE subscription_plans 
       SET is_active = false, updated_at = NOW()
       WHERE id = ?`,
      [planId]
    );

    return NextResponse.json({
      success: true,
      message: 'پلن با موفقیت غیرفعال شد'
    });

  } catch (error) {
    console.error('❌ خطا در غیرفعال کردن پلن:', error);
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
  return requireAdmin((req, admin) => handleDeactivatePlan(req, admin, params))(request);
}
