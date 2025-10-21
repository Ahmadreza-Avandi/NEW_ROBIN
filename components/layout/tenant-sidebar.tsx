'use client';

import { useTenant } from '@/lib/tenant-context';
import { ResponsiveSidebar } from './dashboard-sidebar';
import { useEffect } from 'react';

interface TenantSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function TenantSidebar({ mobileOpen, onMobileClose }: TenantSidebarProps) {
  const { tenantKey } = useTenant();

  useEffect(() => {
    // Store tenant key in window for sidebar to use
    if (tenantKey && typeof window !== 'undefined') {
      (window as any).__TENANT_KEY__ = tenantKey;
    }
  }, [tenantKey]);

  return <ResponsiveSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />;
}
