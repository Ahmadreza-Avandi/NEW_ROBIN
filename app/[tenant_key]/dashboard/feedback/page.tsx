'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MessageCircle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    FileDown,
    Plus,
    Send,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import moment from 'moment-jalaali';

// Configure moment-jalaali for Persian calendar
moment.loadPersian({
    dialect: 'persian-modern',
    usePersianDigits: true
});
moment.locale('fa');

const statusMap = {
    pending: { label: 'در انتظار بررسی', color: 'bg-yellow-500' },
    inProgress: { label: 'در حال بررسی', color: 'bg-blue-500' },
    completed: { label: 'تکمیل شده', color: 'bg-green-500' },
    canceled: { label: 'لغو شده', color: 'bg-red-500' },
};

const typeMap = {
    complaint: { label: 'شکایت', color: 'bg-red-100 text-red-800' },
    suggestion: { label: 'پیشنهاد', color: 'bg-blue-100 text-blue-800' },
    praise: { label: 'تعریف و تمجید', color: 'bg-green-100 text-green-800' },
    csat: { label: 'رضایت مشتری', color: 'bg-purple-100 text-purple-800' },
    nps: { label: 'NPS', color: 'bg-orange-100 text-orange-800' },
    ces: { label: 'CES', color: 'bg-teal-100 text-teal-800' },
};

const priorityMap = {
    low: { label: 'کم', color: 'bg-green-500' },
    medium: { label: 'متوسط', color: 'bg-yellow-500' },
    high: { label: 'زیاد', color: 'bg-red-500' },
};

