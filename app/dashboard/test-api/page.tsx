'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Package, Users, Heart } from 'lucide-react';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const { toast } = useToast();

  const testApi = async (endpoint: string, label: string) => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [label]: {
          success: data.success,
          data: data.data || data,
          count: Array.isArray(data.data) ? data.data.length : 0,
          message: data.message
        }
      }));

      toast({
        title: data.success ? "موفق" : "خطا",
        description: `${label}: ${data.success ? 'موفق' : data.message}`,
        variant: data.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error(`Error testing ${label}:`, error);
      setResults(prev => ({
        ...prev,
        [label]: {
          success: false,
          error: error instanceof Error ? error.message : 'خطای نامشخص'
        }
      }));
      
      toast({
        title: "خطا",
        description: `${label}: خطا در اتصال`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllApis = async () => {
    await testApi('/api/products', 'محصولات');
    await testApi('/api/customer-product-interests', 'علاقه‌مندی‌ها');
    await testApi('/api/customers/filter-options', 'گزینه‌های فیلتر');
    await testApi('/api/customers?limit=5', 'مشتریان');
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">موفق</Badge>
    ) : (
      <Badge variant="destructive">خطا</Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            تست API های جدید
          </h1>
          <p className="text-muted-foreground font-vazir mt-2">بررسی عملکرد API های محصولات و علاقه‌مندی‌ها</p>
        </div>
        <Button 
          onClick={testAllApis} 
          disabled={loading}
          className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 font-vazir"
        >
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تست همه API ها
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* تست محصولات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
              <Package className="h-5 w-5" />
              <span>API محصولات</span>
              {results.محصولات && getStatusBadge(results.محصولات.success)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => testApi('/api/products', 'محصولات')}
                disabled={loading}
                className="w-full font-vazir"
              >
                تست دریافت محصولات
              </Button>
              
              {results.محصولات && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-vazir">
                    <strong>نتیجه:</strong> {results.محصولات.success ? 'موفق' : 'خطا'}
                  </div>
                  {results.محصولات.success && (
                    <div className="font-vazir mt-1">
                      <strong>تعداد:</strong> {results.محصولات.count} محصول
                    </div>
                  )}
                  {results.محصولات.error && (
                    <div className="text-red-600 font-vazir mt-1">
                      <strong>خطا:</strong> {results.محصولات.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تست علاقه‌مندی‌ها */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
              <Heart className="h-5 w-5" />
              <span>API علاقه‌مندی‌ها</span>
              {results['علاقه‌مندی‌ها'] && getStatusBadge(results['علاقه‌مندی‌ها'].success)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => testApi('/api/customer-product-interests', 'علاقه‌مندی‌ها')}
                disabled={loading}
                className="w-full font-vazir"
              >
                تست دریافت علاقه‌مندی‌ها
              </Button>
              
              {results['علاقه‌مندی‌ها'] && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-vazir">
                    <strong>نتیجه:</strong> {results['علاقه‌مندی‌ها'].success ? 'موفق' : 'خطا'}
                  </div>
                  {results['علاقه‌مندی‌ها'].success && (
                    <div className="font-vazir mt-1">
                      <strong>تعداد:</strong> {results['علاقه‌مندی‌ها'].count} علاقه‌مندی
                    </div>
                  )}
                  {results['علاقه‌مندی‌ها'].error && (
                    <div className="text-red-600 font-vazir mt-1">
                      <strong>خطا:</strong> {results['علاقه‌مندی‌ها'].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تست گزینه‌های فیلتر */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
              <Users className="h-5 w-5" />
              <span>API گزینه‌های فیلتر</span>
              {results['گزینه‌های فیلتر'] && getStatusBadge(results['گزینه‌های فیلتر'].success)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => testApi('/api/customers/filter-options', 'گزینه‌های فیلتر')}
                disabled={loading}
                className="w-full font-vazir"
              >
                تست گزینه‌های فیلتر
              </Button>
              
              {results['گزینه‌های فیلتر'] && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-vazir">
                    <strong>نتیجه:</strong> {results['گزینه‌های فیلتر'].success ? 'موفق' : 'خطا'}
                  </div>
                  {results['گزینه‌های فیلتر'].success && results['گزینه‌های فیلتر'].data && (
                    <div className="font-vazir mt-1 space-y-1">
                      <div><strong>محصولات:</strong> {results['گزینه‌های فیلتر'].data.products?.length || 0}</div>
                      <div><strong>شهرها:</strong> {results['گزینه‌های فیلتر'].data.cities?.length || 0}</div>
                      <div><strong>صنایع:</strong> {results['گزینه‌های فیلتر'].data.industries?.length || 0}</div>
                    </div>
                  )}
                  {results['گزینه‌های فیلتر'].error && (
                    <div className="text-red-600 font-vazir mt-1">
                      <strong>خطا:</strong> {results['گزینه‌های فیلتر'].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تست مشتریان */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
              <Users className="h-5 w-5" />
              <span>API مشتریان</span>
              {results.مشتریان && getStatusBadge(results.مشتریان.success)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => testApi('/api/customers?limit=5', 'مشتریان')}
                disabled={loading}
                className="w-full font-vazir"
              >
                تست دریافت مشتریان
              </Button>
              
              {results.مشتریان && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-vazir">
                    <strong>نتیجه:</strong> {results.مشتریان.success ? 'موفق' : 'خطا'}
                  </div>
                  {results.مشتریان.success && (
                    <div className="font-vazir mt-1">
                      <strong>تعداد:</strong> {results.مشتریان.count} مشتری
                    </div>
                  )}
                  {results.مشتریان.error && (
                    <div className="text-red-600 font-vazir mt-1">
                      <strong>خطا:</strong> {results.مشتریان.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمایش جزئیات کامل */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-vazir">جزئیات کامل نتایج</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}