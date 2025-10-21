'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface TenantContextType {
  tenantKey: string | null;
  tenantInfo: any | null;
  setTenantInfo: (info: any) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantKey: null,
  tenantInfo: null,
  setTenantInfo: () => {},
  isLoading: true,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tenantKey, setTenantKey] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // استخراج tenant_key از URL
    const pathParts = pathname?.split('/') || [];
    const extractedTenantKey = pathParts[1]; // اولین بخش بعد از /

    if (extractedTenantKey && extractedTenantKey !== 'dashboard' && extractedTenantKey !== 'login') {
      setTenantKey(extractedTenantKey);
      
      // دریافت اطلاعات tenant
      fetch(`/api/tenant/info`, {
        headers: {
          'X-Tenant-Key': extractedTenantKey,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTenantInfo(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching tenant info:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [pathname]);

  return (
    <TenantContext.Provider value={{ tenantKey, tenantInfo, setTenantInfo, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
