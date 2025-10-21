'use client';

import { DashboardStats } from '../types';

// Try to load react-icons, but provide simple fallbacks if not installed
let FiUsers: any = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
let FiUserCheck: any = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <polyline points="9,12 12,15 22,5" />
  </svg>
);
let FiUserX: any = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);
let FiUserMinus: any = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="18" y1="11" x2="23" y2="11" />
  </svg>
);

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const icons = require('react-icons/fi');
  FiUsers = icons.FiUsers;
  FiUserCheck = icons.FiUserCheck;
  FiUserX = icons.FiUserX;
  FiUserMinus = icons.FiUserMinus;
} catch (e) {
  // react-icons not installed — icon fallbacks will be used
}

interface DashboardStatsProps {
  stats: DashboardStats;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  valueColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  valueColor, 
  subtitle 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="mr-3 sm:mr-4 flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
            {title}
          </h3>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${valueColor} leading-none`}>
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardStatsComponent: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        title="تعداد کل مشتریان"
        value={stats.totalCustomers}
        icon={FiUsers}
        iconColor="text-blue-600"
        valueColor="text-blue-600"
        subtitle="کل مشتریان ثبت شده"
      />
      
      <StatCard
        title="مشتریان فعال"
        value={stats.activeCustomers}
        icon={FiUserCheck}
        iconColor="text-green-600"
        valueColor="text-green-600"
        subtitle="اشتراک فعال"
      />
      
      <StatCard
        title="مشتریان منقضی شده"
        value={stats.expiredCustomers}
        icon={FiUserX}
        iconColor="text-red-500"
        valueColor="text-red-500"
        subtitle="نیاز به تمدید"
      />
      
      <StatCard
        title="مشتریان معلق"
        value={stats.suspendedCustomers}
        icon={FiUserMinus}
        iconColor="text-yellow-600"
        valueColor="text-yellow-600"
        subtitle="حساب معلق شده"
      />
    </div>
  );
};

export default DashboardStatsComponent;