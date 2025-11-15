// 🔐 Hook احراز هویت و دسترسی

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUserFromToken, canAccess, UserRole, isAdmin, isTeacher, isStudent } from '@/lib/auth';
import type { DecodedToken, UserPermissions } from '@/lib/auth';

interface UseAuthReturn {
  user: DecodedToken | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  canAccess: (permission: keyof UserPermissions) => boolean;
  logout: () => void;
}

export function useAuth(options?: {
  redirectTo?: string;
  redirectIfFound?: boolean;
  requiredRole?: UserRole | UserRole[];
}): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserFromToken();
      setUser(userData);
      setLoading(false);

      // اگر کاربر لاگین نکرده و نیاز به لاگین است
      if (!userData && options?.redirectTo && !options?.redirectIfFound) {
        router.push(options.redirectTo);
        return;
      }

      // اگر کاربر لاگین کرده و نباید لاگین باشد (مثل صفحه login)
      if (userData && options?.redirectTo && options?.redirectIfFound) {
        router.push(options.redirectTo);
        return;
      }

      // بررسی نقش مورد نیاز
      if (userData && options?.requiredRole) {
        const requiredRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];

        if (!requiredRoles.includes(userData.roleId as UserRole)) {
          router.push('/403'); // صفحه دسترسی غیرمجاز
        }
      }
    };

    checkAuth();
  }, [router, options]);

  const logout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user ? isAdmin(user.roleId) : false,
    isTeacher: user ? isTeacher(user.roleId) : false,
    isStudent: user ? isStudent(user.roleId) : false,
    canAccess: (permission: keyof UserPermissions) => 
      user ? canAccess(permission) : false,
    logout,
  };
}

// Hook ساده‌تر برای صفحاتی که نیاز به لاگین دارند
export function useRequireAuth(requiredRole?: UserRole | UserRole[]) {
  return useAuth({
    redirectTo: '/login',
    requiredRole,
  });
}

// Hook برای صفحات مدیریتی (فقط مدیر)
export function useRequireAdmin() {
  return useAuth({
    redirectTo: '/403',
    requiredRole: UserRole.ADMIN,
  });
}

// Hook برای صفحات معلم (مدیر یا معلم)
export function useRequireTeacher() {
  return useAuth({
    redirectTo: '/403',
    requiredRole: [UserRole.ADMIN, UserRole.TEACHER],
  });
}
