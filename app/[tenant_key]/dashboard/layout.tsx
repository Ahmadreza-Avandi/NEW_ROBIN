'use client';

import '../../dashboard/dashboard.css';
import { TenantProvider } from '@/lib/tenant-context';
import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import { Header } from '@/components/layout/header';
import { useState } from 'react';

export default function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant_key: string };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TenantProvider>
      <div className="dashboard-layout" style={{ backgroundColor: '#FAF9F6', color: '#000000', minHeight: '100vh' }}>
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
        />

        {/* Sidebar - استفاده از DashboardSidebar */}
        <TenantSidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="mr-0 lg:mr-72 mt-16 transition-all duration-300 min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
          <div className="p-4 lg:p-6 max-w-full" style={{ backgroundColor: '#FAF9F6', color: '#000000' }}>
            {children}
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}
