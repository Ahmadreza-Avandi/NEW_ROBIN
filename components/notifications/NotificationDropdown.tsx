'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import Link from 'next/link';

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

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser?.id) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            if (data.success) {
                setCurrentUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUnreadNotifications();
        }
    }, [isOpen]);

    const fetchUnreadNotifications = async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        try {
            const response = await fetch('/api/notifications?type=unread&limit=10', {
                headers: {
                    'x-user-id': currentUser.id
                }
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!currentUser?.id) return;

        try {
            const response = await fetch('/api/notifications?type=count', {
                headers: {
                    'x-user-id': currentUser.id
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
        if (!currentUser?.id) return;

        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUser.id
                },
                body: JSON.stringify({ notificationId })
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(prev =>
                    prev.filter(notif => notif.id !== notificationId)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('خطا در علامت‌گذاری اعلان');
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser?.id) return;

        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUser.id
                },
                body: JSON.stringify({ action: 'mark_all_read' })
            });

            const data = await response.json();
            if (data.success) {
                setNotifications([]);
                setUnreadCount(0);
                toast.success('همه اعلان‌ها علامت‌گذاری شدند');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('خطا در علامت‌گذاری اعلان‌ها');
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'همین الان';
        if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ساعت پیش`;
        return date.toLocaleDateString('fa-IR');
    };

    const truncateMessage = (message: string, maxLength: number = 60) => {
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 max-h-96"
            >
                <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">اعلان‌ها</h3>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {unreadCount} جدید
                                </Badge>
                                <Button
                                    onClick={markAllAsRead}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                >
                                    علامت‌گذاری همه
                                </Button>
                            </div>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <ScrollArea className="max-h-64">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">اعلان جدیدی ندارید</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="text-lg flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-1">
                                        {truncateMessage(notification.message)}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(notification.created_at)}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                    }}
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard/notifications"
                                className="w-full text-center text-blue-600 hover:text-blue-800 py-2"
                            >
                                <Eye className="h-4 w-4 inline-block ml-1" />
                                مشاهده همه اعلان‌ها
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}