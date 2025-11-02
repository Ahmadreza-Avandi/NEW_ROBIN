import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconGradient?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  iconGradient = 'from-blue-500 to-purple-600',
  actions 
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className={`bg-gradient-to-br ${iconGradient} p-4 rounded-xl shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-vazir mt-1">
            {description}
          </p>
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
