'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Tenant {
  id: number;
  tenant_key: string;
  company_name: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_start: string;
  subscription_end: string;
  is_active: boolean;
  created_at: string;
}

export default function TenantDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchTenantDetails();
  }, [params.id]);

  const fetchTenantDetails = async () => {
    try {
      const response = await fetch(`/api/admin/tenants/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTenant(data.data.tenant);
        setSubscriptionHistory(data.data.subscriptionHistory);
        setActivityLogs(data.data.activityLogs);
      } else {
        alert('خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('خطا:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800'
    };
    const labels: Record<string, string> = {
      active: 'فعال',
      expired: 'منقضی شده',
      suspended: 'معلق'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
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

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Tenant یافت نشد</p>
          <button
            onClick={() => router.push('/secret-zone-789/admin-panel')}
            className="mt-4 text-blue-600 hover:underline"
          >
            بازگشت به پنل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/secret-zone-789/admin-panel')}
              className="text-blue-600 hover:underline mb-2"
            >
              ← بازگشت به پنل
            </button>
            <h1 className="text-3xl font-bold text-gray-800">{tenant.company_name}</h1>
            <p className="text-gray-600">Tenant Key: {tenant.tenant_key}</p>
          </div>
          <div>
            {getStatusBadge(tenant.subscription_status)}
          </div>
        </div>

        {/* اطلاعات اصلی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">اطلاعات تماس</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">نام مدیر:</span>
                <span className="mr-2 font-medium">{tenant.admin_name}</span>
              </div>
              <div>
                <span className="text-gray-600">ایمیل:</span>
                <span className="mr-2 font-medium">{tenant.admin_email}</span>
              </div>
              <div>
                <span className="text-gray-600">تلفن:</span>
                <span className="mr-2 font-medium">{tenant.admin_phone || '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">اطلاعات اشتراک</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">پلن:</span>
                <span className="mr-2 font-medium">{tenant.subscription_plan}</span>
              </div>
              <div>
                <span className="text-gray-600">تاریخ شروع:</span>
                <span className="mr-2 font-medium">{new Date(tenant.subscription_start).toLocaleDateString('fa-IR')}</span>
              </div>
              <div>
                <span className="text-gray-600">تاریخ انقضا:</span>
                <span className="mr-2 font-medium">{new Date(tenant.subscription_end).toLocaleDateString('fa-IR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه‌های عملیاتی */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">عملیات</h2>
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              تمدید اشتراک
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
              تعلیق حساب
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
              فعال‌سازی
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              حذف
            </button>
          </div>
        </div>

        {/* تاریخچه اشتراک */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">تاریخچه اشتراک</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">پلن</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تاریخ شروع</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">تاریخ پایان</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptionHistory.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm">{sub.plan_key}</td>
                    <td className="px-4 py-3 text-sm">{new Date(sub.start_date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm">{new Date(sub.end_date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 text-sm">{sub.amount.toLocaleString()} تومان</td>
                    <td className="px-4 py-3 text-sm">{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* لاگ فعالیت‌ها */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">لاگ فعالیت‌ها</h2>
          <div className="space-y-3">
            {activityLogs.map((log: any) => (
              <div key={log.id} className="border-r-4 border-blue-500 pr-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{log.description}</p>
                    <p className="text-sm text-gray-600">{log.activity_type}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
