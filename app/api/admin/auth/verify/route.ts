import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن یافت نشد' },
        { status: 401 }
      );
    }

    // اعتبارسنجی token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      success: true,
      admin: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'توکن نامعتبر است' },
      { status: 401 }
    );
  }
}
