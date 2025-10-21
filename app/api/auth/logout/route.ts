import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

        // Log the logout activity only if we have a valid user ID
        if (decoded && decoded.id) {
          await executeQuery(`
            INSERT INTO user_activities (
              user_id, activity_type, description, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())
          `, [
            decoded.id,
            'logout',
            'کاربر از سیستم خارج شد',
            req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            req.headers.get('user-agent') || 'unknown'
          ]);
        }

      } catch (jwtError) {
        // Token is invalid, but we still want to allow logout
        console.log('Invalid token during logout, proceeding anyway');
      }
    }

    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: 'با موفقیت از سیستم خارج شدید'
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, we should still clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'خروج از سیستم انجام شد'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}