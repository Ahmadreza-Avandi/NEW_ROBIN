'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import EnhancedChat from '@/components/chat/enhanced-chat';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const selectedUserId = searchParams?.get('userId');
    const selectedUserName = searchParams?.get('userName');
    const { toast } = useToast();

    // Get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = getAuthToken();

            if (!token) {
                console.log('❌ No auth token found');
                toast({
                    title: "خطا در احراز هویت",
                    description: "لطفاً دوباره وارد شوید",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-Key': tenantKey,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chat auth response:', data);
                if (data.success) {
                    // Check both data.user and data.data for user info
                    const user = data.user || data.data;
                    if (user && user.id) {
                        setCurrentUserId(user.id);
                    } else {
                        console.log('❌ No user ID found:', user);
                        toast({
                            title: "خطا در احراز هویت",
                            description: "اطلاعات کاربر یافت نشد",
                            variant: "destructive"
                        });
                    }
                } else {
                    console.log('❌ Auth failed:', data.message);
                    toast({
                        title: "خطا در احراز هویت",
                        description: "لطفاً دوباره وارد شوید",
                        variant: "destructive"
                    });
                }
            } else {
                console.log('❌ Auth response not ok:', response.status);
                toast({
                    title: "خطا در احراز هویت",
                    description: `وضعیت پاسخ: ${response.status}`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            toast({
                title: "خطا",
                description: "خطا در دریافت اطلاعات کاربر",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="font-vazir text-muted-foreground">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!currentUserId) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <div className="text-center">
                    <p className="font-vazir text-muted-foreground">خطا در احراز هویت</p>
                </div>
            </div>
        );
    }

    return (
        <EnhancedChat
            currentUserId={currentUserId}
            selectedUserId={selectedUserId || undefined}
            selectedUserName={selectedUserName || undefined}
        />
    );
}