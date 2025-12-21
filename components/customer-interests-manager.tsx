'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency-utils';
import {
    Plus, Trash2, Search, Package, DollarSign, Tag, FileText, X
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
}

interface Interest {
    id: string;
    product_id: string;
    product_name: string;
    description?: string;
    price?: number;
    category?: string;
    interest_level: string;
    notes?: string;
    created_at: string;
}

interface CustomerInterestsManagerProps {
    customerId: string;
    interests: Interest[];
    onUpdate: () => void;
}

export default function CustomerInterestsManager({ 
    customerId, 
    interests, 
    onUpdate 
}: CustomerInterestsManagerProps) {
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const { toast } = useToast();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [interestLevel, setInterestLevel] = useState<string>('medium');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Utility function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    // دریافت لیست محصولات موجود
    const fetchAvailableProducts = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/products/list?customer_id=${customerId}&search=${searchTerm}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                setAvailableProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // اضافه کردن علاقه‌مندی
    const handleAddInterest = async () => {
        if (!selectedProduct) {
            toast({
                title: "خطا",
                description: "لطفاً یک محصول انتخاب کنید",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/customers/${customerId}/interests`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: selectedProduct,
                    interest_level: interestLevel,
                    notes: notes.trim() || null
                })
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "علاقه‌مندی با موفقیت اضافه شد"
                });
                setIsAddDialogOpen(false);
                setSelectedProduct('');
                setNotes('');
                setInterestLevel('medium');
                onUpdate();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در افزودن علاقه‌مندی",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error adding interest:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // حذف علاقه‌مندی
    const handleDeleteInterest = async (interestId: string, productName: string) => {
        if (!confirm(`آیا از حذف "${productName}" از لیست علاقه‌مندی‌ها اطمینان دارید؟`)) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/customers/${customerId}/interests?interest_id=${interestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': tenantKey,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "علاقه‌مندی با موفقیت حذف شد"
                });
                onUpdate();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در حذف علاقه‌مندی",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting interest:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        }
    };

    // دریافت محصولات هنگام باز شدن دیالوگ
    useEffect(() => {
        if (isAddDialogOpen) {
            fetchAvailableProducts();
        }
    }, [isAddDialogOpen, searchTerm]);

    const getInterestLevelLabel = (level: string) => {
        switch (level) {
            case 'high': return 'علاقه بالا';
            case 'medium': return 'علاقه متوسط';
            case 'low': return 'علاقه پایین';
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

    return (
        <div className="space-y-4">
            {/* دکمه افزودن */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">محصولات علاقه‌مند ({interests.length} مورد)</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                            <Plus className="h-4 w-4 ml-2" />
                            افزودن محصول
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>افزودن محصول به لیست علاقه‌مندی‌ها</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* جستجوی محصول */}
                            <div className="space-y-2">
                                <Label>جستجوی محصول</Label>
                                <div className="relative">
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="نام محصول را جستجو کنید..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            {/* لیست محصولات */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableProducts.map((product) => (
                                    <Card 
                                        key={product.id} 
                                        className={`cursor-pointer transition-all duration-200 ${
                                            selectedProduct === product.id 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedProduct(product.id)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                                                    {product.description && (
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                                        {product.category && (
                                                            <span className="flex items-center gap-1">
                                                                <Tag className="h-3 w-3 text-gray-400" />
                                                                {product.category}
                                                            </span>
                                                        )}
                                                        {product.price && (
                                                            <span className="flex items-center gap-1 font-medium text-green-600">
                                                                <DollarSign className="h-3 w-3" />
                                                                {formatCurrency(product.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedProduct === product.id && (
                                                    <div className="text-emerald-600">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {availableProducts.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>محصولی یافت نشد</p>
                                    </div>
                                )}
                            </div>

                            {/* سطح علاقه‌مندی */}
                            <div className="space-y-2">
                                <Label>سطح علاقه‌مندی</Label>
                                <Select value={interestLevel} onValueChange={setInterestLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">علاقه بالا</SelectItem>
                                        <SelectItem value="medium">علاقه متوسط</SelectItem>
                                        <SelectItem value="low">علاقه پایین</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* یادداشت */}
                            <div className="space-y-2">
                                <Label>یادداشت (اختیاری)</Label>
                                <Textarea
                                    placeholder="یادداشت درباره علاقه‌مندی مشتری..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    dir="rtl"
                                />
                            </div>

                            {/* دکمه‌ها */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsAddDialogOpen(false)}
                                    disabled={loading}
                                >
                                    انصراف
                                </Button>
                                <Button 
                                    onClick={handleAddInterest}
                                    disabled={!selectedProduct || loading}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600"
                                >
                                    {loading ? 'در حال افزودن...' : 'افزودن'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* لیست علاقه‌مندی‌ها */}
            {interests.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {interests.map((interest) => (
                        <Card key={interest.id} className="border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{interest.product_name}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteInterest(interest.id, interest.product_name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        {interest.description && (
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{interest.description}</p>
                                        )}
                                        
                                        <div className="flex items-center gap-4 text-sm mb-2">
                                            {interest.category && (
                                                <span className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3 text-gray-400" />
                                                    {interest.category}
                                                </span>
                                            )}
                                            {interest.price && (
                                                <span className="flex items-center gap-1 font-medium text-green-600">
                                                    <DollarSign className="h-3 w-3" />
                                                    {formatCurrency(interest.price)}
                                                </span>
                                            )}
                                        </div>

                                        <Badge className={`text-xs ${getInterestLevelColor(interest.interest_level)}`}>
                                            {getInterestLevelLabel(interest.interest_level)}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {interest.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-start gap-1">
                                            <FileText className="h-3 w-3 text-gray-400 mt-0.5" />
                                            <p className="text-xs text-gray-600 italic">"{interest.notes}"</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">محصول علاقه‌مندی ثبت نشده</p>
                    <p className="text-sm text-gray-500 mb-4">
                        محصولاتی که این مشتری به آن‌ها علاقه‌مند است اینجا نمایش داده می‌شود
                    </p>
                </div>
            )}
        </div>
    );
}