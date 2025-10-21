'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Mail,
    Send,
    Plus,
    X,
    Loader2,
    Paperclip,
    Users,
    MessageSquare,
    FileText
} from 'lucide-react';

interface Document {
    id: string;
    title: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
}

interface EmailDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
}

export default function EmailDocumentModal({ isOpen, onClose, document }: EmailDocumentModalProps) {
    const [emails, setEmails] = useState<string[]>(['']);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [includeAttachment, setIncludeAttachment] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Reset form when modal opens/closes
    const resetForm = () => {
        setEmails(['']);
        setSubject('');
        setMessage('');
        setIncludeAttachment(true);
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Add new email input
    const addEmailInput = () => {
        setEmails([...emails, '']);
    };

    // Remove email input
    const removeEmailInput = (index: number) => {
        if (emails.length > 1) {
            const newEmails = emails.filter((_, i) => i !== index);
            setEmails(newEmails);
        }
    };

    // Update email at specific index
    const updateEmail = (index: number, value: string) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    // Validate email format
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Send email
    const handleSendEmail = async () => {
        if (!document) return;

        // Validate emails
        const validEmails = emails.filter(email => email.trim() && isValidEmail(email.trim()));
        const invalidEmails = emails.filter(email => email.trim() && !isValidEmail(email.trim()));

        if (validEmails.length === 0) {
            toast({
                title: "خطا",
                description: "حداقل یک ایمیل معتبر وارد کنید",
                variant: "destructive"
            });
            return;
        }

        if (invalidEmails.length > 0) {
            toast({
                title: "خطا",
                description: `فرمت ایمیل‌های زیر نامعتبر است: ${invalidEmails.join(', ')}`,
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch(`/api/documents/${document.id}/send-email`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emails: validEmails,
                    subject: subject || `📄 سند "${document.title}" برای شما ارسال شد`,
                    message,
                    includeAttachment
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفق",
                    description: data.totalFailed > 0
                        ? `سند به ${data.totalSent} نفر ارسال شد، ${data.totalFailed} نفر ناموفق`
                        : `سند با موفقیت به ${data.totalSent} نفر ارسال شد`
                });
                handleClose();
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
            setIsLoading(false);
        }
    };

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-vazir flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        ارسال سند از طریق ایمیل
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Document Info */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-medium font-vazir">{document.title}</h3>
                                <p className="text-sm text-muted-foreground font-vazir">
                                    {document.original_filename}
                                </p>
                                <p className="text-xs text-muted-foreground font-vazir mt-1">
                                    حجم: {formatFileSize(document.file_size)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Email Recipients */}
                    <div className="space-y-3">
                        <Label className="font-vazir flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            گیرندگان ایمیل
                        </Label>
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => updateEmail(index, e.target.value)}
                                    className="font-vazir"
                                    dir="ltr"
                                />
                                {emails.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEmailInput(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEmailInput}
                            className="font-vazir"
                        >
                            <Plus className="h-4 w-4 ml-2" />
                            افزودن ایمیل
                        </Button>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label className="font-vazir">موضوع ایمیل (اختیاری)</Label>
                        <Input
                            placeholder={`📄 سند "${document.title}" برای شما ارسال شد`}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="font-vazir"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label className="font-vazir flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            پیام (اختیاری)
                        </Label>
                        <Textarea
                            placeholder="پیام خود را اینجا بنویسید..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="font-vazir"
                        />
                    </div>

                    {/* Include Attachment */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="font-vazir">ضمیمه کردن فایل</Label>
                                <p className="text-sm text-muted-foreground font-vazir">
                                    فایل سند به ایمیل ضمیمه شود
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={includeAttachment}
                            onCheckedChange={setIncludeAttachment}
                        />
                    </div>

                    {/* Email Preview */}
                    {emails.some(email => email.trim() && isValidEmail(email.trim())) && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                            <h4 className="font-medium font-vazir text-teal-900 mb-2">پیش‌نمایش ایمیل:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-vazir">
                                        گیرندگان: {emails.filter(email => email.trim() && isValidEmail(email.trim())).length}
                                    </Badge>
                                    {includeAttachment && (
                                        <Badge variant="outline" className="font-vazir">
                                            📎 با ضمیمه
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-teal-800 font-vazir">
                                    موضوع: {subject || `📄 سند "${document.title}" برای شما ارسال شد`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="font-vazir"
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={isLoading || !emails.some(email => email.trim() && isValidEmail(email.trim()))}
                            className="font-vazir"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    در حال ارسال...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 ml-2" />
                                    ارسال ایمیل
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}