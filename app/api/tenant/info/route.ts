/**
 * API برای دریافت اطلاعات Tenant (برای استفاده در client-side)
 */

import { NextRequest, NextResponse } from 'next/server';

// اطلاعات tenant ها (موقتاً به صورت hardcode)
const TENANTS: Record<string, any> = {
  'rabin': {
    tenant_key: 'rabin',
    company_name: 'رابین تجارت',
    subscription_status: 'active',
    subscription_plan: 'enterprise',
    subscription_end: null,
    features: ['voice_assistant', 'crm', 'reports', 'analytics'],
    max_users: 100,
    max_customers: 10000,
    max_storage_mb: 10240,
  },
  'demo': {
    tenant_key: 'demo',
    company_name: 'شرکت دمو',
    subscription_status: 'active',
    subscription_plan: 'trial',
    subscription_end: '2026-12-31',
    features: ['voice_assistant', 'crm', 'reports'],
    max_users: 10,
    max_customers: 1000,
    max_storage_mb: 1024,
  },
  'samin': {
    tenant_key: 'samin',
    company_name: 'سامین',
    subscription_status: 'active',
    subscription_plan: 'professional',
    subscription_end: '2026-06-30',
    features: ['crm', 'reports'],
    max_users: 50,
    max_customers: 5000,
    max_storage_mb: 5120,
  },
};

export async function GET(request: NextRequest) {
  try {
    // دریافت tenant_key از query parameter یا header
    const searchParams = request.nextUrl.searchParams;
    const tenantKey = searchParams.get('tenant_key') || request.headers.get('X-Tenant-Key');
    
    console.log('🔍 Tenant Info API - tenant_key:', tenantKey);
    
    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'tenant_key is required (via query param or X-Tenant-Key header)' },
        { status: 400 }
      );
    }
    
    // دریافت اطلاعات tenant
    const tenant = TENANTS[tenantKey];
    
    if (!tenant) {
      console.log('❌ Tenant not found:', tenantKey);
      return NextResponse.json(
        { success: false, message: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Tenant found:', tenant.company_name);
    
    return NextResponse.json({
      success: true,
      tenant: tenant
    });
    
  } catch (error) {
    console.error('❌ Error in tenant info API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
