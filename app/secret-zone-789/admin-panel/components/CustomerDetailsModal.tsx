'use client';

import { Customer } from '../types';

// Try to load react-icons, but provide simple fallbacks if not installed
let FiX: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
let FiUser: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
let FiMail: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
let FiPhone: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
let FiCalendar: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
let FiCreditCard: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
let FiRefreshCw: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
let FiPause: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
let FiEdit: any = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const icons = require('react-icons/fi');
    FiX = icons.FiX;
    FiUser = icons.FiUser;
    FiMail = icons.FiMail;
    FiPhone = icons.FiPhone;
    FiCalendar = icons.FiCalendar;
    FiCreditCard = icons.FiCreditCard;
    FiRefreshCw = icons.FiRefreshCw;
    FiPause = icons.FiPause;
    FiEdit = icons.FiEdit;
} catch (e) {
    // react-icons not installed — icon fallbacks will be used
}

interface CustomerDetailsModalProps {
    customer: Customer;
    onClose: () => void;
}

export default function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
    const getStatusBadge = (status: Customer['subscriptionStatus']) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
        
        switch (status) {
            case 'active':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'expired':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'suspended':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getStatusText = (status: Customer['subscriptionStatus']) => {
        switch (status) {
            case 'active':
                return 'فعال';
            case 'expired':
                return 'منقضی';
            case 'suspended':
                return 'معلق';
            default:
                return 'نامشخص';
        }
    };

    const handleRenewSubscription = () => {
        // TODO: Implement renewal logic
        alert('عملیات تمدید اشتراک در حال پیاده‌سازی است');
    };

    const handleToggleStatus = () => {
        // TODO: Implement status toggle logic
        alert('عملیات تغییر وضعیت در حال پیاده‌سازی است');
    };

    const handleChangePlan = () => {
        // TODO: Implement plan change logic
        alert('عملیات تغییر پلن در حال پیاده‌سازی است');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">جزئیات مشتری</h2>
                            <p className="text-sm text-gray-500">{customer.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
                        aria-label="بستن"
                    >
                        <FiX className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {/* Three-column layout - Responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Profile Information */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 md:col-span-2 lg:col-span-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FiUser className="h-5 w-5 text-blue-600 ml-2 flex-shrink-0" />
                                اطلاعات پروفایل
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3 space-x-reverse">
                                    <FiUser className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">نام کامل</p>
                                        <p className="text-sm text-gray-900">{customer.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 space-x-reverse">
                                    <FiMail className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">آدرس ایمیل</p>
                                        <p className="text-sm text-gray-900" dir="ltr">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 space-x-reverse">
                                    <FiPhone className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">شماره تماس</p>
                                        <p className="text-sm text-gray-900" dir="ltr">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 space-x-reverse">
                                    <FiCalendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">شناسه مشتری</p>
                                        <p className="text-sm text-gray-900">{customer.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Status */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FiCreditCard className="h-5 w-5 text-blue-600 ml-2 flex-shrink-0" />
                                وضعیت اشتراک
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">وضعیت فعلی</p>
                                    <span className={getStatusBadge(customer.subscriptionStatus)}>
                                        {getStatusText(customer.subscriptionStatus)}
                                    </span>
                                </div>
                                {customer.plan && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">پلن اشتراک</p>
                                        <p className="text-sm text-gray-900 font-medium">{customer.plan}</p>
                                    </div>
                                )}
                                {customer.subscriptionStart && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">تاریخ شروع</p>
                                        <p className="text-sm text-gray-900">{customer.subscriptionStart}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">تاریخ پایان</p>
                                    <p className="text-sm text-gray-900">{customer.subscriptionEnd}</p>
                                </div>
                                {customer.subscriptionStatus === 'active' && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm text-green-800">
                                            اشتراک فعال است و تا {customer.subscriptionEnd} اعتبار دارد.
                                        </p>
                                    </div>
                                )}
                                {customer.subscriptionStatus === 'expired' && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-800">
                                            اشتراک در تاریخ {customer.subscriptionEnd} منقضی شده است.
                                        </p>
                                    </div>
                                )}
                                {customer.subscriptionStatus === 'suspended' && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            اشتراک به دلیل عدم پرداخت یا سایر دلایل معلق شده است.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 md:col-span-2 lg:col-span-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">عملیات سریع</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleRenewSubscription}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                                >
                                    <FiRefreshCw className="h-4 w-4 ml-2 flex-shrink-0" />
                                    تمدید اشتراک
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                                >
                                    <FiPause className="h-4 w-4 ml-2 flex-shrink-0" />
                                    <span className="truncate">{customer.subscriptionStatus === 'suspended' ? 'فعال‌سازی' : 'تعلیق'} اشتراک</span>
                                </button>
                                <button
                                    onClick={handleChangePlan}
                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                                >
                                    <FiEdit className="h-4 w-4 ml-2 flex-shrink-0" />
                                    تغییر پلن
                                </button>
                                <div className="pt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => alert('ویرایش اطلاعات مشتری در حال پیاده‌سازی است')}
                                        className="w-full flex items-center justify-center px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                                    >
                                        <FiEdit className="h-4 w-4 ml-2 flex-shrink-0" />
                                        ویرایش اطلاعات
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription History Table */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">تاریخچه اشتراک‌ها و پرداخت‌ها</h3>
                            <p className="text-sm text-gray-500 mt-1">تمام فعالیت‌های مالی و اشتراک این مشتری</p>
                        </div>
                        <div className="overflow-x-auto">
                            {customer.subscriptionHistory && customer.subscriptionHistory.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                شناسه
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                نوع پلن
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تاریخ شروع
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                تاریخ پایان
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                مبلغ پرداختی
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                مدت زمان
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {customer.subscriptionHistory.map((history, index) => {
                                            const startDate = new Date(history.start);
                                            const endDate = new Date(history.end);
                                            const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                            
                                            return (
                                                <tr 
                                                    key={history.id} 
                                                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {history.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {history.plan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {history.start}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {history.end}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {history.amount.toLocaleString('fa-IR')} تومان
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {durationDays} روز
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-4 sm:px-6 py-12 text-center">
                                    <FiCreditCard className="mx-auto h-12 w-12 text-gray-300" />
                                    <h3 className="mt-4 text-sm font-medium text-gray-900">تاریخچه‌ای یافت نشد</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        هنوز هیچ فعالیت مالی یا اشتراکی برای این مشتری ثبت نشده است.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                    >
                        بستن
                    </button>
                    <button
                        onClick={() => alert('گزارش‌گیری در حال پیاده‌سازی است')}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                    >
                        دریافت گزارش
                    </button>
                </div>
            </div>
        </div>
    );
}