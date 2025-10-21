import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// GET /api/users - دریافت لیست کاربران
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    console.log('Fetching users list...');

    // دریافت لیست کاربران با تمام فیلدهای مورد نیاز
    const users = await executeQuery(`
      SELECT 
        id,
        username,
        COALESCE(name, username) as name,
        email,
        phone,
        role,
        team as department,
        status,
        created_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `);

    console.log(`Found ${users?.length || 0} users`);

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت کاربران' },
      { status: 500 }
    );
  }
}

// POST /api/users - افزودن کاربر جدید (همکار)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // تنها CEO و مدیران می‌تواند کاربر جدید افزودند
    if (!['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی رد شد - فقط مدیران می‌تواند کاربر افزودند' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, role, department, password } = body;

    // تایید فیلدهای الزامی
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'نام، ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن ایمیل
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, email.split('@')[0]]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'این ایمیل قبلا ثبت شده است' },
        { status: 400 }
      );
    }

    // رمزگذاری رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر جدید
    const userId = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await executeSingle(`
      INSERT INTO users (
        id, username, name, email, phone, password, role, team,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      email.split('@')[0], // username
      name,
      email,
      phone || null,
      hashedPassword,
      role || 'sales_agent',
      department || null,
      'active',
      now,
      now
    ]);

    return NextResponse.json({
      success: true,
      message: `کاربر ${name} با موفقیت افزودن شد`,
      user: {
        id: userId,
        name,
        email,
        role
      }
    });

  } catch (error) {
    console.error('خطا در افزودن کاربر:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در افزودن کاربر' },
      { status: 500 }
    );
  }
}