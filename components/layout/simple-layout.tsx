'use client';

import React, { useState } from 'react';
import { ResponsiveSidebar } from './sidebar';
import { Header } from './header';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
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
            <main className="mr-0 lg:mr-72 mt-16 transition-all duration-300 min-h-screen">
                <div className="p-4 lg:p-6 max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};