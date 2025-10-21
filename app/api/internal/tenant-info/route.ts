/**
 * Internal API برای دریافت اطلاعات Tenant
 * این API فقط توسط middleware قابل فراخوانی است
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantByKey } from '@/lib/master-database';

export async function GET(request: NextRequest) {
  // بررسی اینکه فقط از middleware فراخوانی شده باشد
  const isInternal = request.headers.get('x-internal-api');
  
  if (!isInternal) {
    return NextResponse.json(
      { success: false, message: 'Forbidden' },
      { status: 403 }
    );
  }
  
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
    
    // برگرداندن اطلاعات tenant (بدون password)
    const { db_password, ...tenantInfo } = tenant;
    
    return NextResponse.json({
      success: true,
      tenant: tenantInfo
    });
    
  } catch (error) {
    console.error('Error in tenant-info API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
