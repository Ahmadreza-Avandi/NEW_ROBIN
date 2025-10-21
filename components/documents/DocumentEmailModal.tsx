'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Search,
    Mail,
    FileText,
    X,
    Plus,
    Loader2,
    Send
} from 'lucide-react';
async function sendDocumentByEmail({
    documentId,
    emails,
    subject,
    message,
    includeAttachment = true,
    permissionType = 'view',
    expiresInDays = 30
}: any) {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

    const response = await fetch(`/api/documents/${documentId}/send-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
            emails,
            subject,
            message,
            includeAttachment,
            permissionType,
            expiresInDays
        })
    });

    if (!response.ok) {
        throw new Error('خطا در ارسال ایمیل');
    }

    return response.json();
}

async function getDocumentsForSelection(searchTerm: string = '', category: string = 'all') {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (category && category !== 'all') params.set('category', category);

    const url = '/api/documents' + (params.toString() ? `?${params.toString()}` : '');

    const response = await fetch(url, {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        }
    });

    if (!response.ok) {
        throw new Error('خطا در دریافت اسناد');
    }

    return response.json();
}

async function getDocumentCategories() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

    const response = await fetch('/api/document-categories', {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        }
    });

    if (!response.ok) {
        throw new Error('خطا در دریافت دسته‌بندی‌ها');
    }

    return response.json();
}

interface Document {
    id: string;
    title: string;
    original_filename: string;
    category_name?: string;
    category_color?: string;
    file_size: number;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface DocumentEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedDocuments?: Document[];
    preSelectedEmails?: string[];
}

export default function DocumentEmailModal({
    isOpen,
    onClose,
    preSelectedDocuments = [],
    preSelectedEmails = []
}: DocumentEmailModalProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>(preSelectedDocuments);
    const [emails, setEmails] = useState<string[]>(preSelectedEmails);
    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [includeAttachment, setIncludeAttachment] = useState(true);
    const [emailSubject, setEmailSubject] = useState('');

    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchDocuments();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
        }
    }, [searchTerm, selectedCategory]);

    const fetchDocuments = async () => {
        setDocumentsLoading(true);
        try {
            const docsResult = await getDocumentsForSelection(searchTerm, selectedCategory);
            // Normalize response: it may be an array or an object like { documents: [...] }
            let docsArray = [] as any[];
            if (Array.isArray(docsResult)) {
                docsArray = docsResult;
            } else if (docsResult && Array.isArray((docsResult as any).documents)) {
                docsArray = (docsResult as any).documents;
            } else if (docsResult && Array.isArray((docsResult as any).data)) {
                docsArray = (docsResult as any).data;
            } else {
                // Try to extract any array property
                const arrProp = Object.values(docsResult || {}).find(v => Array.isArray(v));
                if (Array.isArray(arrProp)) docsArray = arrProp as any[];
            }

            setDocuments(docsArray);
        } catch (error) {
            console.error('خطا در دریافت اسناد:', error);
            setDocuments([]);
        } finally {
            setDocumentsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const cats = await getDocumentCategories();
            setCategories(cats);
        } catch (error) {
            console.error('خطا در دریافت دسته‌بندی‌ها:', error);
        }
    };

    const addEmail = () => {
        if (!newEmail.trim()) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast({
                title: "خطا",
                description: "فرمت ایمیل نامعتبر است",
                variant: "destructive"
            });
            return;
        }

        if (emails.includes(newEmail)) {
            toast({
                title: "خطا",
                description: "این ایمیل قبلاً اضافه شده است",
                variant: "destructive"
            });
            return;
        }

        setEmails([...emails, newEmail]);
        setNewEmail('');
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    const toggleDocumentSelection = (document: Document) => {
        const isSelected = selectedDocuments.some(doc => doc.id === document.id);
        if (isSelected) {
            setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== document.id));
        } else {
            setSelectedDocuments([...selectedDocuments, document]);
        }
    };

    const handleSend = async () => {
        if (selectedDocuments.length === 0) {
            toast({
                title: "خطا",
                description: "حداقل یک سند انتخاب کنید",
                variant: "destructive"
            });
            return;
        }

        if (emails.length === 0) {
            toast({
                title: "خطا",
                description: "حداقل یک ایمیل وارد کنید",
                variant: "destructive"
            });
            return;
        }

        setSending(true);
        try {
            let successCount = 0;
            let errorCount = 0;

            for (const document of selectedDocuments) {
                const result = await sendDocumentByEmail({
                    documentId: document.id,
                    emails,
                    subject: emailSubject.trim() || undefined,
                    message: message.trim() || undefined,
                    includeAttachment,
                    permissionType: 'view',
                    expiresInDays: 30
                });

                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error(`خطا در ارسال سند ${document.title}:`, result.error);
                }
            }

            if (successCount > 0 && errorCount === 0) {
                toast({
                    title: "موفق",
                    description: `${successCount} سند با موفقیت ارسال شد`
                });
                onClose();
            } else if (successCount > 0 && errorCount > 0) {
                toast({
                    title: "تکمیل جزئی",
                    description: `${successCount} سند ارسال شد، ${errorCount} سند با خطا مواجه شد`,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "خطا",
                    description: "خطا در ارسال اسناد",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('خطا در ارسال اسناد:', error);
            toast({
                title: "خطا",
                description: "خطا در ارسال اسناد",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleClose = () => {
        setSelectedDocuments([]);
        setEmails([]);
        setNewEmail('');
        setMessage('');
        setSearchTerm('');
        setSelectedCategory('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-vazir">ارسال اسناد از طریق ایمیل</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-6">
                    {/* بخش ایمیل‌ها */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">ایمیل‌های مقصد</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                type="email"
                                placeholder="ایمیل را وارد کنید"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                                className="font-vazir"
                            />
                            <Button onClick={addEmail} size="sm" className="font-vazir">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {emails.map((email, index) => (
                                <Badge key={index} variant="secondary" className="font-vazir">
                                    {email}
                                    <button
                                        onClick={() => removeEmail(email)}
                                        className="mr-1 hover:text-destructive"
                                        title="حذف ایمیل"
                                        aria-label={`حذف ایمیل ${email}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* موضوع ایمیل */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">موضوع ایمیل (اختیاری)</label>
                        <Input
                            type="text"
                            placeholder="موضوع ایمیل را وارد کنید..."
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="font-vazir"
                        />
                    </div>

                    {/* پیام اختیاری */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">پیام (اختیاری)</label>
                        <Textarea
                            placeholder="پیام خود را وارد کنید..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="font-vazir"
                            rows={3}
                        />
                    </div>

                    {/* گزینه ضمیمه کردن فایل */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                            type="checkbox"
                            id="attachFile"
                            checked={includeAttachment}
                            onChange={(e) => setIncludeAttachment(e.target.checked)}
                            className="rounded border-gray-300"
                            title="ضمیمه کردن فایل"
                            aria-label="ضمیمه کردن فایل سند"
                        />
                        <label htmlFor="attachFile" className="text-sm font-medium font-vazir cursor-pointer">
                            فایل سند به ایمیل ضمیمه شود
                        </label>
                    </div>

                    {/* انتخاب اسناد */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium font-vazir">انتخاب اسناد ({selectedDocuments.length})</h3>
                        </div>

                        {/* فیلترها */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="جستجو در اسناد..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 font-vazir"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="font-vazir">
                                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="font-vazir">همه دسته‌بندی‌ها</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()} className="font-vazir">
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* لیست اسناد */}
                        <div className="flex-1 overflow-y-auto border rounded-lg">
                            {documentsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="mr-2 font-vazir">در حال بارگذاری...</span>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground font-vazir">هیچ سندی یافت نشد</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                    {documents.map((document) => {
                                        const isSelected = selectedDocuments.some(doc => doc.id === document.id);
                                        return (
                                            <div
                                                key={document.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                                    }`}
                                                onClick={() => toggleDocumentSelection(document)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleDocumentSelection(document)}
                                                    className="rounded"
                                                    title={`انتخاب ${document.title}`}
                                                    aria-label={`انتخاب ${document.title}`}
                                                />
                                                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium font-vazir truncate">{document.title}</h4>
                                                    <p className="text-sm text-muted-foreground font-vazir truncate">
                                                        {document.original_filename}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {document.category_name && (
                                                            <Badge
                                                                variant="outline"
                                                                style={{
                                                                    backgroundColor: document.category_color + '20',
                                                                    borderColor: document.category_color,
                                                                    color: document.category_color
                                                                }}
                                                                className="font-vazir text-xs"
                                                            >
                                                                {document.category_name}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground font-vazir">
                                                            {formatFileSize(document.file_size)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose} className="font-vazir">
                        انصراف
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || selectedDocuments.length === 0 || emails.length === 0}
                        className="font-vazir"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                در حال ارسال...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 ml-2" />
                                ارسال ({selectedDocuments.length} سند)
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}