export default function FeedbackListPage() {
    const router = useRouter();
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State for feedback data
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for feedback forms
    const [feedbackForms, setFeedbackForms] = useState<any[]>([]);
    const [selectedForm, setSelectedForm] = useState<string>('');

    // State for contacts
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [sendingFeedback, setSendingFeedback] = useState(false);

    // Dialog state
    const [sendDialogOpen, setSendDialogOpen] = useState(false);

    // Handle delete feedback
    const handleDeleteFeedback = async (feedbackId: string) => {
        if (!confirm('آیا از حذف این بازخورد اطمینان دارید؟')) return;

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/tenant/feedback?id=${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفق",
                    description: "بازخورد با موفقیت حذف شد",
                });
                // Refresh feedback list
                const fetchFeedbacks = async () => {
                    try {
                        const response = await fetch('/api/tenant/feedback', {
                            headers: {
                                'Authorization': token ? `Bearer ${token}` : '',
                                'X-Tenant-Key': params?.tenant_key || tenantKey,
                            },
                        });
                        const data = await response.json();

                        if (data.success) {
                            setFeedbacks(data.data);
                        }
                    } catch (error) {
                        console.error('Error fetching feedback:', error);
                    }
                };
                fetchFeedbacks();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در حذف بازخورد",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast({
                title: "خطا",
                description: "خطا در حذف بازخورد",
                variant: "destructive",
            });
        }
    };

    // Fetch feedback data
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('auth-token='))
                    ?.split('=')[1];

                const params = new URLSearchParams();
                if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);
                if (selectedType && selectedType !== 'all') params.append('type', selectedType);
                if (dateFrom) params.append('dateFrom', moment(dateFrom, 'jYYYY/jMM/jDD').format('YYYY-MM-DD'));
                if (dateTo) params.append('dateTo', moment(dateTo, 'jYYYY/jMM/jDD').format('YYYY-MM-DD'));

                const response = await fetch(`/api/tenant/feedback?${params.toString()}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Tenant-Key': params?.tenant_key || tenantKey,
                    },
                });
                const data = await response.json();

                if (data.success) {
                    setFeedbacks(data.data);
                } else {
                    setError('خطا در دریافت بازخوردها');
                }
            } catch (error) {
                console.error('Error fetching feedback:', error);
                setError('خطا در ارتباط با سرور');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [selectedStatus, selectedType, dateFrom, dateTo]);

    // Fetch feedback forms
    useEffect(() => {
        const fetchFeedbackForms = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('auth-token='))
                    ?.split('=')[1];

                const response = await fetch('/api/tenant/feedback/forms', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Tenant-Key': params?.tenant_key || tenantKey,
                    },
                });
                const data = await response.json();

                if (data.success) {
                    console.log('Loaded feedback forms:', data.data);
                    setFeedbackForms(data.data);
                    if (data.data.length > 0) {
                        setSelectedForm(data.data[0].id);
                    } else {
                        console.warn('No feedback forms found in the database');
                    }
                } else {
                    console.error('Failed to load feedback forms:', data.message);
                }
            } catch (error) {
                console.error('Error fetching feedback forms:', error);
            }
        };

        fetchFeedbackForms();
    }, []);

    // Fetch contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('auth-token='))
                    ?.split('=')[1];

                const response = await fetch('/api/tenant/contacts', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'X-Tenant-Key': params?.tenant_key || tenantKey,
                    },
                });
                const data = await response.json();

                if (data.success) {
                    console.log('Loaded contacts:', data.data);
                    setContacts(data.data);
                    if (data.data.length === 0) {
                        console.warn('No contacts found in the database');
                    }
                } else {
                    console.error('Failed to load contacts:', data.message);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    // Handle sending feedback forms
    const handleSendFeedbackForms = async () => {
        if (!selectedForm || selectedContacts.length === 0) {
            toast({
                title: "خطا",
                description: "لطفا فرم و حداقل یک مخاطب را انتخاب کنید",
                variant: "destructive",
            });
            return;
        }

        setSendingFeedback(true);

        try {
            const results = [];

            for (const contactId of selectedContacts) {
                const contact = contacts.find(c => c.id === contactId);

                if (contact) {
                    const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('auth-token='))
                        ?.split('=')[1];

                    const response = await fetch('/api/tenant/feedback/forms/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : '',
                            'X-Tenant-Key': params?.tenant_key || tenantKey,
                        },
                        body: JSON.stringify({
                            formId: selectedForm,
                            customerId: contact.id,
                            customerEmail: contact.email,
                            customerName: contact.name,
                        }),
                    });

                    const result = await response.json();
                    results.push(result);
                }
            }

            const successCount = results.filter(r => r.success).length;

            toast({
                title: "ارسال فرم بازخورد",
                description: `فرم بازخورد برای ${successCount} مخاطب از ${selectedContacts.length} مخاطب با موفقیت ارسال شد`,
                variant: successCount === selectedContacts.length ? "default" : "destructive",
            });

            setSendDialogOpen(false);
            setSelectedContacts([]);
        } catch (error) {
            console.error('Error sending feedback forms:', error);
            toast({
                title: "خطا",
                description: "خطا در ارسال فرم بازخورد",
                variant: "destructive",
            });
        } finally {
            setSendingFeedback(false);
        }
    };

    // Toggle contact selection
    const toggleContactSelection = (contactId: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    // Select/deselect all contacts
    const toggleSelectAll = () => {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map(contact => contact.id));
        }
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (!feedback) return false;

        const matchesSearch =
            (feedback.customer_name || '').includes(searchTerm) ||
            (feedback.title || '').includes(searchTerm) ||
            (feedback.comment || '').includes(searchTerm);

        const matchesStatus = !selectedStatus || selectedStatus === 'all' || feedback.status === selectedStatus;
        const matchesType = !selectedType || selectedType === 'all' || feedback.type === selectedType;
        const matchesPriority = !selectedPriority || selectedPriority === 'all' || feedback.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });

    const pageCount = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    const paginatedFeedbacks = filteredFeedbacks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">لیست بازخوردها</h1>
                    <p className="text-muted-forenpm run setup-feedbackground">مدیریت و پیگیری بازخوردهای دریافتی</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                <Send className="ml-2 h-4 w-4" />
                                ارسال فرم بازخورد
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>ارسال فرم بازخورد</DialogTitle>
                                <DialogDescription>
                                    فرم بازخورد را انتخاب کرده و برای مخاطبین مورد نظر ارسال کنید.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">انتخاب فرم بازخورد</label>
                                    {loading ? (
                                        <div className="flex items-center justify-center p-4 border rounded-md">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                                            <span>در حال بارگذاری فرم‌ها...</span>
                                        </div>
                                    ) : feedbackForms.length === 0 ? (
                                        <div className="p-4 border rounded-md text-center">
                                            <p className="text-red-500 mb-2">هیچ فرم بازخوردی یافت نشد.</p>
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        const token = document.cookie
                                                            .split('; ')
                                                            .find(row => row.startsWith('auth-token='))
                                                            ?.split('=')[1];

                                                        setLoading(true);
                                                        const response = await fetch('/api/tenant/feedback/forms/setup', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': token ? `Bearer ${token}` : '',
                                                                'X-Tenant-Key': params?.tenant_key || tenantKey,
                                                            },
                                                        });

                                                        const result = await response.json();

                                                        if (result.success) {
                                                            toast({
                                                                title: "موفق",
                                                                description: "فرم‌های بازخورد با موفقیت ایجاد شدند",
                                                            });

                                                            // Reload feedback forms
                                                            const formsResponse = await fetch('/api/tenant/feedback/forms', {
                                                                headers: {
                                                                    'Authorization': token ? `Bearer ${token}` : '',
                                                                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                                                                },
                                                            });

                                                            const formsData = await formsResponse.json();

                                                            if (formsData.success) {
                                                                setFeedbackForms(formsData.data);
                                                                if (formsData.data.length > 0) {
                                                                    setSelectedForm(formsData.data[0].id);
                                                                }
                                                            }
                                                        } else {
                                                            toast({
                                                                title: "خطا",
                                                                description: result.message || "خطا در ایجاد فرم‌های بازخورد",
                                                                variant: "destructive",
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error('Error creating feedback forms:', error);
                                                        toast({
                                                            title: "خطا",
                                                            description: "خطا در ارتباط با سرور",
                                                            variant: "destructive",
                                                        });
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 mt-2"
                                            >
                                                ایجاد فرم‌های بازخورد پیش‌فرض
                                            </Button>
                                        </div>
                                    ) : (
                                        <Select value={selectedForm} onValueChange={setSelectedForm}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="انتخاب فرم بازخورد" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feedbackForms.map(form => (
                                                    <SelectItem key={form.id} value={form.id}>
                                                        {form.title} ({form.type === 'sales' ? 'فروش' : 'محصول'})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium">انتخاب مخاطبین</label>
                                        {contacts.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                                className="h-8 px-2 text-xs"
                                            >
                                                {selectedContacts.length === contacts.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="border rounded-md h-64 overflow-y-auto">
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                                                <span>در حال بارگذاری مخاطبین...</span>
                                            </div>
                                        ) : contacts.length === 0 ? (
                                            <div className="flex items-center justify-center h-full text-center p-4 text-muted-foreground">
                                                <div>
                                                    <p className="mb-2 text-red-500">هیچ مخاطبی یافت نشد</p>
                                                    <p className="text-sm">لطفاً ابتدا مخاطبین را در سیستم ثبت کنید</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12"></TableHead>
                                                        <TableHead>نام</TableHead>
                                                        <TableHead>ایمیل</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {contacts.map(contact => (
                                                        <TableRow key={contact.id}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedContacts.includes(contact.id)}
                                                                    onCheckedChange={() => toggleContactSelection(contact.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{contact.name}</TableCell>
                                                            <TableCell>{contact.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        {selectedContacts.length} مخاطب انتخاب شده
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                    با کلیک بر روی دکمه «ارسال فرم»، فرم بازخورد انتخاب شده برای مخاطبین انتخاب شده از طریق ایمیل ارسال خواهد شد.
                                </p>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSendDialogOpen(false)}
                                        disabled={sendingFeedback}
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        onClick={handleSendFeedbackForms}
                                        disabled={sendingFeedback || selectedContacts.length === 0 || !selectedForm}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {sendingFeedback ? (
                                            <>
                                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                                در حال ارسال...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="ml-2 h-4 w-4" />
                                                ارسال فرم
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={() => router.push('/dashboard/feedback/new')}>
                        <Plus className="ml-2 h-4 w-4" />
                        بازخورد جدید
                    </Button>
                    <Button variant="outline">
                        <FileDown className="ml-2 h-4 w-4" />
                        خروجی اکسل
                    </Button>
                </div>
            </div>

            {/* فیلترها */}
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <Input
                            placeholder="جستجو..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه</SelectItem>
                            {Object.entries(statusMap).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                            <SelectValue placeholder="نوع بازخورد" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه</SelectItem>
                            {Object.entries(typeMap).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger>
                            <SelectValue placeholder="اولویت" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">همه</SelectItem>
                            {Object.entries(priorityMap).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div>
                        <PersianDatePicker
                            value={dateFrom}
                            onChange={(date) => setDateFrom(date)}
                            placeholder="از تاریخ"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <PersianDatePicker
                            value={dateTo}
                            onChange={(date) => setDateTo(date)}
                            placeholder="تا تاریخ"
                            className="w-full"
                        />
                    </div>
                </div>
            </Card>

            {/* لیست بازخوردها */}
            <div className="space-y-4">
                {paginatedFeedbacks.map(feedback => (
                    <Card key={feedback.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-medium">{feedback.title || 'بازخورد'}</h3>
                                    <Badge variant="outline" className={typeMap[feedback.type]?.color || 'bg-gray-100 text-gray-800'}>
                                        {typeMap[feedback.type]?.label || feedback.type}
                                    </Badge>
                                    {feedback.priority && (
                                        <div className={`w-2 h-2 rounded-full ${priorityMap[feedback.priority]?.color || 'bg-gray-500'}`} />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {feedback.customerName} {feedback.product && `- ${feedback.product}`}
                                </p>
                                <p className="text-sm">{feedback.description || feedback.comment}</p>
                                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                    <span>{feedback.createdAt}</span>
                                    {feedback.channel && <span>از طریق: {feedback.channel}</span>}
                                    <div className="flex items-center">
                                        <span>امتیاز: </span>
                                        <div className="flex items-center gap-0.5 mr-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${i < feedback.score ? 'bg-yellow-400' : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="mr-1">({feedback.score}/5)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {feedback.status && (
                                    <Badge variant="outline" className={`${statusMap[feedback.status]?.color || 'bg-gray-500'} bg-opacity-10`}>
                                        {statusMap[feedback.status]?.label || feedback.status}
                                    </Badge>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <MessageCircle className="h-4 w-4 ml-1" />
                                    پاسخ
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* پجینیشن */}
            {pageCount > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm mx-4">
                        صفحه {currentPage} از {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
