'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string, label: string) => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [label]: {
          success: response.ok && data.success,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString('fa-IR')
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [label]: {
          success: false,
          error: error instanceof Error ? error.message : 'خطای نامشخص',
          timestamp: new Date().toLocaleTimeString('fa-IR')
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    await testApi('/api/test-db', 'تست دیتابیس');
    await testApi('/api/customers-simple?limit=5', 'مشتریان ساده');
    await testApi('/api/products', 'محصولات');
    await testApi('/api/customer-product-interests', 'علاقه‌مندی‌ها');
    await testApi('/api/customers/filter-options', 'گزینه‌های فیلتر');
  };

  const cleanupDuplicates = async () => {
    if (!confirm('آیا از پاکسازی مشتریان تکراری اطمینان دارید؟')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/cleanup-duplicates', { method: 'POST' });
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        'پاکسازی تکراری‌ها': {
          success: response.ok && data.success,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString('fa-IR')
        }
      }));

      if (data.success) {
        alert(`پاکسازی موفق: ${data.data.removed} مشتری تکراری حذف شد`);
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        'پاکسازی تکراری‌ها': {
          success: false,
          error: error instanceof Error ? error.message : 'خطای نامشخص',
          timestamp: new Date().toLocaleTimeString('fa-IR')
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-vazir">صفحه دیباگ</h1>
          <p className="text-muted-foreground font-vazir mt-2">تست API ها و عیب‌یابی</p>
        </div>
        <Button onClick={testAll} disabled={loading} className="font-vazir">
          {loading ? 'در حال تست...' : 'تست همه API ها'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(results).map(([label, result]: [string, any]) => (
          <Card key={label} className={`border-2 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-vazir">
                <span>{label}</span>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'موفق' : 'خطا'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground font-vazir">
                  زمان: {result.timestamp}
                </div>
                {result.status && (
                  <div className="text-sm font-vazir">
                    وضعیت HTTP: {result.status}
                  </div>
                )}
                {result.error && (
                  <div className="text-sm text-red-600 font-vazir">
                    خطا: {result.error}
                  </div>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-vazir">جزئیات پاسخ</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-vazir">تست‌های جداگانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={() => testApi('/api/test-db', 'تست دیتابیس')}
              className="font-vazir"
            >
              تست دیتابیس
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testApi('/api/customers-simple?limit=5', 'مشتریان ساده')}
              className="font-vazir"
            >
              مشتریان ساده
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testApi('/api/products', 'محصولات')}
              className="font-vazir"
            >
              محصولات
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testApi('/api/customer-product-interests', 'علاقه‌مندی‌ها')}
              className="font-vazir"
            >
              علاقه‌مندی‌ها
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testApi('/api/customers/filter-options', 'گزینه‌های فیلتر')}
              className="font-vazir"
            >
              گزینه‌های فیلتر
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => cleanupDuplicates()}
              className="font-vazir"
            >
              پاکسازی تکراری‌ها
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}