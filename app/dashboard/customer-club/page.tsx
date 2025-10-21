'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
// Remove cookies-next import
import {
    Users,
    Mail,
    MessageSquare,
    Search,
    Send,
    UserCheck,
    Filter,
    CheckCircle2,
    AlertCircle,
    FileText,
    Plus,
    Trash2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    customer_name: string;
    customer_id: string;
    role: string;
    department: string;
    is_primary: boolean;
    company?: {
        id: string;
        name: string;
        type: 'individual' | 'company';
        industry?: string;
        size?: string;
        status?: string;
    };
}

interface EmailTemplate {
    name: string;
    subject: string;
    template: string;
    variables: string[];
}

interface EmailData {
    to: string;
    subject: string;
    message: string;
    variables: Record<string, string>;
}

interface BulkEmail {
    to: string;
    subject: string;
    variables: Record<string, string>;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
    // Get token from document.cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    const token = authCookie ? authCookie.split('=')[1] : null;

    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export default function CustomerClubPage() {
    const [activeTab, setActiveTab] = useState('contacts');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Email related states
    const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
    const [selectedTemplate, setSelectedTemplate] = useState('none');
    const [emailData, setEmailData] = useState<EmailData>({
        to: '',
        subject: '',
        message: '',
        variables: {}
    });
    const [bulkEmails, setBulkEmails] = useState<BulkEmail[]>([{ to: '', subject: '', variables: {} }]);
    const [emailResult, setEmailResult] = useState<any>(null);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        loadContacts();
        fetchTemplates();
    }, []);

    const loadContacts = async () => {
        try {
            const response = await fetch('/api/contacts', {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Contacts API response:', data);
                setContacts(data.data || []);
            } else {
                console.error('Contacts API error:', response.status);
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            // Sample data for development
            setContacts([
                {
                    id: 'cont-001',
                    name: 'احمد محمدی',
                    email: 'ahmad@company.com',
                    phone: '09123456789',
                    customer_name: 'شرکت فناوری پیشرو',
                    customer_id: 'cust-001',
                    role: 'مدیر فنی',
                    department: 'فناوری',
                    is_primary: true,
                },
                {
                    id: 'cont-002',
                    name: 'مریم احمدی',
                    email: 'only.link086@gmail.com',
                    phone: '09123456790',
                    customer_name: 'شرکت تجاری آسیا',
                    customer_id: 'cust-002',
                    role: 'مدیر فروش',
                    department: 'فروش',
                    is_primary: true,
                },
                {
                    id: 'cont-003',
                    name: 'علی رضایی',
                    email: 'ahmadrezaavandi@gmail.com',
                    phone: '09123456791',
                    customer_name: 'شرکت صنعتی پارس',
                    customer_id: 'cust-003',
                    role: 'مدیر عامل',
                    department: 'مدیریت',
                    is_primary: true,
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/email/templates', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Add some default templates for demo
            setTemplates({
                'welcome': {
                    name: 'خوش‌آمدگویی',
                    subject: 'به خانواده رابین تجارت خوش آمدید',
                    template: `سلام {name} عزیز،

از اینکه به خانواده بزرگ {company} پیوستید، بسیار خوشحالیم.

ما در رابین تجارت خاورمیانه همواره در تلاش برای ارائه بهترین خدمات هستیم.

با تشکر،
تیم رابین تجارت`,
                    variables: ['name', 'company']
                },
                'newsletter': {
                    name: 'خبرنامه',
                    subject: 'آخرین اخبار و به‌روزرسانی‌ها',
                    template: `سلام {name} عزیز،

امیدواریم حال شما خوب باشد.

در این خبرنامه، آخرین اخبار و به‌روزرسانی‌های شرکت {company} را برای شما آماده کرده‌ایم.

برای اطلاعات بیشتر با ما در تماس باشید: {email}

با احترام،
تیم رابین تجارت خاورمیانه`,
                    variables: ['name', 'company', 'email']
                }
            });
        }
    };

    const handleTemplateSelect = async (templateName: string) => {
        setSelectedTemplate(templateName);
        if (templateName && templateName !== 'none' && templates[templateName]) {
            const template = templates[templateName];
            setEmailData(prev => ({
                ...prev,
                subject: template.subject,
                message: template.template
            }));
        } else if (templateName === 'none') {
            // Clear template data when "none" is selected
            setEmailData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        }
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCustomer = filterCustomer === 'all' || contact.customer_id === filterCustomer;
        const matchesType = filterType === 'all' ||
            (filterType === 'primary' && contact.is_primary) ||
            (filterType === 'secondary' && !contact.is_primary);

        return matchesSearch && matchesCustomer && matchesType;
    });

    const handleContactSelect = (contactId: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(c => c.id));
        }
    };

    const handleSendToSelected = async () => {
        if (selectedContacts.length === 0) {
            toast({
                title: "خطا",
                description: "لطفاً حداقل یک مخاطب انتخاب کنید",
                variant: "destructive"
            });
            return;
        }

        setSending(true);
        setEmailResult(null);

        try {
            const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
            const emails = selectedContactsData.map(contact => ({
                to: contact.email,
                subject: emailData.subject,
                message: emailData.message, // اضافه کردن متن پیام
                variables: {
                    ...emailData.variables,
                    customerName: contact.name,
                    customerEmail: contact.email,
                    companyName: contact.customer_name
                }
            }));

            // ارسال ایمیل‌ها یکی یکی با API Gmail
            const results = [];
            let successCount = 0;
            let failCount = 0;

            for (const email of emails) {
                try {
                    const response = await fetch('/api/Gmail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: email.to,
                            subject: email.subject,
                            html: email.message || emailData.message
                        }),
                    });

                    const result = await response.json();
                    
                    if (result.ok) {
                        successCount++;
                        results.push({ to: email.to, success: true, info: result.info });
                    } else {
                        failCount++;
                        results.push({ to: email.to, success: false, error: result.error });
                    }

                    // تاخیر کوتاه بین ایمیل‌ها
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    failCount++;
                    results.push({ to: email.to, success: false, error: 'خطا در ارسال' });
                }
            }

            const data = {
                success: successCount > 0,
                successCount,
                failCount,
                results,
                error: failCount > 0 ? `${failCount} ایمیل ارسال نشد` : null
            };

            setEmailResult(data);

            if (data.success) {
                toast({
                    title: "موفق",
                    description: `ایمیل به ${data.successCount} مخاطب ارسال شد`,
                });
                setSelectedContacts([]);
            } else {
                toast({
                    title: "خطا",
                    description: data.error || "خطا در ارسال ایمیل",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: "خطا در ارسال ایمیل",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const handleSendSingleEmail = async () => {
        setSending(true);
        setEmailResult(null);

        try {
            const response = await fetch('/api/Gmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.message
                }),
            });

            const data = await response.json();
            setEmailResult(data);

            if (data.ok) {
                toast({
                    title: "موفق",
                    description: "ایمیل با موفقیت ارسال شد",
                });
            } else {
                toast({
                    title: "خطا",
                    description: data.error || "خطا در ارسال ایمیل",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: "خطا در ارسال ایمیل",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const handlePreview = async () => {
        try {
            const response = await fetch('/api/email/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: emailData.message,
                    subject: emailData.subject
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPreviewHtml(data.html);
                setShowPreview(true);
            } else {
                toast({
                    title: "خطا",
                    description: "خطا در تولید پیش‌نمایش",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: "خطا در تولید پیش‌نمایش",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">باشگاه مشتریان و مدیریت ایمیل</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="contacts" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        مخاطبین
                    </TabsTrigger>
                    <TabsTrigger value="send-email" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        ارسال ایمیل
                    </TabsTrigger>
                    <TabsTrigger value="bulk-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        ارسال گروهی
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        قالب‌ها
                    </TabsTrigger>
                </TabsList>

                {/* Contacts Tab */}
                <TabsContent value="contacts">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>مدیریت مخاطبین</span>
                                <Badge variant="secondary">
                                    {selectedContacts.length} انتخاب شده
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filter */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="جستجو در مخاطبین..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pr-10"
                                        />
                                    </div>
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="نوع مخاطب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">همه</SelectItem>
                                        <SelectItem value="primary">اصلی</SelectItem>
                                        <SelectItem value="secondary">فرعی</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select All */}
                            <div className="flex items-center gap-2 mb-4">
                                <Checkbox
                                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-sm">انتخاب همه ({filteredContacts.length} مخاطب)</span>
                                {selectedContacts.length > 0 && (
                                    <Button
                                        onClick={() => setActiveTab('bulk-email')}
                                        size="sm"
                                        className="mr-4"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        ارسال ایمیل به انتخاب شده‌ها
                                    </Button>
                                )}
                            </div>

                            {/* Contacts List */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8">در حال بارگذاری...</div>
                                ) : filteredContacts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        مخاطبی یافت نشد
                                    </div>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <Card key={contact.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        checked={selectedContacts.includes(contact.id)}
                                                        onCheckedChange={() => handleContactSelect(contact.id)}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">{contact.name}</h3>
                                                            {contact.is_primary && (
                                                                <Badge variant="default" className="text-xs">
                                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                                    اصلی
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <Mail className="h-4 w-4 inline mr-1" />
                                                                {contact.email}
                                                            </div>
                                                            <div>
                                                                <MessageSquare className="h-4 w-4 inline mr-1" />
                                                                {contact.phone}
                                                            </div>
                                                            <div className="col-span-2">
                                                                <strong>شرکت:</strong> {contact.customer_name}
                                                            </div>
                                                            <div>
                                                                <strong>نقش:</strong> {contact.role}
                                                            </div>
                                                            <div>
                                                                <strong>بخش:</strong> {contact.department}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Send Single Email Tab */}
                <TabsContent value="send-email">
                    <Card>
                        <CardHeader>
                            <CardTitle>ارسال ایمیل تکی</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    انتخاب قالب (اختیاری)
                                </label>
                                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="بدون قالب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">بدون قالب</SelectItem>
                                        {Object.entries(templates).map(([key, template]) => (
                                            <SelectItem key={key} value={key}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        گیرنده
                                    </label>
                                    <Input
                                        type="email"
                                        value={emailData.to}
                                        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        موضوع
                                    </label>
                                    <Input
                                        type="text"
                                        value={emailData.subject}
                                        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                        placeholder="موضوع ایمیل"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        پیام
                                    </label>
                                    <Textarea
                                        value={emailData.message}
                                        onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                        rows={10}
                                        placeholder="متن ایمیل..."
                                    />
                                </div>

                                {/* Variables for template */}
                                {selectedTemplate && templates[selectedTemplate] && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            متغیرهای قالب
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {templates[selectedTemplate].variables.map((variable) => (
                                                <div key={variable}>
                                                    <label className="block text-xs text-gray-600 mb-1">
                                                        {variable}
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={emailData.variables[variable] || ''}
                                                        onChange={(e) => setEmailData({
                                                            ...emailData,
                                                            variables: {
                                                                ...emailData.variables,
                                                                [variable]: e.target.value
                                                            }
                                                        })}
                                                        placeholder={`مقدار ${variable}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handlePreview}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={!emailData.message || !emailData.subject}
                                    >
                                        پیش‌نمایش
                                    </Button>
                                    <Button
                                        onClick={handleSendSingleEmail}
                                        disabled={sending || !emailData.to || !emailData.subject || !emailData.message}
                                        className="flex-2"
                                    >
                                        {sending ? 'در حال ارسال...' : 'ارسال ایمیل'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Email Tab */}
                <TabsContent value="bulk-email">
                    <Card>
                        <CardHeader>
                            <CardTitle>ارسال گروهی ایمیل</CardTitle>
                            {selectedContacts.length > 0 && (
                                <p className="text-sm text-gray-600">
                                    ارسال به {selectedContacts.length} مخاطب انتخاب شده
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    انتخاب قالب
                                </label>
                                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب قالب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">بدون قالب</SelectItem>
                                        {Object.entries(templates).map(([key, template]) => (
                                            <SelectItem key={key} value={key}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    موضوع
                                </label>
                                <Input
                                    type="text"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                    placeholder="موضوع ایمیل"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    پیام
                                </label>
                                <Textarea
                                    value={emailData.message}
                                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                                    rows={8}
                                    placeholder="متن ایمیل..."
                                />

                            </div>

                            {/* Variables for template */}
                            {selectedTemplate && templates[selectedTemplate] && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        متغیرهای قالب
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {templates[selectedTemplate].variables.map((variable) => (
                                            <div key={variable}>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    {variable}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={emailData.variables[variable] || ''}
                                                    onChange={(e) => setEmailData({
                                                        ...emailData,
                                                        variables: {
                                                            ...emailData.variables,
                                                            [variable]: e.target.value
                                                        }
                                                    })}
                                                    placeholder={`مقدار ${variable}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={handlePreview}
                                            variant="outline"
                                            className="flex-1"
                                            disabled={!emailData.message || !emailData.subject}
                                        >
                                            پیش‌نمایش
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>پیش‌نمایش ایمیل</DialogTitle>
                                        </DialogHeader>
                                        <div className="border rounded-lg overflow-hidden">
                                            <iframe
                                                srcDoc={previewHtml}
                                                className="w-full h-96 border-0"
                                                title="پیش‌نمایش ایمیل"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    onClick={handleSendToSelected}
                                    disabled={sending || selectedContacts.length === 0 || !emailData.subject || !emailData.message}
                                    className="flex-2"
                                >
                                    {sending ? 'در حال ارسال...' : `ارسال به ${selectedContacts.length} مخاطب`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <CardTitle>قالب‌های ایمیل</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(templates).map(([key, template]) => (
                                    <Card key={key}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>موضوع:</strong> {template.subject}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {template.variables.map((variable) => (
                                                    <Badge key={variable} variant="secondary">
                                                        {variable}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                                <pre className="whitespace-pre-wrap font-mono text-xs">
                                                    {template.template.substring(0, 200)}...
                                                </pre>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    handleTemplateSelect(key);
                                                    setActiveTab('send-email');
                                                }}
                                                size="sm"
                                                className="mt-3"
                                            >
                                                استفاده از این قالب
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Result Display */}
            {emailResult && (
                <Card className={emailResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CardContent className="pt-6">
                        <h3 className={`font-semibold ${emailResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {emailResult.success ? '✅ موفق' : '❌ خطا'}
                        </h3>
                        <div className={`mt-2 text-sm ${emailResult.success ? 'text-green-700' : 'text-red-700'}`}>
                            {emailResult.success ? (
                                <div>
                                    {emailResult.messageId && <p>شناسه پیام: {emailResult.messageId}</p>}
                                    {emailResult.totalSent && (
                                        <div>
                                            <p>تعداد کل: {emailResult.totalSent}</p>
                                            <p>موفق: {emailResult.successCount}</p>
                                            <p>ناموفق: {emailResult.failureCount}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>{emailResult.error}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}