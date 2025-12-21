import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';

export async function POST(request: NextRequest) {
  try {
    const { tenant_key } = await request.json();
    
    if (!tenant_key) {
      return NextResponse.json({
        success: false,
        error: 'tenant_key is required'
      }, { status: 400 });
    }

    const connection = await getMasterConnection();
    
    const [tenants]: any = await connection.execute(
      'SELECT id, tenant_key, company_name, is_active, is_deleted FROM tenants WHERE tenant_key = ?',
      [tenant_key]
    );
    
    if (tenants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 });
    }
    
    const tenant = tenants[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        tenant_key: tenant.tenant_key,
        company_name: tenant.company_name,
        is_active: tenant.is_active,
        is_deleted: tenant.is_deleted
      }
    });
    
  } catch (error: any) {
    console.error('Error checking tenant:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}