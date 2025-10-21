import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [users] = await conn.query(
        `SELECT id, name, email, role, phone, status, created_at 
         FROM users 
         WHERE tenant_key = ? 
         ORDER BY created_at DESC`,
        [tenantKey]
      ) as any[];

      return NextResponse.json({
        success: true,
        data: users
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت کاربران:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    // Check if user has permission to add coworkers
    const userRole = (session as any).user?.role || session.role || '';
    if (!['ceo', 'admin', 'مدیر'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'شما مجوز افزودن همکار ندارید' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'نام، ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Check if email already exists
      const [existingUsers] = await conn.query(
        'SELECT id FROM users WHERE email = ? AND tenant_key = ?',
        [email, tenantKey]
      ) as any[];

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { success: false, message: 'این ایمیل قبلاً ثبت شده است' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await conn.query(
        `INSERT INTO users (
          id, tenant_key, name, email, password, role, phone, 
          status, created_at, updated_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [tenantKey, name, email, hashedPassword, role || 'sales_agent', phone || null]
      ) as any;

      return NextResponse.json({
        success: true,
        message: 'همکار با موفقیت اضافه شد',
        data: {
          id: result.insertId,
          name,
          email,
          role: role || 'sales_agent'
        }
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در افزودن همکار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
