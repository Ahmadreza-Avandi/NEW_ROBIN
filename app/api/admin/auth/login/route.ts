import { NextRequest, NextResponse } from 'next/server';
import { getMasterConnection } from '@/lib/master-database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRATION = '1h';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { username, email, password } = body;
    const loginIdentifier = username || email;

    // اعتبارسنجی ورودی
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, message: 'نام کاربری/ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // اتصال به master database
    connection = await getMasterConnection();

    // جستجوی super admin (با username یا email)
    const [admins] = await connection.query(
      'SELECT * FROM super_admins WHERE (username = ? OR email = ?) AND is_active = true',
      [loginIdentifier, loginIdentifier]
    ) as any[];

    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const admin = admins[0];

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // ایجاد JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.full_name || admin.username,
        role: 'super_admin'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // به‌روزرسانی last_login
    await connection.query(
      'UPDATE super_admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    // ایجاد response با cookie
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      admin: {
        id: admin.id,
        name: admin.full_name || admin.username,
        email: admin.email
      }
    });

    // تنظیم cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    });

    return response;

  } catch (error) {
    console.error('❌ خطا در لاگین super admin:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
