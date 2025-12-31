import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/permissions';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';

/**
 * Permission checking middleware for API routes
 * Requirements: 10.4
 */
export function requirePermission(moduleName: string) {
  return function (
    handler: (request: NextRequest, session: any) => Promise<Response>
  ) {
    return async (request: NextRequest) => {
      try {
        // Extract tenant key from URL path
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const tenantKeyIndex = pathSegments.findIndex(segment => segment === 'api') + 1;
        const tenantKey = pathSegments[tenantKeyIndex];

        if (!tenantKey) {
          return NextResponse.json(
            { success: false, message: 'Tenant key یافت نشد' },
            { status: 400 }
          );
        }

        // Get session from request
        const session = getTenantSessionFromRequest(request, tenantKey);

        if (!session) {
          return NextResponse.json(
            { success: false, message: 'احراز هویت نشده' },
            { status: 401 }
          );
        }

        // Check permission
        const hasAccess = await hasPermission(session.userId, moduleName);

        if (!hasAccess) {
          return NextResponse.json(
            { 
              success: false, 
              message: `عدم دسترسی به ماژول ${moduleName}`,
              code: 'PERMISSION_DENIED'
            },
            { status: 403 }
          );
        }

        // Permission granted, proceed with handler
        return handler(request, session);
      } catch (error) {
        console.error('Error checking API permission:', error);
        return NextResponse.json(
          { success: false, message: 'خطا در بررسی دسترسی' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Combined tenant auth and permission middleware
 * Requirements: 10.4
 */
export function requireTenantPermission(moduleName: string) {
  return function (
    handler: (request: NextRequest, session: any) => Promise<Response>
  ) {
    return async (request: NextRequest) => {
      try {
        // Extract tenant key from URL path
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const tenantKeyIndex = pathSegments.findIndex(segment => segment === 'api') + 1;
        const tenantKey = pathSegments[tenantKeyIndex];

        if (!tenantKey) {
          return NextResponse.json(
            { success: false, message: 'Tenant key یافت نشد' },
            { status: 400 }
          );
        }

        // Get session from request
        const session = getTenantSessionFromRequest(request, tenantKey);

        if (!session) {
          return NextResponse.json(
            { success: false, message: 'احراز هویت نشده' },
            { status: 401 }
          );
        }

        // Check permission for the module
        const hasAccess = await hasPermission(session.userId, moduleName);

        if (!hasAccess) {
          return NextResponse.json(
            { 
              success: false, 
              message: `عدم دسترسی به ماژول ${moduleName}`,
              code: 'PERMISSION_DENIED'
            },
            { status: 403 }
          );
        }

        // Both auth and permission checks passed
        return handler(request, session);
      } catch (error) {
        console.error('Error in tenant permission middleware:', error);
        return NextResponse.json(
          { success: false, message: 'خطا در بررسی دسترسی' },
          { status: 500 }
        );
      }
    };
  };
}