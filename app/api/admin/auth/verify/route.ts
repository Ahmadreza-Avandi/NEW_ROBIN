import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin auth verification request received');
    
    const admin = await verifyAdminToken(request);

    if (!admin) {
      console.log('❌ Admin verification failed - no valid token');
      return NextResponse.json(
        { success: false, message: 'غیر مجاز - لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    console.log('✅ Admin verification successful:', { id: admin.id, email: admin.email });
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ خطا در تأیید احراز هویت admin:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}