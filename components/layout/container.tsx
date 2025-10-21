'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
    children: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
};

const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Container({
    children,
    className,
    size = 'lg',
    padding = 'md',
}: ContainerProps) {
    return (
        <div className={cn(
            'mx-auto w-full min-h-screen bg-gradient-to-br from-green-200 via-emerald-100 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-teal-900/40',
            sizeClasses[size],
            paddingClasses[padding],
            className
        )}>
            <div className="backdrop-blur-[2px]">
                {children}
            </div>
        </div>
    );
}