'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, DashboardStats } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardStatsComponent from './components/DashboardStats';
import CustomerTable from './components/CustomerTable';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import SubscriptionManagement from './components/SubscriptionManagement';
import BillingInterface from './components/BillingInterface';
import AddTenantModal from './components/AddTenantModal';
import PlanFormModal from './components/PlanFormModal';
import PlansTable from './components/PlansTable';

// Try to load react-icons, but provide simple fallbacks if not installed to avoid build/runtime errors
let FiHome: any = () => <svg className="w-5 h-5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9.5L12 3l9 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
let FiUsers: any = FiHome;
let FiCreditCard: any = FiHome;
let FiSettings: any = FiHome;
let FiLogOut: any = FiHome;
let FiLayers: any = FiHome;
let FiFileText: any = FiHome;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const icons = require('react-icons/fi');
    FiHome = icons.FiHome;
    FiUsers = icons.FiUsers;
    FiCreditCard = icons.FiCreditCard;
    FiSettings = icons.FiSettings;
    FiLogOut = icons.FiLogOut;
    FiLayers = icons.FiLayers;
    FiFileText = icons.FiFileText;
} catch (e) {
    // react-icons not installed — icon fallbacks will be used
}

// تبدیل tenant به customer برای نمایش
function tenantToCustomer(tenant: any): Customer {
    return {
        id: tenant.id.toString(),
        name: tenant.company_name,
        email: tenant.admin_email,
        phone: tenant.admin_phone || '',
        subscriptionStatus: tenant.subscription_status,
        subscriptionStart: tenant.subscription_start,
        subscriptionEnd: tenant.subscription_end,
        plan: tenant.subscription_plan,
        subscriptionHistory: []
    };
}

// Helper function to get page title based on active tab
const getPageTitle = (tab: string): string => {
    const titles: Record<string, string> = {
        dashboard: 'داشبورد',
        customers: 'مدیریت مشتریان',
        subscriptions: 'مدیریت اشتراک‌ها',
        billing: 'صورتحساب‌ها و درآمد',
        settings: 'تنظیمات سیستم'
    };
    return titles[tab] || 'پنل مدیریت CRM';
};

export default function AdminPanel() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showAddTenantModal, setShowAddTenantModal] = useState(false);
    const [showAddPlanModal, setShowAddPlanModal] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalCustomers: 0,
        activeCustomers: 0,
        expiredCustomers: 0,
        suspendedCustomers: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0
    });

    // بررسی احراز هویت
    useEffect(() => {
        checkAuth();
    }, []);

    // دریافت داده‌ها پس از احراز هویت
    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
            fetchTenants();
        }
    }, [isAuthenticated]);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/admin/auth/verify');
            const data = await response.json();

            if (data.success) {
                setIsAuthenticated(true);
                setAdminName(data.admin.name);
            } else {
                router.push('/secret-zone-789/login');
            }
        } catch (error) {
            router.push('/secret-zone-789/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();

            if (data.success) {
                setStats({
                    totalCustomers: data.data.totalTenants,
                    activeCustomers: data.data.activeTenants,
                    expiredCustomers: data.data.expiredTenants,
                    suspendedCustomers: data.data.suspendedTenants,
                    monthlyRevenue: data.data.monthlyRevenue,
                    yearlyRevenue: data.data.yearlyRevenue
                });
            }
        } catch (error) {
            console.error('خطا در دریافت آمار:', error);
        }
    };

    const fetchTenants = async () => {
        try {
            const response = await fetch('/api/admin/tenants?limit=100');
            const data = await response.json();

            if (data.success) {
                const tenantCustomers = data.data.tenants.map(tenantToCustomer);
                setCustomers(tenantCustomers);
            }
        } catch (error) {
            console.error('خطا در دریافت لیست tenants:', error);
        }
    };

    const fetchPlans = async () => {
        // این تابع برای refresh کردن لیست پلن‌ها استفاده می‌شه
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/auth/logout', { method: 'POST' });
            router.push('/secret-zone-789/login');
        } catch (error) {
            console.error('خطا در خروج:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 lg:flex">
            {/* WordPress-style Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 flex flex-col min-w-0 lg:ml-0">
                {/* Header */}
                <Header
                    title={getPageTitle(activeTab)}
                    userName={adminName}
                />

                {/* Content Area */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-4">

                    {/* Dashboard Content */}
                    {activeTab === 'dashboard' && (
                        <DashboardStatsComponent stats={stats} />
                    )}

                    {/* Customers Content */}
                    {activeTab === 'customers' && (
                        <>
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">مدیریت Tenants</h2>
                                <button
                                    onClick={() => setShowAddTenantModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    + افزودن Tenant جدید
                                </button>
                            </div>
                            <CustomerTable
                                customers={customers}
                                onCustomerSelect={setSelectedCustomer}
                            />
                        </>
                    )}

                    {/* Customer Details Modal */}
                    {selectedCustomer && (
                        <CustomerDetailsModal
                            customer={selectedCustomer}
                            onClose={() => setSelectedCustomer(null)}
                        />
                    )}

                    {/* Add Tenant Modal */}
                    {showAddTenantModal && (
                        <AddTenantModal
                            onClose={() => setShowAddTenantModal(false)}
                            onSuccess={() => {
                                fetchTenants();
                                fetchStats();
                            }}
                        />
                    )}

                    {/* Add Tenant Modal */}
                    {showAddTenantModal && (
                        <AddTenantModal
                            onClose={() => setShowAddTenantModal(false)}
                            onSuccess={() => {
                                fetchTenants();
                                fetchStats();
                            }}
                        />
                    )}

                    {/* Subscriptions Content */}
                    {activeTab === 'subscriptions' && (
                        <div>
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">مدیریت پلن‌های اشتراک</h2>
                                <button
                                    onClick={() => setShowAddPlanModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    + افزودن پلن جدید
                                </button>
                            </div>
                            <PlansTable onRefresh={fetchPlans} />
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <BillingInterface stats={stats} />
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">تنظیمات ادمین</h2>
                            <div className="max-w-md">
                                <label className="block text-sm font-medium text-gray-700">تغییر رمز (این نسخه فقط در سمت کلاینت)</label>
                                <input type="password" placeholder="رمز جدید" className="mt-2 border px-3 py-2 rounded-md w-full" />
                                <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">ذخیره</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
