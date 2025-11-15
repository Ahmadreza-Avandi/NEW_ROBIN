// 🛡️ کامپوننت محافظت از صفحات

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth({
    redirectTo: '/login',
    requiredRole,
  });

  if (loading) {
    return fallback || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          در حال بارگذاری...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect می‌شود
  }

  return <>{children}</>;
}

// کامپوننت برای صفحات مدیریتی
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      {children}
    </ProtectedRoute>
  );
}

// کامپوننت برای صفحات معلم
export function TeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.TEACHER]}>
      {children}
    </ProtectedRoute>
  );
}

// کامپوننت برای نمایش مشروط بر اساس دسترسی
interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function ConditionalRender({ 
  children, 
  requiredRole,
  fallback = null 
}: ConditionalRenderProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!requiredRoles.includes(user.roleId as UserRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
