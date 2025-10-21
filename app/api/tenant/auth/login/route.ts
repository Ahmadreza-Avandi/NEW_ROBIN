import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenantUser, createTenantSession } from '@/lib/tenant-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant_key } = body;

    console.log('🔐 درخواست لاگین tenant:', { email, tenant_key, password: '***' });

    if (!email || !password || !tenant_key) {
      console.log('❌ فیلدهای الزامی خالی است');
      return NextResponse.json(
        { success: false, message: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    // احراز هویت کاربر
    console.log('🔍 در حال احراز هویت...');
    const result = await authenticateTenantUser(tenant_key, email, password);
    console.log('📋 نتیجه احراز هویت:', { success: result.success, message: result.message });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message || 'خطا در ورود' },
        { status: 401 }
      );
    }

    // ایجاد session
    const token = createTenantSession(result.user, tenant_key);

    // ایجاد response با cookie
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      token: token,  // Return token in response body for frontend to store
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      }
    });

    // تنظیم cookies
    // Set auth-token for frontend pages (httpOnly: false so JS can access)
    response.cookies.set('auth-token', token, {
      httpOnly: false,
      secure: false, // در development باید false باشد
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // Also set tenant_token for backward compatibility
    response.cookies.set('tenant_token', token, {
      httpOnly: false,
      secure: false, // در development باید false باشد
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    console.log('🍪 Cookies set: auth-token and tenant_token');

    console.log('✅ لاگین موفق - Token و Cookie تنظیم شد');

    return response;

  } catch (error) {
    console.error('❌ خطا در لاگین tenant:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
