'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, ShareIcon, UserIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';

interface Document {
    id: string;
    title: string;
    description?: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document;
    onSuccess?: () => void;
}

interface Coworker {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
}

export default function ShareModal({ isOpen, onClose, document, onSuccess }: ShareModalProps) {
    const [emails, setEmails] = useState<string[]>(['']);
    const [message, setMessage] = useState('');
    const [permissionType, setPermissionType] = useState('view');
    const [includeAttachment, setIncludeAttachment] = useState(true);
    const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
    const [sharing, setSharing] = useState(false);
    const [coworkers, setCoworkers] = useState<Coworker[]>([]);
    const [showCoworkersList, setShowCoworkersList] = useState(false);
    const { toast } = useToast();

    // بارگذاری لیست همکاران
    useEffect(() => {
        fetchCoworkers();
    }, []);

    const fetchCoworkers = async () => {
        try {
            let token = null;
            if (typeof document !== 'undefined' && document.cookie) {
                const cookies = document.cookie.split('; ');
                const authCookie = cookies.find(row => row.startsWith('auth-token='));
                if (authCookie) {
                    token = authCookie.split('=')[1];
                }
            }

            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCoworkers(data.users || []);
            }
        } catch (error) {
            console.error('خطا در بارگذاری همکاران:', error);
        }
    };

    // اضافه کردن فیلد ایمیل جدید
    const addEmailField = () => {
        setEmails([...emails, '']);
    };

    // انتخاب همکار
    const selectCoworker = (coworker: Coworker) => {
        if (!emails.includes(coworker.email)) {
            const emptyIndex = emails.findIndex(email => !email.trim());
            if (emptyIndex !== -1) {
                updateEmail(emptyIndex, coworker.email);
            } else {
                setEmails([...emails, coworker.email]);
            }
        }
        setShowCoworkersList(false);
    };

    // حذف فیلد ایمیل
    const removeEmailField = (index: number) => {
        if (emails.length > 1) {
            setEmails(emails.filter((_, i) => i !== index));
        }
    };

    // تغییر ایمیل
    const updateEmail = (index: number, value: string) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    // اشتراک‌گذاری سند
    const handleShare = async () => {
        const validEmails = emails.filter(email => email.trim() && isValidEmail(email.trim()));

        if (validEmails.length === 0) {
            toast.error('لطفاً حداقل یک ایمیل معتبر وارد کنید');
            return;
        }

        setSharing(true);

        try {
            let token = null;
            if (typeof document !== 'undefined' && document.cookie) {
                const cookies = document.cookie.split('; ');
                const authCookie = cookies.find(row => row.startsWith('auth-token='));
                if (authCookie) {
                    token = authCookie.split('=')[1];
                }
            }

            const response = await fetch(`/api/documents/${document.id}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emails: validEmails,
                    message: message.trim(),
                    includeAttachment: true
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: "موفق",
                    description: `سند با ${validEmails.length} نفر به اشتراک گذاشته شد`,
                });
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast({
                    title: "خطا",
                    description: data.error || 'خطا در اشتراک‌گذاری سند',
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: 'خطا در اشتراک‌گذاری سند',
                variant: "destructive"
            });
        } finally {
            setSharing(false);
        }
    };

    // بررسی معتبر بودن ایمیل
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* هدر */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <ShareIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 font-vazir">اشتراک‌گذاری سند</h2>
                            <p className="text-sm text-gray-600 font-vazir">{document.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* محتوا */}
                <div className="p-6 space-y-6">
                    {/* ایمیل‌ها */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 font-vazir">
                                ایمیل گیرندگان
                            </label>
                            <button
                                onClick={() => setShowCoworkersList(!showCoworkersList)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <UserIcon className="w-4 h-4" />
                                انتخاب از همکاران
                            </button>
                        </div>

                        {/* لیست همکاران */}
                        {showCoworkersList && (
                            <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                                <div className="text-sm font-medium text-gray-700 mb-2">همکاران:</div>
                                <div className="space-y-1">
                                    {coworkers.map((coworker) => (
                                        <button
                                            key={coworker.id}
                                            onClick={() => selectCoworker(coworker)}
                                            className="w-full text-right p-2 hover:bg-white rounded flex items-center gap-2"
                                        >
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs text-blue-600">
                                                    {coworker.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{coworker.name}</div>
                                                <div className="text-xs text-gray-500">{coworker.email}</div>
                                            </div>
                                            <div className="text-xs text-gray-400">{coworker.role}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {emails.map((email, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => updateEmail(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-vazir"
                                        placeholder="example@company.com"
                                    />
                                    {emails.length > 1 && (
                                        <button
                                            onClick={() => removeEmailField(index)}
                                            className="p-2 text-red-600 hover:text-red-800"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addEmailField}
                            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            افزودن ایمیل دیگر
                        </button>
                    </div>





                    {/* پیام */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            پیام (اختیاری)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-vazir"
                            placeholder="پیام اختیاری برای گیرندگان..."
                        />
                    </div>

                    {/* گزینه ضمیمه فایل - ساده سازی: همیشه فعال است، ورودی حذف شد */}

                    {/* پیش‌نمایش ایمیل - حذف برای سادگی فرم */}
                </div>

                {/* دکمه‌ها */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={sharing}
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={sharing || emails.every(email => !email.trim())}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {sharing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                در حال ارسال...
                            </>
                        ) : (
                            <>
                                <ShareIcon className="w-4 h-4" />
                                اشتراک‌گذاری
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}