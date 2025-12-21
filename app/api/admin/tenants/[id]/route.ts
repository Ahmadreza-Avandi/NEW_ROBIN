import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';

// GET - دریافت جزئیات یک tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;
    const connection = await getMasterConnection();
    
    // دریافت اطلاعات tenant
    const [tenants]: any = await connection.execute(
      `SELECT t.*, 
        sp.plan_name, sp.price_monthly, sp.price_yearly,
        (SELECT COUNT(*) FROM tenant_api_keys WHERE tenant_id = t.id AND is_active = 1) as active_api_keys
       FROM tenants t
       LEFT JOIN subscription_plans sp ON t.subscription_plan = sp.plan_key
       WHERE t.id = ? AND t.is_deleted = 0`,
      [tenantId]
    );
    
    if (tenants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tenant یافت نشد'
      }, { status: 404 });
    }
    
    // دریافت تاریخچه اشتراک
    const [history]: any = await connection.execute(
      `SELECT * FROM subscription_history 
       WHERE tenant_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [tenantId]
    );
    
    // دریافت کلیدهای API
    const [apiKeys]: any = await connection.execute(
      `SELECT id, api_key_prefix, name, is_active, last_used_at, created_at 
       FROM tenant_api_keys 
       WHERE tenant_id = ?
       ORDER BY created_at DESC`,
      [tenantId]
    );
    
    return NextResponse.json({
      success: true,
      data: {
        tenant: tenants[0],
        subscription_history: history,
        api_keys: apiKeys
      }
    });
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PATCH - بروزرسانی tenant
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;
    const body = await request.json();
    const { action, ...data } = body;
    
    const connection = await getMasterConnection();
    
    // بررسی وجود tenant
    const [tenants]: any = await connection.execute(
      'SELECT * FROM tenants WHERE id = ? AND is_deleted = 0',
      [tenantId]
    );
    
    if (tenants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tenant یافت نشد'
      }, { status: 404 });
    }
    
    const tenant = tenants[0];
    
    switch (action) {
      case 'renew': {
        // تمدید اشتراک
        const { subscription_end, plan_key, amount, notes } = data;
        
        if (!subscription_end) {
          return NextResponse.json({
            success: false,
            error: 'تاریخ پایان اشتراک الزامی است'
          }, { status: 400 });
        }
        
        // بروزرسانی tenant
        await connection.execute(
          `UPDATE tenants SET 
            subscription_status = 'active',
            subscription_end = ?,
            subscription_plan = COALESCE(?, subscription_plan),
            updated_at = NOW()
           WHERE id = ?`,
          [subscription_end, plan_key || null, tenantId]
        );
        
        // ثبت در تاریخچه
        await connection.execute(
          `INSERT INTO subscription_history 
           (tenant_id, plan_key, subscription_type, start_date, end_date, amount, status, notes)
           VALUES (?, ?, 'custom', CURDATE(), ?, ?, 'active', ?)`,
          [
            tenantId,
            plan_key || tenant.subscription_plan,
            subscription_end,
            amount || 0,
            notes || 'تمدید اشتراک'
          ]
        );
        
        // ثبت لاگ
        await connection.execute(
          `INSERT INTO tenant_activity_logs 
           (tenant_id, activity_type, description, metadata)
           VALUES (?, 'updated', ?, ?)`,
          [
            tenantId,
            `تمدید اشتراک تا ${subscription_end}`,
            JSON.stringify({ action: 'renew', subscription_end, plan_key, amount })
          ]
        );
        
        return NextResponse.json({
          success: true,
          message: 'اشتراک با موفقیت تمدید شد'
        });
      }
      
      case 'suspend': {
        // تعلیق اشتراک
        const { reason } = data;
        
        await connection.execute(
          `UPDATE tenants SET 
            subscription_status = 'suspended',
            updated_at = NOW()
           WHERE id = ?`,
          [tenantId]
        );
        
        await connection.execute(
          `INSERT INTO tenant_activity_logs 
           (tenant_id, activity_type, description, metadata)
           VALUES (?, 'suspended', ?, ?)`,
          [
            tenantId,
            `تعلیق اشتراک: ${reason || 'بدون دلیل'}`,
            JSON.stringify({ action: 'suspend', reason })
          ]
        );
        
        return NextResponse.json({
          success: true,
          message: 'اشتراک با موفقیت تعلیق شد'
        });
      }
      
      case 'activate': {
        // فعال‌سازی اشتراک
        await connection.execute(
          `UPDATE tenants SET 
            subscription_status = 'active',
            updated_at = NOW()
           WHERE id = ?`,
          [tenantId]
        );
        
        await connection.execute(
          `INSERT INTO tenant_activity_logs 
           (tenant_id, activity_type, description)
           VALUES (?, 'activated', 'فعال‌سازی مجدد اشتراک')`,
          [tenantId]
        );
        
        return NextResponse.json({
          success: true,
          message: 'اشتراک با موفقیت فعال شد'
        });
      }
      
      case 'change_plan': {
        // تغییر پلن
        const { plan_key, subscription_end } = data;
        
        if (!plan_key) {
          return NextResponse.json({
            success: false,
            error: 'پلن جدید الزامی است'
          }, { status: 400 });
        }
        
        // دریافت اطلاعات پلن جدید
        const [plans]: any = await connection.execute(
          'SELECT * FROM subscription_plans WHERE plan_key = ?',
          [plan_key]
        );
        
        if (plans.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'پلن یافت نشد'
          }, { status: 404 });
        }
        
        const plan = plans[0];
        
        await connection.execute(
          `UPDATE tenants SET 
            subscription_plan = ?,
            max_users = ?,
            max_customers = ?,
            max_storage_mb = ?,
            features = ?,
            subscription_end = COALESCE(?, subscription_end),
            updated_at = NOW()
           WHERE id = ?`,
          [
            plan_key,
            plan.max_users,
            plan.max_customers,
            plan.max_storage_mb,
            plan.features,
            subscription_end || null,
            tenantId
          ]
        );
        
        await connection.execute(
          `INSERT INTO tenant_activity_logs 
           (tenant_id, activity_type, description, metadata)
           VALUES (?, 'updated', ?, ?)`,
          [
            tenantId,
            `تغییر پلن به ${plan.plan_name}`,
            JSON.stringify({ action: 'change_plan', old_plan: tenant.subscription_plan, new_plan: plan_key })
          ]
        );
        
        return NextResponse.json({
          success: true,
          message: `پلن با موفقیت به ${plan.plan_name} تغییر کرد`
        });
      }
      
      case 'update_info': {
        // ویرایش اطلاعات
        const { company_name, admin_name, admin_email, admin_phone } = data;
        
        await connection.execute(
          `UPDATE tenants SET 
            company_name = COALESCE(?, company_name),
            admin_name = COALESCE(?, admin_name),
            admin_email = COALESCE(?, admin_email),
            admin_phone = COALESCE(?, admin_phone),
            updated_at = NOW()
           WHERE id = ?`,
          [company_name, admin_name, admin_email, admin_phone, tenantId]
        );
        
        return NextResponse.json({
          success: true,
          message: 'اطلاعات با موفقیت بروزرسانی شد'
        });
      }
      
      default:
        return NextResponse.json({
          success: false,
          error: 'عملیات نامعتبر'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - حذف tenant (hard delete با تمام داده‌ها)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;
    const connection = await getMasterConnection();

    // بررسی وجود tenant
    const [tenants]: any = await connection.execute(
      'SELECT * FROM tenants WHERE id = ? AND is_deleted = 0',
      [tenantId]
    );

    if (tenants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tenant یافت نشد'
      }, { status: 404 });
    }

    const tenant = tenants[0];
    const tenantKey = tenant.tenant_key;

    console.log(`🗑️ شروع حذف کامل tenant: ${tenantKey}`);

    // شروع transaction
    await connection.execute('START TRANSACTION');

    try {
      // 1. حذف کلیدهای API
      console.log('🔑 حذف کلیدهای API...');
      await connection.execute(
        'DELETE FROM tenant_api_keys WHERE tenant_id = ?',
        [tenantId]
      );

      // 2. حذف تاریخچه اشتراک
      console.log('📋 حذف تاریخچه اشتراک...');
      await connection.execute(
        'DELETE FROM subscription_history WHERE tenant_id = ?',
        [tenantId]
      );

      // 3. حذف لاگ‌های فعالیت
      console.log('📝 حذف لاگ‌های فعالیت...');
      await connection.execute(
        'DELETE FROM tenant_activity_logs WHERE tenant_id = ?',
        [tenantId]
      );

      // 4. حذف تمام داده‌های CRM مربوط به این tenant
      console.log('🗂️ حذف داده‌های CRM...');
      
      // حذف کاربران
      await connection.execute(
        'DELETE FROM crm_system.users WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف مشتریان
      await connection.execute(
        'DELETE FROM crm_system.customers WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف محصولات
      await connection.execute(
        'DELETE FROM crm_system.products WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف فروش‌ها
      await connection.execute(
        'DELETE FROM crm_system.sales WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف آیتم‌های فروش
      await connection.execute(
        'DELETE FROM crm_system.sale_items WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف فعالیت‌ها
      await connection.execute(
        'DELETE FROM crm_system.activities WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف وظایف
      await connection.execute(
        'DELETE FROM crm_system.tasks WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف بازخوردها
      await connection.execute(
        'DELETE FROM crm_system.feedback WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف رویدادهای تقویم
      await connection.execute(
        'DELETE FROM crm_system.calendar_events WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف اسناد
      await connection.execute(
        'DELETE FROM crm_system.documents WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف چت‌ها
      await connection.execute(
        'DELETE FROM crm_system.chat_messages WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف گزارش‌ها
      await connection.execute(
        'DELETE FROM crm_system.reports WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف تنظیمات
      await connection.execute(
        'DELETE FROM crm_system.settings WHERE tenant_key = ?',
        [tenantKey]
      );

      // حذف علاقه‌مندی‌های مشتریان
      await connection.execute(
        'DELETE FROM crm_system.customer_interests WHERE tenant_key = ?',
        [tenantKey]
      );

      // 5. در نهایت حذف tenant از master database
      console.log('🏢 حذف tenant از master database...');
      await connection.execute(
        'DELETE FROM tenants WHERE id = ?',
        [tenantId]
      );

      // commit transaction
      await connection.execute('COMMIT');

      console.log(`✅ Tenant ${tenantKey} و تمام داده‌هایش با موفقیت حذف شد`);

      return NextResponse.json({
        success: true,
        message: 'Tenant و تمام داده‌هایش با موفقیت حذف شد'
      });

    } catch (error) {
      // rollback در صورت خطا
      await connection.execute('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
