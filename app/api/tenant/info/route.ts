/**
 * API برای دریافت اطلاعات Tenant (برای استفاده در client-side)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantByKey } from '@/lib/master-database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantKey = searchParams.get('tenant_key');
    
    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'tenant_key is required' },
        { status: 400 }
      );
    }
    
    // دریافت اطلاعات tenant از master database
    const tenant = await getTenantByKey(tenantKey);
    
    if (!tenant) {
      return NextResponse.json(
        { success: false, message: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    // برگرداندن اطلاعات عمومی tenant (بدون اطلاعات حساس)
    const publicInfo = {
      tenant_key: tenant.tenant_key,
      company_name: tenant.company_name,
      subscription_status: tenant.subscription_status,
      subscription_plan: tenant.subscription_plan,
      subscription_end: tenant.subscription_end,
      features: tenant.features,
      max_users: tenant.max_users,
      max_customers: tenant.max_customers,
      max_storage_mb: tenant.max_storage_mb,
    };
    
    return NextResponse.json({
      success: true,
      tenant: publicInfo
    });
    
  } catch (error) {
    console.error('Error in tenant info API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
