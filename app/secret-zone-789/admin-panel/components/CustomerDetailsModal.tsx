'use client';

import { useState, useEffect } from 'react';
import { Customer } from '../types';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

// Icons
let FiX: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
let FiUser: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
let FiMail: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
let FiPhone: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
let FiCalendar: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
let FiCreditCard: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
let FiRefreshCw: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
let FiPause: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
let FiEdit: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
let FiKey: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
let FiTrash: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
let FiPlay: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
let FiCopy: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
let FiPlus: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

try {
  const icons = require('react-icons/fi');
  FiX = icons.FiX; FiUser = icons.FiUser; FiMail = icons.FiMail; FiPhone = icons.FiPhone;
  FiCalendar = icons.FiCalendar; FiCreditCard = icons.FiCreditCard; FiRefreshCw = icons.FiRefreshCw;
  FiPause = icons.FiPause; FiEdit = icons.FiEdit; FiKey = icons.FiKey; FiTrash = icons.FiTrash;
  FiPlay = icons.FiPlay; FiCopy = icons.FiCopy; FiPlus = icons.FiPlus;
} catch (e) {}

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
  onRefresh?: () => void;
}

interface Plan {
  plan_key: string;
  plan_name: string;
  price_monthly: number;
  price_yearly: number;
}

interface ApiKey {
  id: number;
  api_key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}


