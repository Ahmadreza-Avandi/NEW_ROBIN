'use client';

import React, { useState } from 'react';
import { ResponsiveSidebar } from './sidebar';
import { Header } from './header';

interface DashboardSimpleLayoutProps {
    children: React.ReactNode;
}

export const DashboardSimpleLayout: React.FC<DashboardSimpleLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ backgroundColor: '#FAF9F6', color: '#000000', minHeight: '100vh' }}>
            {/* Header */}
            <Header
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                showMenuButton={true}
            />

            {/* Sidebar */}
            <ResponsiveSidebar
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />

            {/* Main Content - با margin از سمت راست برای جای sidebar و از بالا برای header */}
            <main className="mr-0 lg:mr-72 mt-16 transition-all duration-300 min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
                <div className="p-4 lg:p-6 max-w-full" style={{ backgroundColor: '#FAF9F6', color: '#000000' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};