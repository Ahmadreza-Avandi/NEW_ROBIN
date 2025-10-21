'use client';

import { useState, useEffect } from 'react';

interface Plan {
  id: number;
  plan_key: string;
  plan_name: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_customers: number;
  max_storage_mb: number;
  features: any;
  is_active: boolean;
}

interface PlansTableProps {
  onRefresh: () => void;
}

export default function PlansTable({ onRefresh }: PlansTableProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('خطا در دریافت پلن‌ها:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (planId: number) => {
    if (!confirm('آیا از غیرفعال کردن این پلن اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/plans/${planId}/deactivate`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('پلن با موفقیت غیرفعال شد');
        fetchPlans();
        onRefresh();
      } else {
        alert(data.message || 'خطا در غیرفعال کردن پلن');
      }
    } catch (error) {
      alert('خطا در اتصال به سرور');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">در حال بارگذاری...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">هیچ پلنی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">نام پلن</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">کلید</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">قیمت ماهانه</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">قیمت سالانه</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">کاربران</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">مشتریان</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">وضعیت</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {plan.plan_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">{plan.plan_key}</code>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {plan.price_monthly.toLocaleString()} تومان
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {plan.price_yearly.toLocaleString()} تومان
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {plan.max_users}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {plan.max_customers}
                </td>
                <td className="px-6 py-4 text-sm">
                  {plan.is_active ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      فعال
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      غیرفعال
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {plan.is_active && (
                    <button
                      onClick={() => handleDeactivate(plan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      غیرفعال کردن
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
