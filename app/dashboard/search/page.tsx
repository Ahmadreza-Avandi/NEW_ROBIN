'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Users,
    ShoppingCart,
    MessageCircle,
    TrendingUp,
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign
} from 'lucide-react';

interface SearchResult {
    id: string;
    type: 'customer' | 'sale' | 'feedback' | 'deal';
    title: string;
    subtitle?: string;
    description?: string;
    metadata?: any;
    created_at?: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            const data = await response.json();
            if (data.success) {
                setResults(data.results || []);
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در جستجو",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'customer': return <Users className="h-4 w-4" />;
            case 'sale': return <ShoppingCart className="h-4 w-4" />;
            case 'feedback': return <MessageCircle className="h-4 w-4" />;
            case 'deal': return <TrendingUp className="h-4 w-4" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'customer': return 'مشتری';
            case 'sale': return 'فروش';
            case 'feedback': return 'بازخورد';
            case 'deal': return 'معامله';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'customer': return 'bg-blue-100 text-blue-800';
            case 'sale': return 'bg-green-100 text-green-800';
            case 'feedback': return 'bg-yellow-100 text-yellow-800';
            case 'deal': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredResults = activeTab === 'all'
        ? results
        : results.filter(result => result.type === activeTab);

    const getResultCounts = () => {
        const counts = results.reduce((acc, result) => {
            acc[result.type] = (acc[result.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            all: results.length,
            customer: counts.customer || 0,
            sale: counts.sale || 0,
            feedback: counts.feedback || 0,
            deal: counts.deal || 0,
        };
    };

    const counts = getResultCounts();

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-vazir">جستجو</h1>
                <p className="text-muted-foreground font-vazir">
                    جستجو در مشتریان، فروش‌ها، بازخوردها و معاملات
                </p>
            </div>

            {/* Search Form */}
            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="عبارت مورد نظر را وارد کنید..."
                                className="pr-10 font-vazir"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="font-vazir">
                            {loading ? 'در حال جستجو...' : 'جستجو'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results */}
            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-vazir">
                            نتایج جستجو ({results.length} مورد)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5 font-vazir">
                                <TabsTrigger value="all">همه ({counts.all})</TabsTrigger>
                                <TabsTrigger value="customer">مشتریان ({counts.customer})</TabsTrigger>
                                <TabsTrigger value="sale">فروش‌ها ({counts.sale})</TabsTrigger>
                                <TabsTrigger value="feedback">بازخوردها ({counts.feedback})</TabsTrigger>
                                <TabsTrigger value="deal">معاملات ({counts.deal})</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-6">
                                <div className="space-y-4">
                                    {filteredResults.map((result) => (
                                        <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 space-x-reverse flex-1">
                                                        <div className="p-2 rounded-lg bg-muted">
                                                            {getTypeIcon(result.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                                                <h3 className="font-medium font-vazir">{result.title}</h3>
                                                                <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                                                    {getTypeLabel(result.type)}
                                                                </Badge>
                                                            </div>
                                                            {result.subtitle && (
                                                                <p className="text-sm text-muted-foreground font-vazir mb-1">
                                                                    {result.subtitle}
                                                                </p>
                                                            )}
                                                            {result.description && (
                                                                <p className="text-sm text-muted-foreground font-vazir">
                                                                    {result.description}
                                                                </p>
                                                            )}
                                                            {result.metadata && (
                                                                <div className="flex items-center space-x-4 space-x-reverse mt-2 text-xs text-muted-foreground">
                                                                    {result.metadata.phone && (
                                                                        <div className="flex items-center space-x-1 space-x-reverse">
                                                                            <Phone className="h-3 w-3" />
                                                                            <span>{result.metadata.phone}</span>
                                                                        </div>
                                                                    )}
                                                                    {result.metadata.email && (
                                                                        <div className="flex items-center space-x-1 space-x-reverse">
                                                                            <Mail className="h-3 w-3" />
                                                                            <span>{result.metadata.email}</span>
                                                                        </div>
                                                                    )}
                                                                    {result.metadata.amount && (
                                                                        <div className="flex items-center space-x-1 space-x-reverse">
                                                                            <DollarSign className="h-3 w-3" />
                                                                            <span>{result.metadata.amount}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {result.created_at && (
                                                        <div className="text-xs text-muted-foreground font-vazir">
                                                            {new Date(result.created_at).toLocaleDateString('fa-IR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

            {/* No Results */}
            {!loading && searchQuery && results.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium font-vazir mb-2">نتیجه‌ای یافت نشد</h3>
                        <p className="text-muted-foreground font-vazir">
                            برای عبارت "{searchQuery}" نتیجه‌ای پیدا نشد. لطفاً عبارت دیگری امتحان کنید.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!searchQuery && results.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium font-vazir mb-2">جستجو در سیستم</h3>
                        <p className="text-muted-foreground font-vazir">
                            عبارت مورد نظر خود را در کادر بالا وارد کنید تا در تمام بخش‌های سیستم جستجو شود.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-bold font-vazir">جستجو</h1>
                    <p className="text-muted-foreground font-vazir">
                        در حال بارگذاری...
                    </p>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}