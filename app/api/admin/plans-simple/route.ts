import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    console.log('🔍 Simple Plans API called');
    
    connection = await getMasterConnection();

    // دریافت لیست پلن‌ها
    const [plans] = await connection.query(`
      SELECT 
        id, plan_key, plan_name, description,
        price_monthly, price_yearly,
        max_users, max_customers, max_storage_mb,
        features, is_active, created_at
      FROM subscription_plans 
      WHERE is_active = 1
      ORDER BY price_monthly ASC
    `);

    console.log(`✅ Found ${plans.length} plans`);

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('❌ خطا در دریافت لیست پلن‌ها:', error);
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