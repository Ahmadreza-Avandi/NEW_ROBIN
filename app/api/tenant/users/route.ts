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
      // Check if email already exists in this tenant
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

      // Insert new user with tenant_key
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

export async function PUT(request: NextRequest) {
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

    // Check if user has permission to update coworkers
    const userRole = (session as any).user?.role || session.role || '';
    if (!['ceo', 'admin', 'مدیر'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'شما مجوز ویرایش همکار ندارید' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, role, status, password, team } = body;

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Check if user exists in this tenant
      const [users] = await conn.query(
        'SELECT id FROM users WHERE id = ? AND tenant_key = ?',
        [userId, tenantKey]
      ) as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (role) {
        updates.push('role = ?');
        values.push(role);
      }
      if (status) {
        updates.push('status = ?');
        values.push(status);
      }
      if (team !== undefined) {
        updates.push('department = ?');
        values.push(team);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        values.push(hashedPassword);
      }

      updates.push('updated_at = NOW()');
      values.push(userId, tenantKey);

      await conn.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND tenant_key = ?`,
        values
      );

      return NextResponse.json({
        success: true,
        message: 'اطلاعات همکار با موفقیت به‌روزرسانی شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی همکار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Check if user has permission to delete coworkers
    const userRole = (session as any).user?.role || session.role || '';
    if (!['ceo', 'admin', 'مدیر'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'شما مجوز حذف همکار ندارید' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Check if user exists in this tenant
      const [users] = await conn.query(
        'SELECT id FROM users WHERE id = ? AND tenant_key = ?',
        [userId, tenantKey]
      ) as any[];

      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      if (hard) {
        // Hard delete - permanently remove user
        await conn.query(
          'DELETE FROM users WHERE id = ? AND tenant_key = ?',
          [userId, tenantKey]
        );
      } else {
        // Soft delete - mark as inactive
        await conn.query(
          'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? AND tenant_key = ?',
          ['inactive', userId, tenantKey]
        );
      }

      return NextResponse.json({
        success: true,
        message: hard ? 'همکار با موفقیت حذف شد' : 'همکار غیرفعال شد'
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ خطا در حذف همکار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
