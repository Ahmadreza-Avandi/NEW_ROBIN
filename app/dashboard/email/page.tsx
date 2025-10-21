'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Users, FileText, Plus, Trash2 } from 'lucide-react';

interface EmailTemplate {
    name: string;
    subject: string;
    template: string;
    variables: string[];
}

interface EmailData {
    to: string;
    from: string;
    subject: string;
    message: string;
    variables: Record<string, string>;
}

interface BulkEmail {
    to: string;
    subject: string;
    variables: Record<string, string>;
}

export default function EmailPage() {
    const [activeTab, setActiveTab] = useState('send');
    const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [emailData, setEmailData] = useState<EmailData>({
        to: '',
        from: '',
        subject: '',
        message: '',
        variables: {}
    });
    const [bulkEmails, setBulkEmails] = useState<BulkEmail[]>([{ to: '', subject: '', variables: {} }]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Load templates on component mount
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/email/templates');
            const data = await response.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateSelect = async (templateName: string) => {
        setSelectedTemplate(templateName);
        if (templateName && templates[templateName]) {
            const template = templates[templateName];
            setEmailData(prev => ({
                ...prev,
                subject: template.subject,
                message: template.template
            }));
        }
    };

    const handleSendEmail = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    template: emailData.message,
                    variables: emailData.variables,
                    type: selectedTemplate ? 'template' : 'simple'
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendBulkEmails = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/email/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emails: bulkEmails.filter(email => email.to && email.subject),
                    template: selectedTemplate ? templates[selectedTemplate]?.template : null,
                    variables: emailData.variables
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const addBulkEmailRow = () => {
        setBulkEmails([...bulkEmails, { to: '', subject: '', variables: {} }]);
    };

    const updateBulkEmail = (index: number, field: keyof BulkEmail, value: string) => {
        const updated = [...bulkEmails];
        if (field === 'variables') {
            // Handle variables separately if needed
            return;
        }
        (updated[index] as any)[field] = value;
        setBulkEmails(updated);
    };

    const removeBulkEmailRow = (index: number) => {
        setBulkEmails(bulkEmails.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">مدیریت ایمیل</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="send" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        ارسال ایمیل
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        ارسال گروهی
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        قالب‌ها
                    </TabsTrigger>
                </TabsList>

                {/* Send Single Email Tab */}
                <TabsContent value="send">
                    <Card>
                        <CardHeader>
                            <CardTitle>ارسال ایمیل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    انتخاب قالب (اختیاری)
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">بدون قالب</option>
                                    {Object.entries(templates).map(([key, template]) => (
                                        <option key={key} value={key}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Email Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        ایمیل فرستنده
                                    </label>
                                    <Input
                                        type="email"
                                        value={emailData.from}
                                        onChange={(e) => setEmailData({ ...emailData, from: e.target.value })}
                                        placeholder="your-email@gmail.com"
                                    />
                                </div>

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

                                <Button
                                    onClick={handleSendEmail}
                                    disabled={loading || !emailData.to || !emailData.subject}
                                    className="w-full"
                                >
                                    {loading ? 'در حال ارسال...' : 'ارسال ایمیل'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Email Tab */}
                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>ارسال گروهی ایمیل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    انتخاب قالب
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">انتخاب قالب</option>
                                    {Object.entries(templates).map(([key, template]) => (
                                        <option key={key} value={key}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bulk Email List */}
                            <div className="space-y-4">
                                {bulkEmails.map((email, index) => (
                                    <div key={index} className="flex gap-4 items-center p-4 border border-gray-200 rounded-md">
                                        <div className="flex-1">
                                            <Input
                                                type="email"
                                                value={email.to}
                                                onChange={(e) => updateBulkEmail(index, 'to', e.target.value)}
                                                placeholder="ایمیل گیرنده"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                value={email.subject}
                                                onChange={(e) => updateBulkEmail(index, 'subject', e.target.value)}
                                                placeholder="موضوع"
                                            />
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeBulkEmailRow(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={addBulkEmailRow}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    افزودن ردیف
                                </Button>
                                <Button
                                    onClick={handleSendBulkEmails}
                                    disabled={loading || bulkEmails.filter(e => e.to && e.subject).length === 0}
                                    className="flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {loading ? 'در حال ارسال...' : 'ارسال گروهی'}
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Result Display */}
            {result && (
                <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CardContent className="pt-6">
                        <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                            {result.success ? '✅ موفق' : '❌ خطا'}
                        </h3>
                        <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                            {result.success ? (
                                <div>
                                    {result.messageId && <p>شناسه پیام: {result.messageId}</p>}
                                    {result.totalSent && (
                                        <div>
                                            <p>تعداد کل: {result.totalSent}</p>
                                            <p>موفق: {result.successCount}</p>
                                            <p>ناموفق: {result.failureCount}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>{result.error}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}