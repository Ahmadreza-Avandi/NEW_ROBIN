import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Smart environment detection
function detectEnvironment() {
  const isDocker = process.env.DOCKER_CONTAINER === 'true' || 
                   process.env.HOSTNAME?.includes('docker') ||
                   process.env.HOSTNAME?.includes('nextjs') ||
                   process.env.HOSTNAME?.includes('crm');
  
  const isLocal = process.env.NODE_ENV === 'development' && !isDocker;
  
  return { isDocker, isLocal };
}

function getDbConfig() {
  const env = detectEnvironment();
  
  let host = process.env.DATABASE_HOST || process.env.DB_HOST;
  if (env.isLocal && (host === 'mysql' || !host)) {
    host = 'localhost';
  } else if (env.isDocker && (host === 'localhost' || !host)) {
    host = 'mysql';
  } else if (!host) {
    host = process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost';
  }
  
  let user = process.env.DATABASE_USER || process.env.DB_USER;
  if (!user) {
    user = env.isLocal ? 'root' : 'crm_user';
  }
  
  let password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
  if (!password) {
    password = env.isLocal ? '' : '1234';
  }
  
  return { host, user, password };
}

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

    // دریافت اطلاعات پلن
    const [plans] = await connection.query(
      'SELECT * FROM subscription_plans WHERE plan_key = ?',
      [subscription_plan]
    ) as any[];

    if (plans.length === 0) {
      return NextResponse.json(
        { success: false, message: `پلن ${subscription_plan} یافت نشد` },
        { status: 400 }
      );
    }

    const plan = plans[0];
    console.log(`✅ پلن ${plan.plan_name} یافت شد`);

    // محاسبه تاریخ انقضا
    const subscription_start = new Date();
    let calculated_subscription_end: Date;
    
    if (subscription_end) {
      calculated_subscription_end = new Date(subscription_end);
    } else {
      calculated_subscription_end = new Date();
      calculated_subscription_end.setMonth(calculated_subscription_end.getMonth() + (subscription_months || 1));
    }

    const dbConfig = getDbConfig();

    // ثبت tenant در master database
    console.log('💾 ثبت tenant در master database...');
    const [result] = await connection.query(`
      INSERT INTO tenants (
        tenant_key, company_name, db_name, db_host, db_port, db_user, db_password,
        admin_name, admin_email, admin_phone,
        subscription_status, subscription_plan, subscription_start, subscription_end,
        max_users, max_customers, max_storage_mb, features,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tenant_key, company_name,
      'crm_system', dbConfig.host, 3306, 
      dbConfig.user, dbConfig.password,
      admin_name, admin_email, admin_phone || '',
      'active', subscription_plan, subscription_start, calculated_subscription_end,
      plan.max_users, plan.max_customers, plan.max_storage_mb, 
      JSON.stringify(plan.features || {}),
      true
    ]) as any[];

    const tenant_id = result.insertId;
    console.log(`✅ Tenant ثبت شد (ID: ${tenant_id})`);

    // ثبت در subscription_history
    console.log('📝 ثبت تاریخچه اشتراک...');
    const amount = (subscription_months || 1) === 12 ? plan.price_yearly : plan.price_monthly;
    
    await connection.query(`
      INSERT INTO subscription_history (
        tenant_id, plan_key, subscription_type, start_date, end_date, amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      tenant_id, subscription_plan, 
      (subscription_months || 1) === 12 ? 'yearly' : 'monthly', 
      subscription_start, calculated_subscription_end, amount, 'completed'
    ]);

    console.log('✅ تاریخچه ثبت شد');

    // ثبت لاگ
    console.log('📋 ثبت لاگ فعالیت...');
    await connection.query(`
      INSERT INTO tenant_activity_logs (
        tenant_id, activity_type, description, metadata
      ) VALUES (?, ?, ?, ?)
    `, [
      tenant_id, 'tenant_created', 
      `Tenant created: ${company_name}`, 
      JSON.stringify({ plan_key: subscription_plan, subscription_months: subscription_months || 1, admin_email })
    ]);

    console.log('✅ لاگ ثبت شد');

    // ایجاد کاربر admin در crm_system
    console.log('👤 ایجاد کاربر admin...');
    const passwordHash = await bcrypt.hash(admin_password, 10);
    const userId = uuidv4();

    // Switch to crm_system database for user creation
    await connection.query('USE crm_system');
    
    await connection.query(`
      INSERT INTO users (
        id, name, email, password, role, status, tenant_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId, admin_name, admin_email, passwordHash, 'ceo', 'active', tenant_key
    ]);

    console.log('✅ کاربر admin ایجاد شد');
    console.log('✅ Tenant created successfully:', tenant_id);

    // Generate URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const tenantUrl = `${baseUrl}/${tenant_key}/login`;

    return NextResponse.json({
      success: true,
      message: 'Tenant با موفقیت ایجاد شد',
      data: {
        tenant_id: tenant_id,
        tenant_key: tenant_key,
        url: tenantUrl,
        admin_password: admin_password
      }
    });

  } catch (error) {
    console.error('❌ خطا در ایجاد tenant:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطای سرور';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}