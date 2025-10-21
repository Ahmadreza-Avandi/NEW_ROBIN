import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import { requireAdmin } from '@/lib/admin-auth';

async function handleGetTenants(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    connection = await getMasterConnection();

    // ساخت query با فیلترها
    let whereConditions = ['is_deleted = false'];
    let queryParams: any[] = [];

    if (status) {
      whereConditions.push('subscription_status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(tenant_key LIKE ? OR company_name LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // دریافت تعداد کل
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM tenants ${whereClause}`,
      queryParams
    ) as any[];
    const total = countResult[0].total;

    // دریافت لیست tenants
    const [tenants] = await connection.query(
      `SELECT 
        id, tenant_key, company_name, admin_name, admin_email, admin_phone,
        subscription_status, subscription_plan, subscription_start, subscription_end,
        max_users, max_customers, max_storage_mb, features,
        is_active, created_at
      FROM tenants 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        tenants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت لیست tenants:', error);
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

async function handleCreateTenant(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { tenant_key, company_name, admin_name, admin_email, admin_phone, admin_password, subscription_plan, subscription_months } = body;

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
      subscription_months: subscription_months || 1
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'خطا در ایجاد tenant' },
        { status: 500 }
      );
    }

    // TODO: ارسال ایمیل خوش‌آمدگویی
    // این بخش در آینده پیاده‌سازی می‌شود

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

export const GET = requireAdmin(handleGetTenants);
export const POST = requireAdmin(handleCreateTenant);
