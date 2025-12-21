'use client';

import { useState, useEffect } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface AddTenantModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Plan {
  id: number;
  plan_key: string;
  plan_name: string;
  price_monthly: number;
  price_yearly: number;
}

export default function AddTenantModal({ onClose, onSuccess }: AddTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [formData, setFormData] = useState({
    tenant_key: '',
    company_name: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    admin_password: '',
    subscription_plan: 'basic',
    subscription_months: 1,
    custom_end_date: false
  });

  const [customEndDate, setCustomEndDate] = useState<DateObject | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('🔄 در حال دریافت پلن‌ها...');
      const response = await fetch('/api/admin/plans-simple');
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success && data.data.length > 0) {
        setPlans(data.data);
        console.log('✅ پلن‌ها دریافت شدند:', data.data.length);
        // اگر پلن انتخاب نشده، اولین پلن را انتخاب کن
        if (!formData.subscription_plan && data.data.length > 0) {
          setFormData(prev => ({ ...prev, subscription_plan: data.data[0].plan_key }));
        }
      } else {
        console.log('⚠️ پلن‌ها خالی، استفاده از پیش‌فرض');
        // اگر پلن‌ها خالی بود، پلن‌های پیش‌فرض اضافه کن
        const defaultPlans = [
          { id: 1, plan_key: 'basic', plan_name: 'پایه', price_monthly: 50000, price_yearly: 500000 },
          { id: 2, plan_key: 'professional', plan_name: 'حرفه‌ای', price_monthly: 100000, price_yearly: 1000000 },
          { id: 3, plan_key: 'enterprise', plan_name: 'سازمانی', price_monthly: 200000, price_yearly: 2000000 }
        ];
        setPlans(defaultPlans);
        setFormData(prev => ({ ...prev, subscription_plan: 'basic' }));
      }
    } catch (error) {
      console.error('❌ خطا در دریافت پلن‌ها:', error);
      // در صورت خطا، پلن‌های پیش‌فرض را نمایش بده
      const defaultPlans = [
        { id: 1, plan_key: 'basic', plan_name: 'پایه', price_monthly: 50000, price_yearly: 500000 },
        { id: 2, plan_key: 'professional', plan_name: 'حرفه‌ای', price_monthly: 100000, price_yearly: 1000000 },
        { id: 3, plan_key: 'enterprise', plan_name: 'سازمانی', price_monthly: 200000, price_yearly: 2000000 }
      ];
      setPlans(defaultPlans);
      setFormData(prev => ({ ...prev, subscription_plan: 'basic' }));
    }
  };

  const validateTenantKey = (key: string) => {
    return /^[a-z0-9-]+$/.test(key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // اعتبارسنجی tenant_key
    if (!validateTenantKey(formData.tenant_key)) {
      setError('tenant_key فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد');
      return;
    }

    // اعتبارسنجی تاریخ کاستوم
    if (formData.custom_end_date && !customEndDate) {
      setError('لطفاً تاریخ پایان اشتراک را انتخاب کنید');
      return;
    }

    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // اگر تاریخ کاستوم انتخاب شده، آن را اضافه کن
      if (formData.custom_end_date && customEndDate) {
        const gregorianDate = customEndDate.convert(require('react-date-object/calendars/gregorian')).format('YYYY-MM-DD');
        (submitData as any).subscription_end = gregorianDate;
      }

      const response = await fetch('/api/admin/create-tenant-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'خطا در ایجاد tenant');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">افزودن Tenant جدید</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                Tenant Key *
              </label>
              <input
                type="text"
                value={formData.tenant_key}
                onChange={(e) => setFormData({ ...formData, tenant_key: e.target.value.toLowerCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="rabin"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">فقط حروف کوچک، اعداد و خط تیره</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام شرکت *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="شرکت رابین تجارت"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام مدیر *
              </label>
              <input
                type="text"
                value={formData.admin_name}
                onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="احمدرضا اوندی"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل مدیر *
              </label>
              <input
                type="email"
                value={formData.admin_email}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس
              </label>
              <input
                type="tel"
                value={formData.admin_phone}
                onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="09123456789"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور مدیر *
              </label>
              <input
                type="password"
                value={formData.admin_password}
                onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="حداقل 8 کاراکتر"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">این رمز برای ورود مدیر به سیستم استفاده می‌شود</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پلن اشتراک *
              </label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">انتخاب پلن...</option>
                {plans.map(plan => (
                  <option key={plan.plan_key} value={plan.plan_key}>
                    {plan.plan_name} - {plan.price_monthly?.toLocaleString()} تومان/ماه
                  </option>
                ))}
              </select>
              {plans.length === 0 && (
                <p className="text-xs text-red-500 mt-1">در حال بارگذاری پلن‌ها...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدت اشتراک *
              </label>
              <select
                value={formData.subscription_months}
                onChange={(e) => setFormData({ ...formData, subscription_months: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || formData.custom_end_date}
              >
                <option value={1}>1 ماه</option>
                <option value={3}>3 ماه</option>
                <option value={6}>6 ماه</option>
                <option value={12}>12 ماه (سالانه)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="custom_end_date"
                  checked={formData.custom_end_date}
                  onChange={(e) => setFormData({ ...formData, custom_end_date: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="custom_end_date" className="mr-2 text-sm font-medium text-gray-700">
                  انتخاب تاریخ پایان اشتراک به صورت دستی
                </label>
              </div>

              {formData.custom_end_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاریخ پایان اشتراک *
                  </label>
                  <DatePicker
                    value={customEndDate}
                    onChange={setCustomEndDate}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="انتخاب تاریخ..."
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    در صورت انتخاب این گزینه، مدت اشتراک نادیده گرفته می‌شود
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد Tenant'}
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
