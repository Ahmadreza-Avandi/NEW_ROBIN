'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  tenant_key: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newTenantKey, setNewTenantKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<any>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data.keys);
      }
    } catch (error) {
      console.error('خطا در دریافت کلیدهای API:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || !newTenantKey.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          tenant_key: newTenantKey.trim()
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeys([...apiKeys, data.data.key]);
        setNewKeyName('');
        setNewTenantKey('');
        setShowCreateForm(false);
        
        // نمایش modal با کلید جدید
        setNewApiKeyData(data.data.key);
        setShowApiKeyModal(true);
      } else {
        alert('خطا در ساخت کلید API: ' + data.message);
      }
    } catch (error) {
      console.error('خطا در ساخت کلید API:', error);
      alert('خطا در ساخت کلید API');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // نمایش پیام موفقیت
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'کپی شد!';
        button.className = button.className.replace('bg-blue-600', 'bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.className = button.className.replace('bg-green-600', 'bg-blue-600');
        }, 2000);
      }
    } catch (err) {
      // Fallback برای مرورگرهای قدیمی
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('کلید کپی شد!');
    }
  };

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !isActive
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeys(apiKeys.map(key => 
          key.id === keyId ? { ...key, is_active: !isActive } : key
        ));
      } else {
        alert('خطا در تغییر وضعیت کلید API: ' + data.message);
      }
    } catch (error) {
      console.error('خطا در تغییر وضعیت کلید API:', error);
      alert('خطا در تغییر وضعیت کلید API');
    }
  };

  const deleteApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید کلید API "${keyName}" را حذف کنید؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
      } else {
        alert('خطا در حذف کلید API: ' + data.message);
      }
    } catch (error) {
      console.error('خطا در حذف کلید API:', error);
      alert('خطا در حذف کلید API');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">مدیریت کلیدهای API</h2>
          <p className="text-gray-600 mt-1">کلیدهای API برای اتصال افزونه WordPress به سیستم CRM</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + ساخت کلید جدید
        </button>
      </div>

      {/* فرم ساخت کلید جدید */}
      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">ساخت کلید API جدید</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Key (شناسه tenant)
              </label>
              <input
                type="text"
                value={newTenantKey}
                onChange={(e) => setNewTenantKey(e.target.value)}
                placeholder="مثال: rabin, company_a, default"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={creating}
              />
              <p className="text-xs text-gray-500 mt-1">
                شناسه منحصر به فرد برای tenant (فقط حروف انگلیسی، اعداد و _)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام کلید API
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="مثال: WordPress Plugin - Rabin"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={creating}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createApiKey}
                disabled={creating || !newKeyName.trim() || !newTenantKey.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {creating ? 'در حال ساخت...' : 'ساخت'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName('');
                  setNewTenantKey('');
                }}
                disabled={creating}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* لیست کلیدهای API */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ کلید API‌ای ساخته نشده است.</p>
          <p className="text-sm mt-1">برای اتصال افزونه WordPress، ابتدا یک کلید API بسازید.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کلید API
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ساخت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخرین استفاده
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {apiKey.tenant_key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {apiKey.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {apiKey.key.substring(0, 20)}...
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(apiKey.created_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString('fa-IR') : 'هرگز'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      apiKey.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleApiKey(apiKey.id, apiKey.is_active)}
                        className={`${
                          apiKey.is_active 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        } transition-colors`}
                      >
                        {apiKey.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                      </button>
                      <button
                        onClick={() => deleteApiKey(apiKey.id, apiKey.name)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* راهنمای استفاده */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">راهنمای استفاده:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• کلید API را در تنظیمات افزونه WordPress وارد کنید</li>
          <li>• URL سیستم CRM: <code className="bg-blue-100 px-1 rounded">http://localhost:3000</code></li>
          <li>• کلیدهای API فقط یک بار نمایش داده می‌شوند، آنها را در جای امنی ذخیره کنید</li>
          <li>• در صورت فراموشی کلید، آن را حذف کرده و کلید جدید بسازید</li>
        </ul>
      </div>

      {/* Modal نمایش کلید API جدید */}
      {showApiKeyModal && newApiKeyData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  🎉 کلید API جدید ساخته شد!
                </h3>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      مهم: این کلید فقط یک بار نمایش داده می‌شود
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>لطفاً کلید API را کپی کرده و در جای امنی ذخیره کنید. پس از بستن این پنجره، دیگر نمی‌توانید کلید کامل را مشاهده کنید.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Key:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newApiKeyData.tenant_key}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-r-none rounded-l-md px-3 py-2 bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(newApiKeyData.tenant_key)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-none rounded-r-md border border-blue-600 transition-colors"
                    >
                      کپی
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newApiKeyData.key}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-r-none rounded-l-md px-3 py-2 bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(newApiKeyData.key)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-none rounded-r-md border border-blue-600 transition-colors"
                    >
                      کپی
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CRM URL:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value="http://localhost:3000"
                      readOnly
                      className="flex-1 border border-gray-300 rounded-r-none rounded-l-md px-3 py-2 bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard('http://localhost:3000')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-l-none rounded-r-md border border-blue-600 transition-colors"
                    >
                      کپی
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  بستن
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(`Tenant: ${newApiKeyData.tenant_key}\nAPI Key: ${newApiKeyData.key}\nCRM URL: http://localhost:3000`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  کپی همه اطلاعات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}