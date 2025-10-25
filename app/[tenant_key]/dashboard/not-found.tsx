'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight, Users, CheckCircle, Package, MessageCircle, Activity, Sparkles, LayoutDashboard } from 'lucide-react';

export default function DashboardNotFound() {
  const router = useRouter();
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';

  const popularRoutes = [
    { name: 'داشبورد', path: '/dashboard', icon: Home, color: '#00BCD4' },
    { name: 'مشتریان', path: '/dashboard/customers', icon: Users, color: '#4CAF50' },
    { name: 'فعالیت‌ها', path: '/dashboard/activities', icon: Activity, color: '#FF9800' },
    { name: 'وظایف', path: '/dashboard/tasks', icon: CheckCircle, color: '#00BCD4' },
    { name: 'محصولات', path: '/dashboard/products', icon: Package, color: '#4CAF50' },
    { name: 'چت', path: '/dashboard/chat', icon: MessageCircle, color: '#FF9800' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse" 
             style={{ background: 'linear-gradient(135deg, #00BCD4, #4CAF50)' }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" 
             style={{ background: 'linear-gradient(135deg, #4CAF50, #FF9800)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse" 
             style={{ background: 'linear-gradient(135deg, #FF9800, #00BCD4)', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#B2EBF2' }}>
          {/* Gradient Header */}
          <div className="h-2" style={{ 
            background: 'linear-gradient(to right, #00BCD4, #4CAF50, #FF9800)' 
          }}></div>
          
          <div className="p-8 lg:p-12">
            {/* Icon and Title */}
            <div className="text-center mb-10">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" 
                       style={{ background: 'linear-gradient(135deg, #00BCD4, #4CAF50, #FF9800)' }}></div>
                  <div className="absolute inset-0 rounded-full animate-pulse opacity-30" 
                       style={{ background: 'linear-gradient(135deg, #FF9800, #00BCD4, #4CAF50)' }}></div>
                  
                  {/* Main icon container */}
                  <div className="relative p-8 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-300" 
                       style={{ background: 'linear-gradient(135deg, #00BCD4, #4CAF50, #FF9800)' }}>
                    <LayoutDashboard className="h-20 w-20 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Sparkle effect */}
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
              </div>

              {/* 404 Number with gradient */}
              <h1 className="text-8xl font-black mb-6 font-vazir tracking-tight" style={{ 
                background: 'linear-gradient(135deg, #00BCD4, #4CAF50, #FF9800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 20px rgba(0, 188, 212, 0.3)'
              }}>
                404
              </h1>
              
              {/* Title */}
              <h2 className="text-3xl font-bold mb-4 font-vazir" style={{ color: '#000000' }}>
                این صفحه در داشبورد وجود ندارد
              </h2>

              {/* Description */}
              <p className="text-lg mb-2 font-vazir leading-relaxed" style={{ color: '#1a1a1a' }}>
                صفحه‌ای که دنبالش می‌گردید در داشبورد <span className="font-bold px-3 py-1 rounded-lg" style={{ 
                  background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15), rgba(76, 175, 80, 0.15))',
                  color: '#00BCD4'
                }}>{tenantKey}</span> یافت نشد.
              </p>
              <p className="text-base font-vazir mb-8" style={{ color: '#1a1a1a' }}>
                از منوی سمت راست یا دکمه‌های زیر استفاده کنید.
              </p>
            </div>

            {/* Popular Routes Grid */}
            <div className="mb-10">
              <h3 className="text-center text-xl font-bold mb-6 font-vazir flex items-center justify-center gap-2" style={{ color: '#000000' }}>
                <Sparkles className="h-5 w-5" style={{ color: '#FF9800' }} />
                دسترسی سریع به بخش‌ها
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {popularRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.path}
                      onClick={() => router.push(`/${tenantKey}${route.path}`)}
                      className="group relative bg-white p-6 rounded-2xl border-2 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ borderColor: '#B2EBF2' }}
                    >
                      {/* Hover gradient background */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{ background: `linear-gradient(135deg, ${route.color}15, ${route.color}05)` }}></div>
                      
                      {/* Icon with gradient background */}
                      <div className="relative p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                           style={{ backgroundColor: `${route.color}20` }}>
                        <Icon className="h-8 w-8 relative z-10" style={{ color: route.color }} />
                      </div>
                      
                      {/* Text */}
                      <span className="relative z-10 font-vazir font-medium text-base" style={{ color: '#000000' }}>
                        {route.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="font-vazir text-base h-14 px-8 border-2 hover:scale-105 transition-all duration-300"
                style={{ 
                  borderColor: '#00BCD4', 
                  color: '#00BCD4',
                  backgroundColor: 'rgba(0, 188, 212, 0.05)'
                }}
              >
                <ArrowRight className="h-5 w-5 ml-2" />
                بازگشت به صفحه قبل
              </Button>
              
              <Button
                onClick={() => router.push(`/${tenantKey}/dashboard`)}
                size="lg"
                className="font-vazir text-base h-14 px-8 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(135deg, #00BCD4, #4CAF50, #FF9800)',
                  border: 'none'
                }}
              >
                <Home className="h-5 w-5 ml-2" />
                بازگشت به داشبورد اصلی
              </Button>
            </div>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #00BCD4)' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00BCD4' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4CAF50', animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF9800', animationDelay: '0.4s' }}></div>
              <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(to left, transparent, #FF9800)' }}></div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full animate-bounce" 
             style={{ backgroundColor: '#00BCD4', animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full animate-bounce" 
             style={{ backgroundColor: '#4CAF50', animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 -left-6 w-4 h-4 rounded-full animate-bounce" 
             style={{ backgroundColor: '#FF9800', animationDelay: '2s', animationDuration: '3s' }}></div>
      </div>
    </div>
  );
}
