import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getTenantConnection } from './tenant-database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * احراز هویت کاربر تنانت
 */
export async function authenticateTenantUser(
  tenantKey: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const pool = await getTenantConnection(tenantKey);
    const connection = await pool.getConnection();

    try {
      // جستجوی کاربر
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND tenant_key = ? AND status = "active" LIMIT 1',
        [email, tenantKey]
      ) as any[];

      if (!users || users.length === 0) {
        return { success: false, message: 'کاربر یافت نشد' };
      }

      const user = users[0];

      // بررسی رمز عبور
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'رمز عبور اشتباه است' };
      }

      // حذف رمز عبور از اطلاعات کاربر
      delete user.password;

      return { success: true, user };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error authenticating tenant user:', error);
    return { success: false, message: 'خطا در احراز هویت' };
  }
}

/**
 * ایجاد session برای کاربر تنانت
 */
export function createTenantSession(user: any, tenantKey: string): string {
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantKey: tenantKey,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
}

/**
 * دریافت session از request
 */
export function getTenantSessionFromRequest(
  request: NextRequest,
  tenantKey: string
): any | null {
  try {
    // دریافت token از header یا cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('tenant_token')?.value;

    if (!token) {
      return null;
    }

    // تایید token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // بررسی tenant key
    if (decoded.tenantKey !== tenantKey) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error verifying tenant session:', error);
    return null;
  }
}

/**
 * Middleware برای احراز هویت تنانت
 */
export function requireTenantAuth(
  handler: (request: NextRequest, session: any) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return Response.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return Response.json(
        { success: false, message: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    return handler(request, session);
  };
}
