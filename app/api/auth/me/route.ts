import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 /api/auth/me called');
    console.log('Authorization header present:', !!req.headers.get('authorization'));
    console.log('Cookies:', req.cookies.getAll().map(c => `${c.name}=${c.value?.substring(0, 20)}...`).join(', '));

    const user = getAuthUser(req);

    if (!user) {
      console.log('❌ User not found in auth/me');
      console.log('Authorization header:', req.headers.get('authorization')?.substring(0, 50) + '...');
      console.log('Available cookies:', req.cookies.getAll().map(c => c.name).join(', '));

      return NextResponse.json({
        success: false,
        message: 'غیر مجاز - لطفاً وارد شوید'
      }, { status: 401 });
    }

    console.log('✅ User found in auth/me:', user.id, user.email);

    return NextResponse.json({
      success: true,
      data: user,
      user: user // For compatibility
    });

  } catch (error) {
    console.error('❌ Auth me API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}