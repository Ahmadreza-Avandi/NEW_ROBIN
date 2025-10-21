import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

// Import notification service
// const notificationService = require('../../../../lib/notification-service-v2.js');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ایمیل و رمز عبور را وارد کنید' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginUser(email, password);
    console.log('Login result:', result);

    if (result.success) {
      // Create response with token in cookie
      const response = NextResponse.json(result);

      // Set cookie for token (accessible by JavaScript)
      response.cookies.set('auth-token', result.token!, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      // Send welcome email notification (temporarily disabled)
      if (result.user) {
        console.log('✅ User logged in successfully:', result.user.email);
        // TODO: Re-enable notification service after fixing module resolution
        // notificationService.sendWelcomeEmail(result.user.email, result.user.name)
      }

      return response;
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور داخلی' },
      { status: 500 }
    );
  }
}