export default function CustomerDetailsModal({ customer, onClose, onRefresh }: CustomerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'subscription' | 'api-keys'>('info');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [tenantDetails, setTenantDetails] = useState<any>(null);
  
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showChangePlanForm, setShowChangePlanForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  
  const [renewDate, setRenewDate] = useState<DateObject | null>(null);
  const [renewAmount, setRenewAmount] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planEndDate, setPlanEndDate] = useState<DateObject | null>(null);
  
  const [editData, setEditData] = useState({
    company_name: customer.name,
    admin_email: customer.email,
    admin_phone: customer.phone
  });
  
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyDescription, setApiKeyDescription] = useState('');

  useEffect(() => {
    fetchTenantDetails();
    fetchPlans();
    fetchApiKeys();
  }, [customer.id]);

  const fetchTenantDetails = async () => {
    try {
      const res = await fetch(`/api/admin/tenants/${customer.id}`);
      const data = await res.json();
      if (data.success) setTenantDetails(data.data);
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await fetch(`/api/admin/api-keys?tenant_id=${customer.id}`);
      const data = await res.json();
      if (data.success) setApiKeys(data.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };


  const handleRenewSubscription = async () => {
    if (!renewDate) { alert('لطفاً تاریخ پایان اشتراک را انتخاب کنید'); return; }
    setLoading(true);
    try {
      const gregorianDate = renewDate.convert(require('react-date-object/calendars/gregorian')).format('YYYY-MM-DD');
      const res = await fetch(`/api/admin/tenants/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew', subscription_end: gregorianDate, amount: parseFloat(renewAmount) || 0, notes: renewNotes })
      });
      const data = await res.json();
      if (data.success) { alert('اشتراک با موفقیت تمدید شد'); setShowRenewForm(false); fetchTenantDetails(); onRefresh?.(); }
      else alert(data.error || 'خطا در تمدید اشتراک');
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleSuspend = async () => {
    if (!confirm('آیا از تعلیق این اشتراک مطمئن هستید؟')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${customer.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', reason: 'تعلیق توسط ادمین' })
      });
      const data = await res.json();
      if (data.success) { alert('اشتراک تعلیق شد'); fetchTenantDetails(); onRefresh?.(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${customer.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' })
      });
      const data = await res.json();
      if (data.success) { alert('اشتراک فعال شد'); fetchTenantDetails(); onRefresh?.(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) { alert('لطفاً پلن جدید را انتخاب کنید'); return; }
    setLoading(true);
    try {
      const gregorianDate = planEndDate?.convert(require('react-date-object/calendars/gregorian')).format('YYYY-MM-DD');
      const res = await fetch(`/api/admin/tenants/${customer.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_plan', plan_key: selectedPlan, subscription_end: gregorianDate })
      });
      const data = await res.json();
      if (data.success) { alert(data.message); setShowChangePlanForm(false); fetchTenantDetails(); onRefresh?.(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };


  const handleUpdateInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${customer.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_info', ...editData })
      });
      const data = await res.json();
      if (data.success) { alert('اطلاعات بروزرسانی شد'); setShowEditForm(false); fetchTenantDetails(); onRefresh?.(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleDeleteTenant = async () => {
    if (!confirm('آیا از حذف این Tenant مطمئن هستید؟ این عمل قابل بازگشت نیست!')) return;
    if (!confirm('لطفاً دوباره تأیید کنید. تمام اطلاعات این مشتری حذف خواهد شد.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${customer.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { alert('Tenant با موفقیت حذف شد'); onClose(); onRefresh?.(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleCreateApiKey = async () => {
    if (!apiKeyName) { alert('لطفاً نام کلید را وارد کنید'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: customer.id, name: apiKeyName, description: apiKeyDescription })
      });
      const data = await res.json();
      if (data.success) { setNewApiKey(data.data.api_key); setApiKeyName(''); setApiKeyDescription(''); fetchApiKeys(); }
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
    finally { setLoading(false); }
  };

  const handleDeleteApiKey = async (keyId: number) => {
    if (!confirm('آیا از حذف این کلید API مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/api-keys?id=${keyId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchApiKeys();
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
  };

  const handleToggleApiKey = async (keyId: number, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId, is_active: !isActive })
      });
      const data = await res.json();
      if (data.success) fetchApiKeys();
      else alert(data.error);
    } catch (error) { alert('خطا در ارتباط با سرور'); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert('کپی شد!'); };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'active': return `${base} bg-green-100 text-green-800`;
      case 'expired': return `${base} bg-red-100 text-red-800`;
      case 'suspended': return `${base} bg-yellow-100 text-yellow-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'expired': return 'منقضی';
      case 'suspended': return 'معلق';
      default: return 'نامشخص';
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button onClick={() => setActiveTab('info')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
            اطلاعات
          </button>
          <button onClick={() => setActiveTab('subscription')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'subscription' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
            اشتراک
          </button>
          <button onClick={() => setActiveTab('api-keys')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'api-keys' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
            کلیدهای API
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">اطلاعات پروفایل</h3>
                  <button onClick={() => setShowEditForm(!showEditForm)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <FiEdit className="w-4 h-4 ml-1" /> ویرایش
                  </button>
                </div>
                {showEditForm ? (
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">نام شرکت</label>
                      <input type="text" value={editData.company_name} onChange={(e) => setEditData({...editData, company_name: e.target.value})} className="w-full border rounded-md px-3 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                      <input type="email" value={editData.admin_email} onChange={(e) => setEditData({...editData, admin_email: e.target.value})} className="w-full border rounded-md px-3 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
                      <input type="text" value={editData.admin_phone} onChange={(e) => setEditData({...editData, admin_phone: e.target.value})} className="w-full border rounded-md px-3 py-2" /></div>
                    <div className="flex gap-2">
                      <button onClick={handleUpdateInfo} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'در حال ذخیره...' : 'ذخیره'}</button>
                      <button onClick={() => setShowEditForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">انصراف</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-gray-500 text-sm">نام:</span> <span className="font-medium">{customer.name}</span></div>
                    <div><span className="text-gray-500 text-sm">ایمیل:</span> <span className="font-medium">{customer.email}</span></div>
                    <div><span className="text-gray-500 text-sm">تلفن:</span> <span className="font-medium">{customer.phone || '-'}</span></div>
                    <div><span className="text-gray-500 text-sm">شناسه:</span> <span className="font-medium">{customer.id}</span></div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">عملیات سریع</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => { setShowRenewForm(true); setActiveTab('subscription'); }} className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700"><FiRefreshCw className="w-6 h-6 mb-1" /><span className="text-sm">تمدید</span></button>
                  {customer.subscriptionStatus === 'suspended' ? (
                    <button onClick={handleActivate} className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 text-green-700"><FiPlay className="w-6 h-6 mb-1" /><span className="text-sm">فعال‌سازی</span></button>
                  ) : (
                    <button onClick={handleSuspend} className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 text-yellow-700"><FiPause className="w-6 h-6 mb-1" /><span className="text-sm">تعلیق</span></button>
                  )}
                  <button onClick={() => { setShowChangePlanForm(true); setActiveTab('subscription'); }} className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 text-purple-700"><FiCreditCard className="w-6 h-6 mb-1" /><span className="text-sm">تغییر پلن</span></button>
                  <button onClick={handleDeleteTenant} className="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 text-red-700"><FiTrash className="w-6 h-6 mb-1" /><span className="text-sm">حذف</span></button>
                </div>
              </div>
            </div>
          )}


          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">وضعیت اشتراک</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500 text-sm">وضعیت:</span> <span className={getStatusBadge(customer.subscriptionStatus || 'active')}>{getStatusText(customer.subscriptionStatus || 'active')}</span></div>
                  <div><span className="text-gray-500 text-sm">پلن:</span> <span className="font-medium">{tenantDetails?.plan_name || customer.plan || '-'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-500 text-sm">تاریخ پایان:</span> <span className="font-medium">{customer.subscriptionEnd || '-'}</span> <button onClick={() => setShowRenewForm(true)} className="text-blue-600 hover:text-blue-800 text-xs">ویرایش</button></div>
                  <div><span className="text-gray-500 text-sm">تاریخ شروع:</span> <span className="font-medium">{tenantDetails?.subscription_start || '-'}</span></div>
                </div>
              </div>

              {/* Renew Form */}
              {showRenewForm && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold mb-4">تمدید اشتراک</h4>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">تاریخ پایان جدید</label>
                      <DatePicker value={renewDate} onChange={setRenewDate} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" inputClass="w-full border rounded-md px-3 py-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">مبلغ (تومان)</label>
                      <input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="مبلغ پرداختی" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">یادداشت</label>
                      <textarea value={renewNotes} onChange={(e) => setRenewNotes(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={2} placeholder="توضیحات اختیاری" /></div>
                    <div className="flex gap-2">
                      <button onClick={handleRenewSubscription} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'در حال ذخیره...' : 'تمدید'}</button>
                      <button onClick={() => setShowRenewForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Plan Form */}
              {showChangePlanForm && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold mb-4">تغییر پلن</h4>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">پلن جدید</label>
                      <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full border rounded-md px-3 py-2">
                        <option value="">انتخاب پلن...</option>
                        {plans.map(plan => (<option key={plan.plan_key} value={plan.plan_key}>{plan.plan_name} - {plan.price_monthly?.toLocaleString()} تومان/ماه</option>))}
                      </select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">تاریخ پایان جدید (اختیاری)</label>
                      <DatePicker value={planEndDate} onChange={setPlanEndDate} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" inputClass="w-full border rounded-md px-3 py-2" /></div>
                    <div className="flex gap-2">
                      <button onClick={handleChangePlan} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50">{loading ? 'در حال ذخیره...' : 'تغییر پلن'}</button>
                      <button onClick={() => setShowChangePlanForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">انصراف</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">کلیدهای API</h3>
                <button onClick={() => setShowCreateApiKey(!showCreateApiKey)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                  <FiPlus className="w-4 h-4 ml-1" /> کلید جدید
                </button>
              </div>

              {/* New API Key Created */}
              {newApiKey && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">کلید API جدید ایجاد شد!</h4>
                  <p className="text-sm text-green-700 mb-2">این کلید فقط یکبار نمایش داده می‌شود. آن را در جای امنی ذخیره کنید.</p>
                  <div className="flex items-center gap-2 bg-white p-2 rounded border">
                    <code className="flex-1 text-sm font-mono break-all">{newApiKey}</code>
                    <button onClick={() => copyToClipboard(newApiKey)} className="p-2 hover:bg-gray-100 rounded"><FiCopy className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => setNewApiKey(null)} className="mt-2 text-sm text-green-600 hover:text-green-800">بستن</button>
                </div>
              )}

              {/* Create API Key Form */}
              {showCreateApiKey && !newApiKey && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold mb-4">ایجاد کلید API جدید</h4>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">نام کلید *</label>
                      <input type="text" value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="مثال: WordPress Integration" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                      <textarea value={apiKeyDescription} onChange={(e) => setApiKeyDescription(e.target.value)} className="w-full border rounded-md px-3 py-2" rows={2} placeholder="توضیحات اختیاری" /></div>
                    <div className="flex gap-2">
                      <button onClick={handleCreateApiKey} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'در حال ایجاد...' : 'ایجاد کلید'}</button>
                      <button onClick={() => setShowCreateApiKey(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys List */}
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">هیچ کلید API ای وجود ندارد</div>
                ) : (
                  apiKeys.map(key => (
                    <div key={key.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiKey className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{key.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{key.is_active ? 'فعال' : 'غیرفعال'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span>پیشوند: {key.api_key_prefix}...</span>
                          {key.last_used_at && <span className="mr-4">آخرین استفاده: {key.last_used_at}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleApiKey(key.id, key.is_active)} className={`px-3 py-1 rounded text-sm ${key.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{key.is_active ? 'غیرفعال' : 'فعال'}</button>
                        <button onClick={() => handleDeleteApiKey(key.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}