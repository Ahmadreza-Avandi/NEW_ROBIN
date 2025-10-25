import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT decoder for middleware (Edge Runtime compatible)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect /dashboard routes without tenant to not-found
  if (pathname.startsWith('/dashboard') && !pathname.match(/^\/[^\/]+\/dashboard/)) {
    // Try to get tenant from cookie
    const tenantToken = request.cookies.get('tenant_token')?.value;
    
    if (tenantToken) {
      try {
        const decoded = decodeJWT(tenantToken);
        if (decoded && decoded.tenantKey) {
          // Redirect to tenant-specific dashboard
          const newPath = `/${decoded.tenantKey}${pathname}`;
          return NextResponse.redirect(new URL(newPath, request.url));
        }
      } catch (error) {
        // Token invalid, show not-found
      }
    }
    
    // No valid tenant, show not-found page
    return NextResponse.rewrite(new URL('/dashboard/not-found', request.url));
  }

  // Skip middleware for these paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/tenant/auth') ||
    pathname.startsWith('/api/admin/auth') ||
    pathname.startsWith('/api/test-email') ||
    pathname.startsWith('/api/Gmail') ||
    pathname.startsWith('/api/feedback/form/') ||
    pathname.startsWith('/api/feedback/submit') ||
    pathname.startsWith('/api/tenant/info') ||
    pathname.startsWith('/api/internal/tenant-info') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/feedback/form/') ||
    pathname === '/login' ||
    pathname === '/email-test' ||
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // For tenant dashboard routes, check authentication and permissions
  const tenantDashboardMatch = pathname.match(/^\/([^\/]+)\/dashboard/);
  if (pathname.startsWith('/dashboard') || tenantDashboardMatch) {
    const tenantKey = tenantDashboardMatch ? tenantDashboardMatch[1] : null;
    const token = request.cookies.get('tenant_token')?.value || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      const redirectUrl = tenantKey ? `/${tenantKey}/login` : '/login';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Verify token
    try {
      const decoded = decodeJWT(token);
      if (!decoded) {
        const redirectUrl = tenantKey ? `/${tenantKey}/login` : '/login';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Check permissions for specific routes (except basic ones)
      const dashboardPath = tenantKey ? `/${tenantKey}/dashboard` : '/dashboard';
      const publicRoutes = [`${dashboardPath}`, `${dashboardPath}/profile`];
      const adminRoutes = [`${dashboardPath}/coworkers`, `${dashboardPath}/settings`, `${dashboardPath}/system-monitoring`];
      const managerRoutes = [`${dashboardPath}/reports`, `${dashboardPath}/daily-reports`, `${dashboardPath}/insights`];
      const documentsRoutes = [`${dashboardPath}/documents`];
      
      const userRole = decoded.role;
      
      // Admin routes - فقط مدیر عامل و مدیر فروش
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (userRole !== 'ceo' && userRole !== 'sales_manager') {
          return NextResponse.redirect(new URL(`${dashboardPath}?error=access_denied`, request.url));
        }
      }
      
      // Manager routes - مدیران و بالاتر
      if (managerRoutes.some(route => pathname.startsWith(route))) {
        if (userRole !== 'ceo' && userRole !== 'sales_manager') {
          return NextResponse.redirect(new URL(`${dashboardPath}?error=access_denied`, request.url));
        }
      }
      
      // Documents routes - همه کاربران فعال
      if (documentsRoutes.some(route => pathname.startsWith(route))) {
        // همه کاربران احراز هویت شده می‌توانند به اسناد دسترسی داشته باشند
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For API routes (except auth and feedback), verify token and add user info to headers
  if (pathname.startsWith('/api') &&
    !pathname.startsWith('/api/auth') &&
    !pathname.startsWith('/api/feedback/form/') &&
    !pathname.startsWith('/api/feedback/submit') &&
    !pathname.startsWith('/api/health')) {
    
    // Extract tenant key from referer header for tenant API calls
    const referer = request.headers.get('referer');
    let tenantKeyFromReferer = null;
    if (referer) {
      const refererMatch = referer.match(/\/([^\/]+)\/dashboard/);
      if (refererMatch) {
        tenantKeyFromReferer = refererMatch[1];
      }
    }
    // Development bypass for specific voice-analysis endpoints when allowed
    const allowDev = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_FALLBACK === '1';
    if (allowDev && (
      pathname.startsWith('/api/voice-analysis/sahab-speech-recognition') ||
      pathname.startsWith('/api/voice-analysis/sahab-tts-v2') ||
      pathname.startsWith('/api/voice-analysis/sahab-tts') ||
      pathname.startsWith('/api/voice-analysis/debug-sahab')
    )) {
      return NextResponse.next();
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('tenant_token')?.value ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غیر مجاز - لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    try {
      const decoded = decodeJWT(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'توکن نامعتبر' },
          { status: 401 }
        );
      }

      // Add user info to request headers (support tokens with userId or id)
      const requestHeaders = new Headers(request.headers);
      const userId = (decoded as any).id || (decoded as any).userId;
      const role = (decoded as any).role || '';
      const email = (decoded as any).email || '';
      const tenantKey = (decoded as any).tenantKey || tenantKeyFromReferer;

      if (userId) {
        requestHeaders.set('x-user-id', String(userId));
      }
      if (role) {
        requestHeaders.set('x-user-role', String(role));
      }
      if (email) {
        requestHeaders.set('x-user-email', String(email));
      }
      if (tenantKey) {
        requestHeaders.set('X-Tenant-Key', String(tenantKey));
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'خطا در تأیید هویت' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};