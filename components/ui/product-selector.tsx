'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Package, Star, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  sku?: string;
}

interface ProductInterest {
  productId: string;
  interestLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface ProductSelectorProps {
  selectedProducts: ProductInterest[];
  onSelectionChange: (products: ProductInterest[]) => void;
  className?: string;
  tenantKey: string;
}

export function ProductSelector({ selectedProducts, onSelectionChange, className, tenantKey }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (tenantKey) {
      loadProducts();
    }
  }, [tenantKey]);

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch('/api/tenant/products', {
        headers: {
          'X-Tenant-Key': tenantKey,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);

        // استخراج دسته‌بندی‌های منحصر به فرد
        const uniqueCategories = [...new Set(data.data.map((p: Product) => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.productId === productId);
  };

  const getProductInterest = (productId: string) => {
    return selectedProducts.find(p => p.productId === productId);
  };

  const handleProductToggle = (product: Product) => {
    const isSelected = isProductSelected(product.id);

    if (isSelected) {
      // حذف محصول از لیست
      const newSelection = selectedProducts.filter(p => p.productId !== product.id);
      onSelectionChange(newSelection);
    } else {
      // اضافه کردن محصول به لیست
      const newSelection = [...selectedProducts, {
        productId: product.id,
        interestLevel: 'medium' as const,
        notes: ''
      }];
      onSelectionChange(newSelection);
    }
  };

  const handleInterestLevelChange = (productId: string, interestLevel: 'low' | 'medium' | 'high') => {
    const newSelection = selectedProducts.map(p =>
      p.productId === productId ? { ...p, interestLevel } : p
    );
    onSelectionChange(newSelection);
  };

  const handleNotesChange = (productId: string, notes: string) => {
    const newSelection = selectedProducts.map(p =>
      p.productId === productId ? { ...p, notes } : p
    );
    onSelectionChange(newSelection);
  };

  const getInterestLevelLabel = (level: string) => {
    switch (level) {
      case 'high': return 'بالا';
      case 'medium': return 'متوسط';
      case 'low': return 'پایین';
      default: return level;
    }
  };

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
            <Package className="h-5 w-5" />
            <span>محصولات مورد علاقه</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground font-vazir">در حال بارگذاری محصولات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
          <Package className="h-5 w-5" />
          <span>محصولات مورد علاقه</span>
          <Badge variant="secondary" className="font-vazir">
            {selectedProducts.length} انتخاب شده
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* فیلتر دسته‌بندی */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label className="font-vazir">فیلتر بر اساس دسته‌بندی:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="font-vazir">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-vazir">همه دسته‌ها</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="font-vazir">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* لیست محصولات */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-vazir">محصولی یافت نشد</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const isSelected = isProductSelected(product.id);
              const productInterest = getProductInterest(product.id);

              return (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleProductToggle(product)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium font-vazir">{product.name}</h4>
                        {product.category && (
                          <Badge variant="outline" className="font-vazir">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground font-vazir mt-1">
                          {product.description}
                        </p>
                      )}
                      {product.price && (
                        <p className="text-sm font-medium font-vazir mt-1">
                          قیمت: {product.price.toLocaleString('fa-IR')} {product.currency || 'تومان'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* تنظیمات محصول انتخاب شده */}
                  {isSelected && productInterest && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      <div className="space-y-2">
                        <Label className="font-vazir">سطح علاقه‌مندی:</Label>
                        <Select
                          value={productInterest.interestLevel}
                          onValueChange={(value: 'low' | 'medium' | 'high') =>
                            handleInterestLevelChange(product.id, value)
                          }
                        >
                          <SelectTrigger className="font-vazir">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low" className="font-vazir">پایین</SelectItem>
                            <SelectItem value="medium" className="font-vazir">متوسط</SelectItem>
                            <SelectItem value="high" className="font-vazir">بالا</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-vazir">یادداشت:</Label>
                        <Textarea
                          value={productInterest.notes || ''}
                          onChange={(e) => handleNotesChange(product.id, e.target.value)}
                          placeholder="یادداشت درباره علاقه مشتری به این محصول..."
                          className="font-vazir"
                          dir="rtl"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* خلاصه انتخاب‌ها */}
        {selectedProducts.length > 0 && (
          <div className="border-t pt-4">
            <h5 className="font-medium font-vazir mb-3">خلاصه محصولات انتخاب شده:</h5>
            <div className="space-y-2">
              {selectedProducts.map(interest => {
                const product = products.find(p => p.id === interest.productId);
                if (!product) return null;

                return (
                  <div key={interest.productId} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-vazir text-sm">{product.name}</span>
                      <Badge className={`font-vazir text-xs ${getInterestLevelColor(interest.interestLevel)}`}>
                        {getInterestLevelLabel(interest.interestLevel)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleProductToggle(product)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}