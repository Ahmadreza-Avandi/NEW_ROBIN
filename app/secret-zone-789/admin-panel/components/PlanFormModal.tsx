'use client';

import { useState, useEffect } from 'react';

interface PlanFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  plan?: any;
}

export default function PlanFormModal({ onClose, onSuccess, plan }: PlanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    plan_key: plan?.plan_key || '',
    plan_name: plan?.plan_name || '',
    price_monthly: plan?.price_monthly || 0,
    price_yearly: plan?.price_yearly || 0,
    max_users: plan?.max_users || 10,
    max_customers: plan?.max_customers || 100,
    max_storage_mb: plan?.max_storage_mb || 1024,
    description: plan?.description || '',
    features: {
      voice_assistant: plan?.features?.voice_assistant || false,
      advanced_reports: plan?.features?.advanced_reports || false,
      api_access: plan?.features?.api_access || false,
      priority_support: plan?.features?.priority_support || false,
      custom_branding: plan?.features?.custom_branding || false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = plan ? `/api/admin/plans/${plan.id}` : '/api/admin/plans';
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'خطا در ذخیره پلن');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {plan ? 'ویرایش پلن' : 'افزودن پلن جدید'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کلید پلن *
              </label>
              <input
                type="text"
                value={formData.plan_key}
                onChange={(e) => setFormData({ ...formData, plan_key: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="basic"
                required
                disabled={loading || !!plan}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام پلن *
              </label>
              <input
                type="text"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="پایه"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قیمت ماهانه (تومان) *
              </label>
              <input
                type="number"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قیمت سالانه (تومان) *
              </label>
              <input
                type="number"
                value={formData.price_yearly}
                onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر کاربران *
              </label>
              <input
                type="number"
                value={formData.max_users}
                onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر مشتریان *
              </label>
              <input
                type="number"
                value={formData.max_customers}
                onChange={(e) => setFormData({ ...formData, max_customers: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر فضای ذخیره‌سازی (MB) *
              </label>
              <input
                type="number"
                value={formData.max_storage_mb}
                onChange={(e) => setFormData({ ...formData, max_storage_mb: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ویژگی‌ها
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.voice_assistant}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, voice_assistant: e.target.checked }
                  })}
                  className="ml-2"
                  disabled={loading}
                />
                <span>دستیار صوتی</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.advanced_reports}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, advanced_reports: e.target.checked }
                  })}
                  className="ml-2"
                  disabled={loading}
                />
                <span>گزارش‌های پیشرفته</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.api_access}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, api_access: e.target.checked }
                  })}
                  className="ml-2"
                  disabled={loading}
                />
                <span>دسترسی API</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.priority_support}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, priority_support: e.target.checked }
                  })}
                  className="ml-2"
                  disabled={loading}
                />
                <span>پشتیبانی اولویت‌دار</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features.custom_branding}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, custom_branding: e.target.checked }
                  })}
                  className="ml-2"
                  disabled={loading}
                />
                <span>برندسازی سفارشی</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره پلن'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
