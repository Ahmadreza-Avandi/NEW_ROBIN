'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    related_id?: string;
    related_type?: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications?type=history&limit=30', {
                headers: {
                    'x-user-id': 'user-001' // This should come from auth context
                }
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data);
            } else {
                toast.error('خطا در دریافت اعلان‌ها');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('خطا در دریافت اعلان‌ها');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications?type=count', {
                headers: {
                    'x-user-id': 'user-001' // This should come from auth context
                }
            });
            const data = await response.json();

            if (data.success) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': 'user-001' // This should come from auth context
                },
                body: JSON.stringify({ notificationId })
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                toast.success('اعلان به عنوان خوانده شده علامت‌گذاری شد');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('خطا در علامت‌گذاری اعلان');
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': 'user-001' // This should come from auth context
                },
                body: JSON.stringify({ action: 'mark_all_read' })
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(prev =>
                    prev.map(notif => ({
                        ...notif,
                        is_read: true,
                        read_at: new Date().toISOString()
                    }))
                );
                setUnreadCount(0);
                toast.success('همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('خطا در علامت‌گذاری همه اعلان‌ها');
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            'task_assigned': '📋',
            'project_assigned': '🚀',
            'sale_created': '💰',
            'report_submitted': '📊',
            'activity_completed': '✅',
            'project_completed': '🎉',
            'message_received': '💬',
            'task_completed': '✅'
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'task_assigned': 'bg-blue-100 text-blue-800',
            'project_assigned': 'bg-purple-100 text-purple-800',
            'sale_created': 'bg-green-100 text-green-800',
            'report_submitted': 'bg-orange-100 text-orange-800',
            'activity_completed': 'bg-emerald-100 text-emerald-800',
            'project_completed': 'bg-pink-100 text-pink-800',
            'message_received': 'bg-cyan-100 text-cyan-800',
            'task_completed': 'bg-emerald-100 text-emerald-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'همین الان';
        if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ساعت پیش`;
        return date.toLocaleDateString('fa-IR');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">در حال بارگذاری اعلان‌ها...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6" dir="rtl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-teal-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">اعلان‌ها</h1>
                        <p className="text-gray-600">تاریخچه 30 اعلان اخیر</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-sm">
                            {unreadCount} خوانده نشده
                        </Badge>
                    )}
                    {unreadCount > 0 && (
                        <Button
                            onClick={markAllAsRead}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            علامت‌گذاری همه
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>هیچ اعلانی وجود ندارد</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-all duration-200 hover:shadow-md ${!notification.is_read ? 'border-r-4 border-r-blue-500 bg-blue-50/30' : ''
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {notification.title}
                                                </h3>
                                                {!notification.is_read && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        جدید
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-gray-700 mb-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDate(notification.created_at)}
                                                </div>

                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getNotificationColor(notification.type)}`}
                                                >
                                                    {notification.type.replace('_', ' ')}
                                                </Badge>

                                                {notification.is_read && notification.read_at && (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <Eye className="h-4 w-4" />
                                                        خوانده شده
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!notification.is_read && (
                                        <Button
                                            onClick={() => markAsRead(notification.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <Check className="h-4 w-4" />
                                            علامت‌گذاری
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}