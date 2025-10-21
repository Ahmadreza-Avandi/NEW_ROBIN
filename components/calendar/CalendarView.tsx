'use client';

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import moment from 'moment-jalaali';
import {
    Plus, Calendar as CalendarIcon, Users, Phone,
    Trash2, Bell, CheckCircle
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
    reminders?: Array<{
        method: 'popup' | 'email';
        minutes: number;
    }>;
}

interface CalendarViewProps {
    events: CalendarEvent[];
    onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
    onEventUpdate?: (event: CalendarEvent) => void;
    onEventDelete?: (eventId: string) => void;
    users?: Array<{ id: string; name: string; email: string }>;
    customers?: Array<{ id: string; name: string }>;
}

export default function CalendarView({
    events,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    users = [],
    customers = []
}: CalendarViewProps) {
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [isMobile, setIsMobile] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);
    const { toast } = useToast();

    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
        type: 'meeting' as CalendarEvent['type'],
        participants: [] as string[],
        location: '',
        status: 'confirmed' as CalendarEvent['status'],
        reminders: [{ method: 'popup' as const, minutes: 15 }]
    });

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setCurrentView('listWeek');
            } else {
                setCurrentView('dayGridMonth');
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const resetForm = () => {
        setEventForm({
            title: '',
            description: '',
            start: '',
            end: '',
            allDay: false,
            type: 'meeting',
            participants: [],
            location: '',
            status: 'confirmed',
            reminders: [{ method: 'popup' as const, minutes: 15 }]
        });
    };

    const handleDateSelect = (selectInfo: any) => {
        resetForm();
        setEventForm(prev => ({
            ...prev,
            start: selectInfo.start.toISOString(),
            end: selectInfo.end.toISOString(),
            allDay: selectInfo.allDay
        }));
        setSelectedEvent(null);
        setIsEditing(false);
        setShowEventDialog(true);
    };

    const handleEventClick = (clickInfo: any) => {
        const event = events.find(e => e.id === clickInfo.event.id);
        if (event) {
            setSelectedEvent(event);
            setEventForm({
                title: event.title,
                description: event.description || '',
                start: event.start,
                end: event.end || '',
                allDay: event.allDay || false,
                type: event.type,
                participants: event.participants || [],
                location: event.location || '',
                status: event.status,
                reminders: event.reminders || [{ method: 'popup' as const, minutes: 15 }]
            });
            setIsEditing(true);
            setShowEventDialog(true);
        }
    };

    const handleEventDrop = (dropInfo: any) => {
        const event = events.find(e => e.id === dropInfo.event.id);
        if (event && onEventUpdate) {
            const updatedEvent = {
                ...event,
                start: dropInfo.event.start.toISOString(),
                end: dropInfo.event.end?.toISOString() || event.end
            };
            onEventUpdate(updatedEvent);
            toast({
                title: "موفق",
                description: "رویداد جابجا شد"
            });
        }
    };

    const handleEventResize = (resizeInfo: any) => {
        const event = events.find(e => e.id === resizeInfo.event.id);
        if (event && onEventUpdate) {
            const updatedEvent = {
                ...event,
                start: resizeInfo.event.start.toISOString(),
                end: resizeInfo.event.end?.toISOString() || event.end
            };
            onEventUpdate(updatedEvent);
            toast({
                title: "موفق",
                description: "مدت رویداد تغییر کرد"
            });
        }
    };

    const handleSaveEvent = () => {
        if (!eventForm.title || !eventForm.start) {
            toast({
                title: "خطا",
                description: "عنوان و زمان شروع الزامی است",
                variant: "destructive"
            });
            return;
        }

        const eventData = {
            title: eventForm.title,
            description: eventForm.description,
            start: eventForm.start,
            end: eventForm.end,
            allDay: eventForm.allDay,
            type: eventForm.type,
            participants: eventForm.participants,
            location: eventForm.location,
            status: eventForm.status,
            color: getEventTypeColor(eventForm.type),
            reminders: eventForm.reminders
        };

        if (isEditing && selectedEvent) {
            onEventUpdate?.({ ...selectedEvent, ...eventData });
            toast({
                title: "موفق",
                description: "رویداد ویرایش شد"
            });
        } else {
            onEventCreate?.(eventData);
            toast({
                title: "موفق",
                description: "رویداد جدید ایجاد شد"
            });
        }

        setShowEventDialog(false);
        resetForm();
    };

    const handleDeleteEvent = () => {
        if (selectedEvent && onEventDelete) {
            onEventDelete(selectedEvent.id);
            toast({
                title: "موفق",
                description: "رویداد حذف شد"
            });
            setShowEventDialog(false);
        }
    };

    const getEventTypeColor = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'meeting': return '#7c3aed'; // بنفش
            case 'call': return '#2563eb'; // آبی
            case 'reminder': return '#dc2626'; // قرمز
            case 'task': return '#16a34a'; // سبز
            default: return '#6b7280'; // خاکستری
        }
    };

    const getEventTypeLabel = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'meeting': return 'جلسه';
            case 'call': return 'تماس';
            case 'reminder': return 'یادآوری';
            case 'task': return 'وظیفه';
            default: return 'رویداد';
        }
    };

    const getEventTypeIcon = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'meeting': return <Users className="h-4 w-4" />;
            case 'call': return <Phone className="h-4 w-4" />;
            case 'reminder': return <Bell className="h-4 w-4" />;
            case 'task': return <CheckCircle className="h-4 w-4" />;
            default: return <CalendarIcon className="h-4 w-4" />;
        }
    };

    const formatEventForFullCalendar = (event: CalendarEvent) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        backgroundColor: event.color || getEventTypeColor(event.type),
        borderColor: event.color || getEventTypeColor(event.type),
        textColor: '#ffffff',
        extendedProps: {
            type: event.type,
            description: event.description,
            participants: event.participants,
            location: event.location,
            status: event.status
        }
    });

    const calendarEvents = events.map(formatEventForFullCalendar);

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-vazir">تقویم رویدادها</h2>
                    <p className="text-muted-foreground font-vazir">
                        مدیریت جلسات، تماس‌ها و یادآوری‌های شما
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => calendarRef.current?.getApi().today()}
                        className="font-vazir"
                    >
                        امروز
                    </Button>
                    <Button
                        onClick={() => {
                            resetForm();
                            setSelectedEvent(null);
                            setIsEditing(false);
                            setShowEventDialog(true);
                        }}
                        className="font-vazir"
                    >
                        <Plus className="h-4 w-4 ml-2" />
                        رویداد جدید
                    </Button>
                </div>
            </div>

            {/* Calendar */}
            <Card>
                <CardContent className="p-0">
                    <div dir="rtl" className="calendar-container">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView={currentView}
                            headerToolbar={{
                                left: 'prev,next',
                                center: 'title',
                                right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,listWeek'
                            }}
                            locale="fa"
                            direction="rtl"
                            firstDay={6} // شنبه شروع هفته
                            isRTL={true}
                            titleFormat={{ year: 'numeric', month: 'long' }}
                            dayHeaderFormat={{ weekday: 'short' }}
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={3}
                            weekends={true}
                            events={calendarEvents}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            height="auto"
                            dayHeaderFormat={{ weekday: 'short' }}
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }}
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }}
                            buttonText={{
                                today: 'امروز',
                                month: 'ماه',
                                week: 'هفته',
                                day: 'روز',
                                list: 'لیست',
                                prev: 'قبلی',
                                next: 'بعدی'
                            }}
                            dayNames={['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']}
                            dayNamesShort={['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']}
                            monthNames={['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']}
                            monthNamesShort={['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف']}
                            moreLinkText={(num) => `+ ${num} بیشتر`}
                            noEventsText="رویدادی وجود ندارد"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-vazir">
                            {isEditing ? 'ویرایش رویداد' : 'رویداد جدید'}
                        </DialogTitle>
                        <DialogDescription className="font-vazir">
                            {isEditing ? 'اطلاعات رویداد را ویرایش کنید' : 'اطلاعات رویداد جدید را وارد کنید'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-vazir">عنوان *</Label>
                                <Input
                                    placeholder="عنوان رویداد"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    className="font-vazir"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-vazir">نوع</Label>
                                <Select
                                    value={eventForm.type}
                                    onValueChange={(value: CalendarEvent['type']) =>
                                        setEventForm({ ...eventForm, type: value })
                                    }
                                >
                                    <SelectTrigger className="font-vazir">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meeting" className="font-vazir">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                جلسه
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="call" className="font-vazir">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                تماس
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="reminder" className="font-vazir">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4" />
                                                یادآوری
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="task" className="font-vazir">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                وظیفه
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-vazir">توضیحات</Label>
                            <Textarea
                                placeholder="توضیحات رویداد"
                                value={eventForm.description}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                className="font-vazir"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-vazir">تاریخ شروع *</Label>
                                <PersianDatePicker
                                    value={eventForm.start ? moment(eventForm.start).format('jYYYY/jMM/jDD') : ''}
                                    onChange={(date) => {
                                        if (date) {
                                            // Convert Persian date to Gregorian
                                            const gregorianDate = moment(date, 'jYYYY/jMM/jDD').toDate();
                                            setEventForm({
                                                ...eventForm,
                                                start: gregorianDate.toISOString()
                                            });
                                        }
                                    }}
                                    placeholder="انتخاب تاریخ شروع"
                                    className="font-vazir"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-vazir">زمان شروع</Label>
                                <Input
                                    type="time"
                                    value={eventForm.start ? moment(eventForm.start).format('HH:mm') : ''}
                                    onChange={(e) => {
                                        if (eventForm.start && e.target.value) {
                                            const date = new Date(eventForm.start);
                                            const [hours, minutes] = e.target.value.split(':');
                                            date.setHours(parseInt(hours), parseInt(minutes));
                                            setEventForm({
                                                ...eventForm,
                                                start: date.toISOString()
                                            });
                                        }
                                    }}
                                    className="font-vazir"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-vazir">تاریخ پایان</Label>
                                <PersianDatePicker
                                    value={eventForm.end ? moment(eventForm.end).format('jYYYY/jMM/jDD') : ''}
                                    onChange={(date) => {
                                        if (date) {
                                            // Convert Persian date to Gregorian
                                            const gregorianDate = moment(date, 'jYYYY/jMM/jDD').toDate();
                                            setEventForm({
                                                ...eventForm,
                                                end: gregorianDate.toISOString()
                                            });
                                        }
                                    }}
                                    placeholder="انتخاب تاریخ پایان"
                                    className="font-vazir"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-vazir">زمان پایان</Label>
                                <Input
                                    type="time"
                                    value={eventForm.end ? moment(eventForm.end).format('HH:mm') : ''}
                                    onChange={(e) => {
                                        if (eventForm.end && e.target.value) {
                                            const date = new Date(eventForm.end);
                                            const [hours, minutes] = e.target.value.split(':');
                                            date.setHours(parseInt(hours), parseInt(minutes));
                                            setEventForm({
                                                ...eventForm,
                                                end: date.toISOString()
                                            });
                                        }
                                    }}
                                    className="font-vazir"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-vazir">مکان</Label>
                            <Input
                                placeholder="مکان برگزاری"
                                value={eventForm.location}
                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                className="font-vazir"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-vazir">وضعیت</Label>
                            <Select
                                value={eventForm.status}
                                onValueChange={(value: CalendarEvent['status']) =>
                                    setEventForm({ ...eventForm, status: value })
                                }
                            >
                                <SelectTrigger className="font-vazir">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="confirmed" className="font-vazir">تایید شده</SelectItem>
                                    <SelectItem value="tentative" className="font-vazir">موقت</SelectItem>
                                    <SelectItem value="cancelled" className="font-vazir">لغو شده</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-2 space-x-reverse">
                            {isEditing && (
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteEvent}
                                    className="font-vazir"
                                >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowEventDialog(false)}
                                className="font-vazir"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={handleSaveEvent}
                                className="font-vazir"
                            >
                                {isEditing ? 'ویرایش' : 'ایجاد'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
        .calendar-container .fc {
          font-family: 'Vazir', sans-serif;
        }
        
        .calendar-container .fc-toolbar-title {
          font-family: 'Vazir', sans-serif;
          font-weight: bold;
        }
        
        .calendar-container .fc-button {
          font-family: 'Vazir', sans-serif;
        }
        
        .calendar-container .fc-daygrid-day-number {
          font-family: 'Vazir', sans-serif;
        }
        
        .calendar-container .fc-col-header-cell {
          font-family: 'Vazir', sans-serif;
        }
        
        .calendar-container .fc-event {
          font-family: 'Vazir', sans-serif;
          border-radius: 4px;
          border: none;
          padding: 2px 4px;
        }
        
        .calendar-container .fc-event-title {
          font-weight: 500;
        }
        
        .calendar-container .fc-more-link {
          font-family: 'Vazir', sans-serif;
          color: #6366f1;
        }
        
        .calendar-container .fc-list-event-title {
          font-family: 'Vazir', sans-serif;
        }
        
        .calendar-container .fc-list-event-time {
          font-family: 'Vazir', sans-serif;
        }
      `}</style>
        </div>
    );
}