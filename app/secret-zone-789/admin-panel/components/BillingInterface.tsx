'use client';

import { useState } from 'react';
import { Invoice, DashboardStats } from '../types';

// Try to load react-icons, but provide simple fallbacks if not installed
let FiDownload: any = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7,10 12,15 17,10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
let FiDollarSign: any = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
let FiTrendingUp: any = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,6 23,6 23,12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
let FiCalendar: any = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

try {
    const icons = require('react-icons/fi');
    FiDownload = icons.FiDownload;
    FiDollarSign = icons.FiDollarSign;
    FiTrendingUp = icons.FiTrendingUp;
    FiCalendar = icons.FiCalendar;
} catch (e) {
    // react-icons not installed — icon fallbacks will be used
}

interface BillingInterfaceProps {
    stats: DashboardStats;
}

// Mock invoice data
const MOCK_INVOICES: Invoice[] = [
    {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'علی محمدی',
        amount: 1000000,
        date: '2024-01-15',
        status: 'paid'
    },
    {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '2',
        customerName: 'زهرا رضایی',
        amount: 90000,
        date: '2024-01-20',
        status: 'overdue'
    },
    {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        customerId: '3',
        customerName: 'مهدی کریمی',
        amount: 2000000,
        date: '2024-02-01',
        status: 'pending'
    },
    {
        id: '4',
        invoiceNumber: 'INV-2024-004',
        customerId: '1',
        customerName: 'علی محمدی',
        amount: 500000,
        date: '2024-02-10',
        status: 'paid'
    },
    {
        id: '5',
        invoiceNumber: 'INV-2024-005',
        customerId: '4',
        customerName: 'فاطمه احمدی',
        amount: 750000,
        date: '2024-02-15',
        status: 'pending'
    }
];

export default function BillingInterface({ stats }: BillingInterfaceProps) {
    const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    // Calculate additional revenue metrics
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingAmount = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = invoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);

    // Filter invoices based on status
    const filteredInvoices = statusFilter === 'all' 
        ? invoices 
        : invoices.filter(inv => inv.status === statusFilter);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
    };

    // Get status badge styling
    const getStatusBadge = (status: Invoice['status']) => {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
        
        switch (status) {
            case 'paid':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'overdue':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    // Get status text
    const getStatusText = (status: Invoice['status']) => {
        switch (status) {
            case 'paid':
                return 'پرداخت شده';
            case 'pending':
                return 'در انتظار پرداخت';
            case 'overdue':
                return 'معوق';
            default:
                return 'نامشخص';
        }
    };

    // Generate PDF for invoice
    const generatePDF = (invoice: Invoice) => {
        const pdfContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="fa">
            <head>
                <meta charset="UTF-8">
                <title>فاکتور ${invoice.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin: 20px 0; }
                    .amount { font-size: 24px; font-weight: bold; color: #1e40af; }
                    .footer { margin-top: 40px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>فاکتور ${invoice.invoiceNumber}</h1>
                </div>
                <div class="invoice-details">
                    <p><strong>نام مشتری:</strong> ${invoice.customerName}</p>
                    <p><strong>تاریخ صدور:</strong> ${new Date(invoice.date).toLocaleDateString('fa-IR')}</p>
                    <p><strong>وضعیت:</strong> ${getStatusText(invoice.status)}</p>
                    <p class="amount"><strong>مبلغ:</strong> ${formatCurrency(invoice.amount)}</p>
                </div>
                <div class="footer">
                    <p>سیستم مدیریت ارتباط با مشتری</p>
                </div>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(pdfContent);
            newWindow.document.close();
            setTimeout(() => {
                newWindow.print();
            }, 500);
        }
    };

    return (
        <div className="space-y-6">
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Monthly Revenue Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-4 flex-1">
                            <p className="text-sm font-medium text-gray-600">درآمد ماهانه</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.monthlyRevenue)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Yearly Revenue Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="text-blue-600" />
                            </div>
                        </div>
                        <div className="mr-4 flex-1">
                            <p className="text-sm font-medium text-gray-600">درآمد سالانه</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.yearlyRevenue)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending Payments Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiCalendar className="text-yellow-600" />
                            </div>
                        </div>
                        <div className="mr-4 flex-1">
                            <p className="text-sm font-medium text-gray-600">در انتظار پرداخت</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(pendingAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overdue Payments Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <FiCalendar className="text-red-600" />
                            </div>
                        </div>
                        <div className="mr-4 flex-1">
                            <p className="text-sm font-medium text-gray-600">پرداخت‌های معوق</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(overdueAmount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Management Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">مدیریت فاکتورها</h2>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-4 space-x-reverse">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                <option value="all">همه فاکتورها</option>
                                <option value="paid">پرداخت شده</option>
                                <option value="pending">در انتظار پرداخت</option>
                                <option value="overdue">معوق</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    شماره فاکتور
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    نام مشتری
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاریخ صدور
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    مبلغ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    وضعیت پرداخت
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    عملیات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.map((invoice, index) => (
                                <tr key={invoice.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.customerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(invoice.date).toLocaleDateString('fa-IR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(invoice.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(invoice.status)}>
                                            {getStatusText(invoice.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => generatePDF(invoice)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 touch-manipulation"
                                        >
                                            <FiDownload className="ml-1.5" />
                                            دانلود PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <p className="text-lg font-medium">فاکتوری یافت نشد</p>
                                <p className="mt-1">هیچ فاکتوری با فیلتر انتخابی وجود ندارد.</p>
                            </div>
                        </div>
                    ) : (
                        filteredInvoices.map((invoice) => (
                            <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                                        <p className="text-sm text-gray-600">{invoice.customerName}</p>
                                    </div>
                                    <span className={getStatusBadge(invoice.status)}>
                                        {getStatusText(invoice.status)}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">تاریخ:</span>
                                        <span className="text-gray-900">{new Date(invoice.date).toLocaleDateString('fa-IR')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">مبلغ:</span>
                                        <span className="text-gray-900 font-medium">{formatCurrency(invoice.amount)}</span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => generatePDF(invoice)}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 touch-manipulation"
                                >
                                    <FiDownload className="ml-2" />
                                    دانلود PDF
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty state for desktop */}
                {filteredInvoices.length === 0 && (
                    <div className="hidden md:block text-center py-12">
                        <div className="text-gray-500">
                            <p className="text-lg font-medium">فاکتوری یافت نشد</p>
                            <p className="mt-1">هیچ فاکتوری با فیلتر انتخابی وجود ندارد.</p>
                        </div>
                    </div>
                )}

                {/* Summary Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                        <div>
                            مجموع فاکتورها: {filteredInvoices.length} از {totalInvoices}
                        </div>
                        <div className="mt-2 sm:mt-0">
                            فاکتورهای پرداخت شده: {paidInvoices} از {totalInvoices}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}