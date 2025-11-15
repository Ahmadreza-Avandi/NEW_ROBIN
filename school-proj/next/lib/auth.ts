// 🔐 سیستم احراز هویت و دسترسی

import { NextApiRequest, NextApiResponse } from 'next';

export interface DecodedToken {
  id: number;
  nationalCode: string;
  roleId: number;
  roleName: string;
  iat?: number;
  exp?: number;
}

export interface UserPermissions {
  viewPlaces: boolean;
  editPlaces: boolean;
  deletePlaces: boolean;
  viewPersons: boolean;
  editPersons: boolean;
  deletePersons: boolean;
  viewRoles: boolean;
  editRoles: boolean;
  deleteRoles: boolean;
}

// نقش‌ها
export enum UserRole {
  ADMIN = 1,      // مدیر
  TEACHER = 2,    // معلم
  STUDENT = 3,    // دانش‌آموز
}

// دسترسی‌های هر نقش
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.ADMIN]: {
    viewPlaces: true,
    editPlaces: true,
    deletePlaces: true,
    viewPersons: true,
    editPersons: true,
    deletePersons: true,
    viewRoles: true,
    editRoles: true,
    deleteRoles: true,
  },
  [UserRole.TEACHER]: {
    viewPlaces: true,
    editPlaces: false,
    deletePlaces: false,
    viewPersons: true,
    editPersons: false,
    deletePersons: false,
    viewRoles: false,
    editRoles: false,
    deleteRoles: false,
  },
  [UserRole.STUDENT]: {
    viewPlaces: false,
    editPlaces: false,
    deletePlaces: false,
    viewPersons: false,
    editPersons: false,
    deletePersons: false,
    viewRoles: false,
    editRoles: false,
    deleteRoles: false,
  },
};

/**
 * استخراج توکن از request
 */
export function getTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

/**
 * دیکد کردن توکن JWT
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * بررسی دسترسی کاربر
 */
export function checkPermission(
  roleId: number,
  permission: keyof UserPermissions
): boolean {
  const permissions = ROLE_PERMISSIONS[roleId as UserRole];
  if (!permissions) return false;
  return permissions[permission];
}

/**
 * بررسی اینکه آیا کاربر مدیر است
 */
export function isAdmin(roleId: number): boolean {
  return roleId === UserRole.ADMIN;
}

/**
 * بررسی اینکه آیا کاربر معلم است
 */
export function isTeacher(roleId: number): boolean {
  return roleId === UserRole.TEACHER;
}

/**
 * بررسی اینکه آیا کاربر دانش‌آموز است
 */
export function isStudent(roleId: number): boolean {
  return roleId === UserRole.STUDENT;
}

/**
 * Middleware برای محافظت از API routes
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: DecodedToken) => Promise<void>,
  options?: {
    requiredRole?: UserRole | UserRole[];
    requiredPermission?: keyof UserPermissions;
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // دریافت توکن
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ message: 'توکن یافت نشد' });
      }

      // دیکد کردن توکن
      const user = decodeToken(token);
      if (!user) {
        return res.status(401).json({ message: 'توکن نامعتبر است' });
      }

      // بررسی نقش
      if (options?.requiredRole) {
        const requiredRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];
        
        if (!requiredRoles.includes(user.roleId as UserRole)) {
          return res.status(403).json({ message: 'دسترسی غیرمجاز' });
        }
      }

      // بررسی دسترسی خاص
      if (options?.requiredPermission) {
        if (!checkPermission(user.roleId, options.requiredPermission)) {
          return res.status(403).json({ message: 'شما دسترسی لازم را ندارید' });
        }
      }

      // اجرای handler
      return handler(req, res, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'خطای سرور' });
    }
  };
}

/**
 * Hook برای استفاده در سمت کلاینت
 */
export function getUserFromToken(): DecodedToken | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  return decodeToken(token);
}

/**
 * بررسی دسترسی در سمت کلاینت
 */
export function canAccess(permission: keyof UserPermissions): boolean {
  const user = getUserFromToken();
  if (!user) return false;
  
  return checkPermission(user.roleId, permission);
}
