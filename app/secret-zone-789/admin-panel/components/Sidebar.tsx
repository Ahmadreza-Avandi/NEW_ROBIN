'use client';

import { useState } from 'react';

// Icon fallbacks for when react-icons is not available
const IconFallback = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 9.5L12 3l9 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Try to load react-icons, but provide fallbacks if not installed
let FiHome: any = IconFallback;
let FiUsers: any = IconFallback;
let FiCreditCard: any = IconFallback;
let FiFileText: any = IconFallback;
let FiSettings: any = IconFallback;
let FiLogOut: any = IconFallback;
let FiLayers: any = IconFallback;
let FiMenu: any = IconFallback;
let FiX: any = IconFallback;

try {
  const icons = require('react-icons/fi');
  FiHome = icons.FiHome;
  FiUsers = icons.FiUsers;
  FiCreditCard = icons.FiCreditCard;
  FiFileText = icons.FiFileText;
  FiSettings = icons.FiSettings;
  FiLogOut = icons.FiLogOut;
  FiLayers = icons.FiLayers;
  FiMenu = icons.FiMenu;
  FiX = icons.FiX;
} catch (e) {
  // react-icons not installed — icon fallbacks will be used
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationItems = [
    { id: 'dashboard', label: 'داشبورد', icon: FiHome },
    { id: 'customers', label: 'مشتریان', icon: FiUsers },
    { id: 'subscriptions', label: 'اشتراک‌ها', icon: FiCreditCard },
    { id: 'billing', label: 'صورتحساب‌ها', icon: FiFileText },
  ];

  const handleNavItemClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-900 text-white rounded-md shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="باز کردن منو"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        admin-sidebar flex flex-col bg-blue-900 text-white w-64
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
          aria-label="بستن منو"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center px-6 py-6 border-b border-blue-700">
          <FiLayers className="text-2xl ml-3 text-blue-200" />
          <span className="font-semibold text-lg text-white">CRM Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavItemClick(item.id)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-700 text-white shadow-md' 
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900
                      touch-manipulation
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="ml-3 text-lg flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Settings Section */}
          <div className="mt-8 pt-6 border-t border-blue-700">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavItemClick('settings')}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === 'settings' 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900
                    touch-manipulation
                  `}
                  aria-current={activeTab === 'settings' ? 'page' : undefined}
                >
                  <FiSettings className="ml-3 text-lg flex-shrink-0" />
                  <span className="truncate">تنظیمات</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-blue-700">
          <button
            onClick={onLogout}
            className="
              w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium
              bg-red-600 text-white hover:bg-red-700
              transition-all duration-200 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-900
              touch-manipulation
            "
          >
            <FiLogOut className="ml-3 text-lg flex-shrink-0" />
            <span className="truncate">خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}