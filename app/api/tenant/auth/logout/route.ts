import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'خروج موفقیت‌آمیز'
  });

  // حذف cookies
  response.cookies.delete('auth-token');
  response.cookies.delete('tenant_token');

  return response;
}
