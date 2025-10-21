'use client';

import './dashboard.css';
import { DashboardSimpleLayout } from '@/components/layout/dashboard-simple-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#FAF9F6', color: '#000000', minHeight: '100vh' }}>
      <DashboardSimpleLayout>
        {children}
      </DashboardSimpleLayout>
    </div>
  );
}