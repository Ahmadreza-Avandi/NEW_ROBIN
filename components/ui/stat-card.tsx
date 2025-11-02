import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
}

export function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${gradient} text-white overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium font-vazir text-white/90">{title}</CardTitle>
        <Icon className="h-5 w-5 text-white/80" />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold font-vazir">{value}</div>
      </CardContent>
    </Card>
  );
}
