import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { getUserSidebarMenu } from '@/lib/permissions';

// GET /api/sidebar-menu - Get user's sidebar menu based on permissions
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
    }

    const menuItems = await getUserSidebarMenu(user.id);

    return NextResponse.json({
      success: true,
      data: menuItems
    });

  } catch (error) {
    console.error('Get sidebar menu API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت منو' },
      { status: 500 }
    );
  }
}