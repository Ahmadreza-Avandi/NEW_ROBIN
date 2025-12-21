import { NextRequest, NextResponse } from 'next/server';
import { withWordPressAuth } from '@/lib/wordpress-auth';

/**
 * GET /api/integrations/wordpress/test
 * Test endpoint for WordPress integration connection validation
 */
async function handleConnectionTest(request: NextRequest, tenantKey: string, apiKeyInfo: any): Promise<NextResponse> {
  try {
    // Basic system health check
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api_version: '1.0.0',
      tenant_key: tenantKey,
      api_key_name: apiKeyInfo.name,
      authenticated: true,
      endpoints: {
        customers: '/api/integrations/wordpress/customers',
        orders: '/api/integrations/wordpress/orders',
        products: '/api/integrations/wordpress/products'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'WordPress integration connection successful',
      data: systemInfo
    });

  } catch (error) {
    console.error('WordPress connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        message: 'Internal server error during connection test'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint with WordPress authentication
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return withWordPressAuth(
    request,
    handleConnectionTest
  );
}