// 🔧 تنظیمات مرکزی API و دیتابیس
// این فایل تمام URL ها و تنظیمات را مدیریت می‌کند

// تشخیص محیط
const isServer = typeof window === 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// آدرس‌های API برای سمت کلاینت (Browser)
export const CLIENT_PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

// آدرس‌های API برای سمت سرور (Server-side و API routes)
export const SERVER_PYTHON_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

// تنظیمات دیتابیس
export const DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:userpassword@localhost:3307/mydatabase';

// تنظیمات Redis
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || '6379';

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

/**
 * دریافت URL مناسب برای Python API
 * در سمت کلاینت از NEXT_PUBLIC_PYTHON_API_URL استفاده می‌شود
 * در سمت سرور از PYTHON_API_URL استفاده می‌شود
 */
export function getPythonUrl(): string {
  if (isServer) {
    return SERVER_PYTHON_URL;
  }
  return CLIENT_PYTHON_API_URL;
}

/**
 * ساخت URL کامل برای Python API
 */
export function buildPythonUrl(path: string): string {
  const baseUrl = getPythonUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Export تنظیمات به صورت یک object
export const config = {
  api: {
    python: getPythonUrl(),
  },
  database: {
    url: DATABASE_URL,
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  jwt: {
    secret: JWT_SECRET,
  },
  isDevelopment,
  isServer,
};

export default config;
