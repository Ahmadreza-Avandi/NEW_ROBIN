'use client';

import { useState } from 'react';
import { Customer } from '../types';

// Try to load react-icons, but provide simple fallbacks if not installed
let FiSearch: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
let FiFilter: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>;
let FiUsers: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
let FiEye: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
let FiRefreshCw: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const icons = require('react-icons/fi');
    FiSearch = icons.FiSearch;
    FiFilter = icons.FiFilter;
    FiUsers = icons.FiUsers;
    FiEye = icons.FiEye;
    FiRefreshCw = icons.FiRefreshCw;
} catch (e) {
    // react-icons not installed — icon fallbacks will be used
}

interface CustomerTableProps {
    customers: Customer[];
    onCustomerSelect: (customer: Customer) => void;
}

type StatusFilter = 'all' | 'active' | 'expired' | 'suspended';

export default function CustomerTable({ customers, onCustomerSelect }: CustomerTableProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Filter customers based on search and status
    const filteredCustomers = customers
        .filter(customer => {
            const matchesSearch = search === '' || 
                customer.name.toLowerCase().includes(search.toLowerCase()) ||
                customer.email.toLowerCase().includes(search.toLowerCase()) ||
                customer.phone.includes(search);
            
            const matchesStatus = statusFilter === 'all' || customer.subscriptionStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

    const handleReset = () => {
        setSearch('');
        setStatusFilter('all');
    };

    const getStatusBadge = (status: Customer['subscriptionStatus']) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
        
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

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {/* Header with Search and Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <FiSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full sm:w-80 pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="جستجو بر اساس نام، ایمیل یا شماره تماس..."
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <FiFilter className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="block w-full sm:w-48 pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="all">همه وضعیت‌ها</option>
                                <option value="active">فعال</option>
                                <option value="expired">منقضی</option>
                                <option value="suspended">معلق</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            پاک کردن فیلترها
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <FiRefreshCw className="w-4 h-4 ml-2" />
                            بروزرسانی
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                    نمایش {filteredCustomers.length} از {customers.length} مشتری
                </div>
            </div>

            {/* Table - Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                مشتری
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ایمیل
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                شماره تماس
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                وضعیت اشتراک
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                تاریخ پایان
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                عملیات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <FiUsers className="w-12 h-12 text-gray-300 mb-4" />
                                        <p className="text-lg font-medium">هیچ مشتری یافت نشد</p>
                                        <p className="text-sm">فیلترهای خود را تغییر دهید یا مشتری جدید اضافه کنید</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer, index) => (
                                <tr 
                                    key={customer.id} 
                                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <FiUsers className="h-4 w-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="mr-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.name}
                                                </div>
                                                {customer.plan && (
                                                    <div className="text-sm text-gray-500">
                                                        پلن: {customer.plan}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900" dir="ltr">{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(customer.subscriptionStatus)}>
                                            {getStatusText(customer.subscriptionStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {customer.subscriptionEnd}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => onCustomerSelect(customer)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                                        >
                                            <FiEye className="w-3 h-3 ml-1" />
                                            مشاهده جزئیات
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredCustomers.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <FiUsers className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">هیچ مشتری یافت نشد</p>
                            <p className="text-sm">فیلترهای خود را تغییر دهید یا مشتری جدید اضافه کنید</p>
                        </div>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <FiUsers className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mr-3">
                                        <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                                        {customer.plan && (
                                            <p className="text-xs text-gray-500">پلن: {customer.plan}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={getStatusBadge(customer.subscriptionStatus)}>
                                    {getStatusText(customer.subscriptionStatus)}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ایمیل:</span>
                                    <span className="text-gray-900 truncate mr-2" dir="ltr">{customer.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">تلفن:</span>
                                    <span className="text-gray-900" dir="ltr">{customer.phone}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">پایان اشتراک:</span>
                                    <span className="text-gray-900">{customer.subscriptionEnd}</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => onCustomerSelect(customer)}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 touch-manipulation"
                            >
                                <FiEye className="w-4 h-4 ml-2" />
                                مشاهده جزئیات
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer with pagination info (if needed in future) */}
            {filteredCustomers.length > 0 && (
                <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            مجموع <span className="font-medium">{filteredCustomers.length}</span> مشتری
                        </div>
                        {/* Pagination can be added here in the future */}
                    </div>
                </div>
            )}
        </div>
    );
}