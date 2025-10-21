'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">دسترسی غیر مجاز</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            شما به این بخش دسترسی ندارید. لطفاً با مدیر سیستم تماس بگیرید.
          </p>
          
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button className="w-full">
                <Home className="w-4 h-4 ml-2" />
                بازگشت به داشبورد
              </Button>
            </Link>
            
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">
                <ArrowRight className="w-4 h-4 ml-2" />
                پروفایل کاربری
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}