import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // ایجاد response
    const response = NextResponse.json({
      success: true,
      message: 'خروج موفقیت‌آمیز'
    });

    // حذف cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // حذف فوری
    });

    return response;

  } catch (error) {
    console.error('❌ خطا در خروج:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}