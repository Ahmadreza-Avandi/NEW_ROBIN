import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    console.log('🔍 Simple Create Tenant API called');
    
    const body = await request.json();
    const { tenant_key, company_name, admin_name, admin_email, admin_phone, admin_password, subscription_plan, subscription_months, subscription_end } = body;

    console.log('📝 Tenant data received:', { tenant_key, company_name, admin_name, admin_email, subscription_plan });

    // اعتبارسنجی ورودی
    if (!tenant_key || !company_name || !admin_name || !admin_email || !admin_password || !subscription_plan) {
      return NextResponse.json(
        { success: false, message: 'فیلدهای الزامی را پر کنید (شامل رمز عبور)' },
        { status: 400 }
      );
    }

    // اعتبارسنجی رمز عبور
    if (admin_password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'رمز عبور باید حداقل 8 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت tenant_key
    const tenantKeyRegex = /^[a-z0-9-]+$/;
    if (!tenantKeyRegex.test(tenant_key)) {
      return NextResponse.json(
        { success: false, message: 'کلید tenant فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد' },
        { status: 400 }
      );
    }

    if (tenant_key.length < 3) {
      return NextResponse.json(
        { success: false, message: 'کلید tenant باید حداقل 3 کاراکتر باشد' },
        { status: 400 }
      );
    }

    connection = await getMasterConnection();

    // بررسی تکراری نبودن tenant_key
    const [existing] = await connection.query(
      'SELECT id FROM tenants WHERE tenant_key = ?',
      [tenant_key]
    ) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'این کلید tenant قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating tenant...');

    // فراخوانی اسکریپت ثبت tenant (بدون ایجاد دیتابیس جداگانه)
    const { registerTenant } = require('@/scripts/simple-register-tenant.cjs');
    
    const result = await registerTenant({
      tenant_key,
      company_name,
      admin_name,
      admin_email,
      admin_phone: admin_phone || '',
      admin_password,
      plan_key: subscription_plan,
      subscription_months: subscription_months || 1,
      subscription_end: subscription_end || null
    });

    if (!result.success) {
      console.error('❌ Register tenant failed:', result.error);
      return NextResponse.json(
        { success: false, message: result.error || 'خطا در ایجاد tenant' },
        { status: 500 }
      );
    }

    console.log('✅ Tenant created successfully:', result.tenant_id);

    return NextResponse.json({
      success: true,
      message: 'Tenant با موفقیت ایجاد شد',
      data: {
        tenant_id: result.tenant_id,
        tenant_key: result.tenant_key,
        url: result.url,
        admin_password: result.admin_password
      }
    });

  } catch (error) {
    console.error('❌ خطا در ایجاد tenant:', error);
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