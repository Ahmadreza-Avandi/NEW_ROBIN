'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, ArrowRight } from 'lucide-react';

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-0 shadow-2xl">
        <CardContent className="p-12 text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-full">
                <AlertCircle className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
            ⚠️ صفحه یافت نشد
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            متأسفانه صفحه‌ای که به دنبال آن هستید یافت نشد.
            <br />
            لطفاً از لینک صحیح استفاده کنید یا به صفحه اصلی بازگردید.
          </p>

          {/* Info Box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8 text-right">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 p-2 rounded-lg mt-1">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">💡 نکته مهم</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  برای دسترسی به داشبورد، باید از لینک اختصاصی شرکت خود استفاده کنید:
                  <br />
                  <code className="bg-amber-100 px-2 py-1 rounded mt-2 inline-block font-mono text-xs">
                    http://localhost:3000/[نام-شرکت]/dashboard
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="font-vazir text-base"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              بازگشت به صفحه قبل
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-vazir text-base"
            >
              <Home className="h-5 w-5 ml-2" />
              صفحه اصلی
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-8">
            در صورت نیاز به راهنمایی، با پشتیبانی تماس بگیرید
          </p>
        </CardContent>
      </Card>
    </div>
  );
}