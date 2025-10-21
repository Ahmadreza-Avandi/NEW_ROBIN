'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Phone,
    Bell,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

interface NextEvent {
    id: string;
    title: string;
    start_date: string;
    end_date?: string;
    type: 'meeting' | 'call' | 'reminder' | 'task';
    location?: string;
    customer_name?: string;
}

export default function NextEventCard() {
    const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
    const [timeUntil, setTimeUntil] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Utility function to get auth token
    const getAuthToken = () => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
    };

    useEffect(() => {
        fetchNextEvent();
    }, []);

    useEffect(() => {
        if (nextEvent) {
            const interval = setInterval(() => {
                updateTimeUntil();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [nextEvent]);

    const fetchNextEvent = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            // Get events from today onwards
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const params = new URLSearchParams({
                from: today,
                to: nextMonth.toISOString().split('T')[0]
            });

            const response = await fetch(`/api/events?${params.toString()}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success && data.data.length > 0) {
                // Find the next upcoming event
                const now = new Date();
                const upcomingEvents = data.data
                    .filter((event: any) => new Date(event.start_date) > now)
                    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

                if (upcomingEvents.length > 0) {
                    setNextEvent(upcomingEvents[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching next event:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTimeUntil = () => {
        if (!nextEvent) return;

        const now = new Date();
        const eventTime = new Date(nextEvent.start_date);
        const diff = eventTime.getTime() - now.getTime();

        if (diff <= 0) {
            setTimeUntil('در حال برگزاری');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            setTimeUntil(`${days} روز و ${hours} ساعت`);
        } else if (hours > 0) {
            setTimeUntil(`${hours} ساعت و ${minutes} دقیقه`);
        } else {
            setTimeUntil(`${minutes} دقیقه`);
        }
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <Users className="h-4 w-4" />;
            case 'call': return <Phone className="h-4 w-4" />;
            case 'reminder': return <Bell className="h-4 w-4" />;
            case 'task': return <CheckCircle className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'meeting': return 'جلسه';
            case 'call': return 'تماس';
            case 'reminder': return 'یادآوری';
            case 'task': return 'وظیفه';
            default: return 'رویداد';
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
            case 'call': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
            case 'reminder': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
            case 'task': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="font-vazir text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        رویداد بعدی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!nextEvent) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="font-vazir text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        رویداد بعدی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground font-vazir text-sm">
                        رویداد آینده‌ای برنامه‌ریزی نشده است
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/calendar')}
                        className="mt-3 font-vazir"
                    >
                        مشاهده تقویم
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardHeader>
                <CardTitle className="font-vazir text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        رویداد بعدی
                    </div>
                    <Badge variant="outline" className={getEventTypeColor(nextEvent.type)}>
                        {getEventTypeLabel(nextEvent.type)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <h3 className="font-medium font-vazir text-base mb-1">{nextEvent.title}</h3>
                    {nextEvent.customer_name && (
                        <p className="text-sm text-muted-foreground font-vazir">
                            با {nextEvent.customer_name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-vazir">
                            {new Date(nextEvent.start_date).toLocaleDateString('fa-IR')} - {' '}
                            {new Date(nextEvent.start_date).toLocaleTimeString('fa-IR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    {nextEvent.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-vazir">{nextEvent.location}</span>
                        </div>
                    )}

                    {timeUntil && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 text-primary">
                                {getEventTypeIcon(nextEvent.type)}
                                <span className="font-vazir font-medium">{timeUntil}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/calendar')}
                        className="font-vazir flex-1"
                    >
                        مشاهده تقویم
                        <ArrowRight className="h-4 w-4 mr-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}