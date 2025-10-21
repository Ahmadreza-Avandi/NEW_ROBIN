'use client';

import { useState } from 'react';
import { Customer } from '../types';

// Subscription Plan Interface
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly' | 'premium';
  features: string[];
  isActive: boolean;
}

// Subscription History Interface
interface SubscriptionHistory {
  id: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

// Mock subscription plans data
const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-monthly',
    name: 'پلن ماهانه',
    description: 'دسترسی پایه به همه امکانات سیستم',
    price: 90000,
    currency: 'تومان',
    duration: 'monthly',
    features: [
      'دسترسی به پنل مدیریت',
      'مدیریت مشتریان',
      'گزارش‌گیری پایه',
      'پشتیبانی ایمیلی'
    ],
    isActive: true
  },
  {
    id: 'plan-yearly',
    name: 'پلن سالانه',
    description: 'صرفه‌جویی در هزینه با پرداخت سالانه',
    price: 1000000,
    currency: 'تومان',
    duration: 'yearly',
    features: [
      'تمام امکانات پلن ماهانه',
      'گزارش‌گیری پیشرفته',
      'پشتیبانی تلفنی',
      '2 ماه رایگان',
      'بک‌آپ خودکار'
    ],
    isActive: true
  },
  {
    id: 'plan-premium',
    name: 'پلن ویژه',
    description: 'پشتیبانی اختصاصی و امکانات ویژه',
    price: 2000000,
    currency: 'تومان',
    duration: 'premium',
    features: [
      'تمام امکانات پلن سالانه',
      'پشتیبانی اختصاصی 24/7',
      'سفارشی‌سازی سیستم',
      'آموزش تخصصی',
      'مشاوره کسب‌وکار'
    ],
    isActive: true
  }
];

// Mock subscription history data
const MOCK_SUBSCRIPTION_HISTORY: SubscriptionHistory[] = [
  {
    id: 'sub-001',
    customerId: '1',
    customerName: 'علی محمدی',
    planId: 'plan-yearly',
    planName: 'پلن سالانه',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    amount: 1000000,
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'sub-002',
    customerId: '2',
    customerName: 'زهرا رضایی',
    planId: 'plan-monthly',
    planName: 'پلن ماهانه',
    startDate: '2022-01-01',
    endDate: '2022-02-01',
    amount: 90000,
    status: 'expired',
    createdAt: '2022-01-01T10:00:00Z'
  },
  {
    id: 'sub-003',
    customerId: '3',
    customerName: 'مهدی کریمی',
    planId: 'plan-premium',
    planName: 'پلن ویژه',
    startDate: '2023-06-01',
    endDate: '2024-06-01',
    amount: 2000000,
    status: 'active',
    createdAt: '2023-06-01T10:00:00Z'
  }
];

interface SubscriptionManagementProps {
  customers: Customer[];
}

export default function SubscriptionManagement({ customers }: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [subscriptionHistory] = useState<SubscriptionHistory[]>(MOCK_SUBSCRIPTION_HISTORY);

  const handleAssignPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = () => {
    if (selectedPlan && selectedCustomer) {
      // In a real app, this would make an API call
      console.log(`Assigning plan ${selectedPlan.name} to customer ${selectedCustomer}`);
      setShowAssignModal(false);
      setSelectedPlan(null);
      setSelectedCustomer('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const statusText = {
      active: 'فعال',
      expired: 'منقضی',
      cancelled: 'لغو شده'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Subscription Plans Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">پلن‌های اشتراک</h2>
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {MOCK_SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Plan Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                {/* Price Display */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 mr-2">{plan.currency}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {plan.duration === 'monthly' && 'ماهانه'}
                    {plan.duration === 'yearly' && 'سالانه'}
                    {plan.duration === 'premium' && 'ویژه'}
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">امکانات:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assign Button */}
              <button
                onClick={() => handleAssignPlan(plan)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation"
              >
                اختصاص به مشتری
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription History Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">تاریخچه اشتراک‌ها</h3>
        
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شناسه
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    پلن
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ شروع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ پایان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptionHistory.map((subscription, index) => (
                  <tr key={subscription.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.planName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.startDate).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.endDate).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.amount.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {subscriptionHistory.map((subscription) => (
              <div key={subscription.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{subscription.id}</h4>
                    <p className="text-sm text-gray-600">{subscription.customerName}</p>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">پلن:</span>
                    <span className="text-gray-900">{subscription.planName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">شروع:</span>
                    <span className="text-gray-900">{new Date(subscription.startDate).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">پایان:</span>
                    <span className="text-gray-900">{new Date(subscription.endDate).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">مبلغ:</span>
                    <span className="text-gray-900 font-medium">{subscription.amount.toLocaleString()} تومان</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Assignment Modal */}
      {showAssignModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                اختصاص پلن {selectedPlan.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  انتخاب مشتری:
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">مشتری را انتخاب کنید</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>پلن:</strong> {selectedPlan.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>قیمت:</strong> {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 touch-manipulation"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAssignSubmit}
                  disabled={!selectedCustomer}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  اختصاص پلن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}