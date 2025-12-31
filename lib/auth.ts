import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const dbConfig = {
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.DB_USER || process.env.DATABASE_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'crm_system',
  charset: 'utf8mb4'
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

// دریافت کاربر فعلی از توکن
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    if (!request || !request.headers) {
      return null;
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies?.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const connection = await mysql.createConnection(dbConfig);

    const userId = decoded.id || decoded.userId;
    const [users] = await connection.execute(
      'SELECT id, name, email, role, avatar_url FROM users WHERE id = ? AND status = "active"',
      [userId]
    );

    await connection.end();

    if ((users as any[]).length === 0) {
      return null;
    }

    return (users as any[])[0];
  } catch (error) {
    console.error('خطا در احراز هویت:', error);
    return null;
  }
}

// بررسی دسترسی کاربر
export function hasPermission(user: User | string, requiredRoles: string | string[]): boolean {
  const roleHierarchy = {
    'ceo': 5,
    'مدیر': 5,
    'sales_manager': 4,
    'مدیر فروش': 4,
    'manager': 4,
    'supervisor': 3,
    'sales_agent': 2,
    'کارشناس فروش': 2,
    'همکار': 2,
    'agent': 2,
    'employee': 2,
    'user': 1
  };

  // اگر user یک string است، آن را به عنوان role در نظر بگیریم
  const userRole = typeof user === 'string' ? user : user.role;
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;

  // اگر requiredRoles یک آرایه است، بررسی کنیم که آیا کاربر یکی از آن نقش‌ها را دارد
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.some(role => {
      const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
      return userLevel >= requiredLevel;
    });
  }

  // اگر requiredRoles یک string است
  const requiredLevel = roleHierarchy[requiredRoles as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}

// بررسی دسترسی ماژول برای کاربر
export async function hasModulePermission(userId: string, moduleName: string): Promise<boolean> {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // اول چک کردن نقش کاربر
    const [userRows] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if ((userRows as any[]).length === 0) {
      await connection.end();
      return false;
    }

    const userRole = (userRows as any[])[0].role;

    // مدیرعامل به همه چیز دسترسی دارد
    if (userRole === 'ceo') {
      await connection.end();
      return true;
    }

    // پیدا کردن ID ماژول
    const [moduleRows] = await connection.execute(
      'SELECT id FROM modules WHERE name = ?',
      [moduleName]
    );

    if ((moduleRows as any[]).length === 0) {
      await connection.end();
      console.warn(`Module '${moduleName}' not found`);
      return false;
    }

    const moduleId = (moduleRows as any[])[0].id;

    // بررسی دسترسی کاربر به ماژول
    const [permRows] = await connection.execute(
      'SELECT granted FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    );

    await connection.end();

    // اگر دسترسی در جدول نباشد، به این معنی است که دسترسی ندارد
    if ((permRows as any[]).length === 0) {
      return false;
    }

    // بررسی مقدار granted
    return (permRows as any[])[0].granted === 1;
  } catch (error) {
    console.error('Error checking module permission:', error);
    return false;
  }
}

// دریافت تمام ماژول‌های مجاز کاربر
export async function getUserModules(userId: string): Promise<string[]> {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT m.name
      FROM modules m
      JOIN user_module_permissions um ON m.id = um.module_id
      WHERE um.user_id = ? AND um.granted = 1
    `, [userId]);

    await connection.end();

    return (rows as any[]).map(row => row.name);
  } catch (error) {
    console.error('Error fetching user modules:', error);
    return [];
  }
}

// ایجاد توکن JWT
export function createToken(userId: string): string {
  return jwt.sign(
    {
      id: userId,
      userId: userId, // برای سازگاری با کدهای قدیمی
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// تایید توکن
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// دریافت کاربر از توکن (alias برای getCurrentUser)
export async function getUserFromToken(request: NextRequest): Promise<User | null> {
  return getCurrentUser(request);
}

// دریافت کاربر از توکن مستقیم (برای API های صوتی)
export async function getUserFromTokenString(token: string): Promise<string | null> {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const connection = await mysql.createConnection(dbConfig);

    const userId = decoded.id || decoded.userId;
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND status = "active"',
      [userId]
    );

    await connection.end();

    if ((users as any[]).length === 0) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error('خطا در احراز هویت توکن:', error);
    return null;
  }
}

// هش کردن رمز عبور
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// ورود کاربر
export async function loginUser(email: string, password: string): Promise<{
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}> {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // جستجوی کاربر
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role, avatar_url, status FROM users WHERE email = ?',
      [email]
    );

    await connection.end();

    if ((users as any[]).length === 0) {
      return {
        success: false,
        message: 'کاربری با این ایمیل یافت نشد'
      };
    }

    const user = (users as any[])[0];

    // بررسی فعال بودن کاربر
    if (user.status !== 'active') {
      return {
        success: false,
        message: 'حساب کاربری غیرفعال است'
      };
    }

    // بررسی رمز عبور با bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'رمز عبور اشتباه است'
      };
    }

    // ارسال ایمیل خوش‌آمدگویی
    try {
      await fetch('http://localhost:3000/api/Gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: '🎉 خوش آمدید به شرکت رابین تجارت خاورمیانه',
          html: `
            <h2>سلام ${user.name} عزیز!</h2>
            <p>شما با موفقیت به سیستم مدیریت ارتباط با مشتری <strong>شرکت رابین تجارت خاورمیانه</strong> وارد شدید.</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📍 اطلاعات ورود:</strong></p>
              <p><strong>ایمیل:</strong> ${user.email}</p>
              <p><strong>تاریخ ورود:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
              <p><strong>ساعت ورود:</strong> ${new Date().toLocaleTimeString('fa-IR')}</p>
            </div>
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>💡 نکته امنیتی:</strong> اگر این ورود توسط شما انجام نشده، لطفاً فوراً با مدیر سیستم تماس بگیرید.</p>
            </div>
          `
        })
      });
    } catch (error) {
      console.error('خطا در ارسال ایمیل خوش‌آمدگویی:', error);
      // ادامه روند حتی در صورت خطای ایمیل
    }

    // ایجاد توکن
    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id, // برای سازگاری
        email: user.email,
        role: user.role,
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // حذف رمز عبور از اطلاعات کاربر
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'ورود موفقیت‌آمیز',
      token,
      user: userWithoutPassword
    };

  } catch (error) {
    console.error('خطا در ورود کاربر:', error);
    return {
      success: false,
      message: 'خطای سرور داخلی'
    };
  }
}