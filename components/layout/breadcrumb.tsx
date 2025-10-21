'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeNames: { [key: string]: string } = {
    '/dashboard': 'داشبورد',
    '/dashboard/customers': 'مشتریان',
    '/dashboard/contacts': 'مخاطبین',
    '/dashboard/coworkers': 'همکاران',
    '/dashboard/activities': 'فعالیت‌ها',
    '/dashboard/interactions': 'تعاملات',
    '/dashboard/interactions/chat': 'چت',
    '/dashboard/deals': 'معاملات',
    '/dashboard/feedback': 'بازخوردها',
    '/dashboard/reports': 'گزارش‌ها',
    '/dashboard/daily-reports': 'گزارش‌های روزانه',
    '/dashboard/calendar': 'تقویم',
    '/dashboard/profile': 'پروفایل',
    '/dashboard/settings': 'تنظیمات',

};

export function Breadcrumb() {
    const pathname = usePathname();

    if (!pathname) {
        return null;
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        return {
            name: routeNames[path] || segment,
            path,
            isLast: index === pathSegments.length - 1,
        };
    });

    if (pathname === '/dashboard') {
        return null; // Don't show breadcrumb on dashboard home
    }

    return (
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6 bg-teal-100/80 dark:bg-teal-950/20 px-4 py-2 rounded-xl shadow-sm border border-teal-200/50 dark:border-teal-800/30 backdrop-blur-sm">
            <Link
                href="/dashboard"
                className="flex items-center text-teal-600 dark:text-teal-400 hover:text-primary transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.path} className="flex items-center space-x-2 space-x-reverse">
                    <ChevronLeft className="h-4 w-4" />
                    {breadcrumb.isLast ? (
                        <span className="font-medium text-teal-800 dark:text-teal-300 font-vazir">
                            {breadcrumb.name}
                        </span>
                    ) : (
                        <Link
                            href={breadcrumb.path}
                            className="text-teal-600 dark:text-teal-400 hover:text-primary transition-colors font-vazir"
                        >
                            {breadcrumb.name}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}