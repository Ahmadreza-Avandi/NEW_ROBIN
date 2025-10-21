'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SimpleCalendarView from '@/components/calendar/SimpleCalendarView';
import moment from 'moment-jalaali';
import {
  Calendar as CalendarIcon,
  Users,
  Phone,
  Clock,
  TrendingUp
} from 'lucide-react';

// Configure moment-jalaali for Persian calendar
moment.loadPersian({
  dialect: 'persian-modern',
  usePersianDigits: true
});
moment.locale('fa');

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  type: 'meeting' | 'call' | 'reminder' | 'task';
  participants?: string[];
  location?: string;
  description?: string;
  color?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  customer_name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Customer {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Utility function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchCustomers();
  }, []);

  const fetchEvents = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // Get events for specified date range or current Persian month
      let fromDate, toDate;
      if (startDate && endDate) {
        fromDate = startDate;
        toDate = endDate;
      } else {
        // Use Persian calendar for current month
        const now = moment();
        const startOfPersianMonth = now.clone().startOf('jMonth');
        const endOfPersianMonth = now.clone().endOf('jMonth');
        fromDate = startOfPersianMonth.locale('en').format('YYYY-MM-DD');
        toDate = endOfPersianMonth.locale('en').format('YYYY-MM-DD');

        console.log('📅 Fetching events for Persian month:', {
          persianMonth: now.format('jMMMM jYYYY'),
          fromDate,
          toDate
        });
      }

      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });

      const response = await fetch(`/api/tenant/events?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Transform API data to component format
        const transformedEvents = data.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.start_date,
          end: event.end_date,
          allDay: event.all_day,
          type: event.type,
          participants: event.participants?.map((p: any) => p.user_id) || [],
          location: event.location,
          description: event.description,
          status: event.status,
          customer_name: event.customer_name
        }));

        // Debug logging
        console.log('📅 Fetched events:', transformedEvents);
        console.log('📅 Events for 16th:', transformedEvents.filter(e => e.start && e.start.includes('2025-01-16')));

        setEvents(transformedEvents);
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در دریافت رویدادها",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (startDate: string, endDate: string) => {
    fetchEvents(startDate, endDate);
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/users', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/customers', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleEventCreate = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      console.log('📅 Client - Creating event with data:', eventData);
      const token = getAuthToken();
      const payload = {
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start,
        end_date: eventData.end,
        all_day: eventData.allDay,
        type: eventData.type,
        location: eventData.location,
        status: eventData.status
      };
      console.log('📅 Client - Sending payload:', payload);

      const response = await fetch('/api/tenant/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📅 Client - Response:', { status: response.status, data });

      if (data.success) {
        fetchEvents(); // Refresh events
      } else {
        console.error('📅 Client - Event creation failed:', data);
        toast({
          title: "خطا",
          description: data.message || "خطا در ایجاد رویداد",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const handleEventUpdate = async (eventData: CalendarEvent) => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tenant/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
        },
        body: JSON.stringify({
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.start,
          end_date: eventData.end,
          all_day: eventData.allDay,
          type: eventData.type,
          location: eventData.location,
          status: eventData.status
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchEvents(); // Refresh events
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در ویرایش رویداد",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tenant/events?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': params?.tenant_key || tenantKey,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchEvents(); // Refresh events
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در حذف رویداد",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  const today = new Date().toDateString();
  const todayEvents = events.filter(event =>
    new Date(event.start).toDateString() === today
  );

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 6); // Saturday
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= thisWeekStart && eventDate <= thisWeekEnd;
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const now = new Date();
    return eventDate > now;
  }).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-vazir mt-4">در حال بارگذاری تقویم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          تقویم رویدادها
        </h1>
        <p className="text-muted-foreground font-vazir mt-2">
          مدیریت جلسات، تماس‌ها و یادآوری‌های شما
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">
              رویدادهای امروز
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground font-vazir">
              {todayEvents.filter(e => e.type === 'meeting').length} جلسه، {todayEvents.filter(e => e.type === 'call').length} تماس
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-secondary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">
              این هفته
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">{thisWeekEvents.length}</div>
            <p className="text-xs text-muted-foreground font-vazir">
              رویداد برنامه‌ریزی شده
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-accent/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">
              جلسات
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">
              {events.filter(e => e.type === 'meeting').length}
            </div>
            <p className="text-xs text-muted-foreground font-vazir">
              کل جلسات ماه
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">
              تماس‌ها
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">
              {events.filter(e => e.type === 'call').length}
            </div>
            <p className="text-xs text-muted-foreground font-vazir">
              کل تماس‌های ماه
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-vazir flex items-center gap-2">
              <Clock className="h-5 w-5" />
              رویدادهای پیش رو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{
                      backgroundColor: event.type === 'meeting' ? '#7c3aed' :
                        event.type === 'call' ? '#2563eb' :
                          event.type === 'reminder' ? '#dc2626' : '#16a34a'
                    }} />
                    <div>
                      <p className="font-medium font-vazir">{event.title}</p>
                      <p className="text-sm text-muted-foreground font-vazir">
                        {moment(event.start).format('jYYYY/jMM/jDD dddd')} - {moment(event.start).format('HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground font-vazir">
                    {event.location && `📍 ${event.location}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Component */}
      <SimpleCalendarView
        events={events}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onMonthChange={handleMonthChange}
        users={users}
        customers={customers}
      />
    </div>
  );
}