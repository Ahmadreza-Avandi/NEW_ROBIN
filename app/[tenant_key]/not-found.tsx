'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, ArrowRight, Search, Map } from 'lucide-react';

export default function TenantNotFound() {
  const router = useRouter();
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 h-2"></div>
        
        <CardContent className="p-12">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 p-8 rounded-full shadow-2xl">
                  <AlertCircle className="h-20 w-20 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
              404
            </h1>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              صفحه یافت نشد! 🔍
            </h2>

            <p className="text-lg text-gray-600 mb-2 leading-relaxed">
              متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
            </p>
            <p className="text-base text-gray-500">
              لطفاً آدرس را بررسی کنید یا از منوی داشبورد استفاده نمایید.
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* راهنمای دسترسی */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 text-right">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 p-2 rounded-lg mt-1 flex-shrink-0">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2 text-sm">📍 مسیرهای معتبر</h3>
                  <div className="text-blue-800 text-xs space-y-1">
                    <div>• داشبورد: <code className="bg-blue-100 px-1 rounded">/dashboard</code></div>
                    <div>• مشتریان: <code className="bg-blue-100 px-1 rounded">/dashboard/customers</code></div>
                    <div>• وظایف: <code className="bg-blue-100 px-1 rounded">/dashboard/tasks</code></div>
                    <div>• محصولات: <code className="bg-blue-100 px-1 rounded">/dashboard/products</code></div>
                  </div>
                </div>
              </div>
            </div>

            {/* اطلاعات tenant */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 text-right">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 p-2 rounded-lg mt-1 flex-shrink-0">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 mb-2 text-sm">🏢 اطلاعات شرکت</h3>
                  <div className="text-purple-800 text-xs space-y-1">
                    <div>شرکت فعلی: <span className="font-bold">{tenantKey || 'نامشخص'}</span></div>
                    <div className="text-purple-600 mt-2">
                      از منوی سمت راست برای دسترسی به بخش‌های مختلف استفاده کنید
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* دلایل احتمالی */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8 text-right">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              دلایل احتمالی:
            </h3>
            <ul className="text-amber-800 text-sm space-y-2 mr-7">
              <li>• آدرس URL اشتباه تایپ شده است</li>
              <li>• صفحه حذف یا منتقل شده است</li>
              <li>• شما دسترسی لازم به این صفحه را ندارید</li>
              <li>• لینک منقضی شده یا نامعتبر است</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="font-vazir text-base border-2 hover:bg-gray-50"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              بازگشت به صفحه قبل
            </Button>
            
            <Button
              onClick={() => router.push(`/${tenantKey}/dashboard`)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 font-vazir text-base shadow-lg"
            >
              <Home className="h-5 w-5 ml-2" />
              بازگشت به داشبورد
            </Button>
          </div>

          {/* Footer Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">
              نیاز به کمک دارید؟
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>📧 پشتیبانی</span>
              <span>•</span>
              <span>📚 راهنما</span>
              <span>•</span>
              <span>💬 چت آنلاین</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}