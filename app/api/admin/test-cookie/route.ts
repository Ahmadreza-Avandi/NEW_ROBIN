import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test Cookie Endpoint');
    console.log('🔍 Request URL:', request.url);
    
    // بررسی تمام کوکی‌ها
    const allCookies = request.cookies.getAll();
    console.log('🔍 All cookies:', allCookies);
    
    const adminToken = request.cookies.get('admin_token')?.value;
    console.log('🔍 Admin token:', adminToken ? `${adminToken.substring(0, 50)}...` : 'NOT FOUND');

    return NextResponse.json({
      success: true,
      data: {
        hasCookie: !!adminToken,
        cookiePreview: adminToken ? `${adminToken.substring(0, 50)}...` : null,
        allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      }
    });

  } catch (error) {
    console.error('❌ خطا در تست کوکی:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}