'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    DocumentIcon,
    ArrowDownTrayIcon as DownloadIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface SharedDocument {
    id: string;
    title: string;
    description?: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    category_name?: string;
    category_color?: string;
    persian_date: string;
    uploaded_by_name: string;
    view_count: number;
    download_count: number;
    share_permission: string;
    share_expires_at?: string;
    share_message?: string;
    shared_by_name: string;
}

export default function SharedDocumentPage() {
    const params = useParams();
    const token = params.token as string;

    const [document, setDocument] = useState<SharedDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // بارگذاری اطلاعات سند اشتراکی
    useEffect(() => {
        const fetchSharedDocument = async () => {
            try {
                const response = await fetch(`/api/documents/shared/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setDocument(data.document);
                } else {
                    setError(data.error || 'سند یافت نشد');
                }
            } catch (error) {
                setError('خطا در بارگذاری سند');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchSharedDocument();
        }
    }, [token]);

    // دانلود سند
    const handleDownload = async () => {
        if (!document || document.share_permission !== 'download') {
            toast.error('دسترسی دانلود ندارید');
            return;
        }

        try {
            const response = await fetch(`/api/documents/shared/${token}/download`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = document.original_filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('فایل دانلود شد');
            } else {
                const data = await response.json();
                toast.error(data.error || 'خطا در دانلود فایل');
            }
        } catch (error) {
            toast.error('خطا در دانلود فایل');
        }
    };

    // فرمت کردن حجم فایل
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // بررسی انقضای لینک
    const isExpired = () => {
        if (!document?.share_expires_at) return false;
        return new Date() > new Date(document.share_expires_at);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">خطا در دسترسی</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">
                        ممکن است لینک منقضی شده یا نامعتبر باشد
                    </p>
                </div>
            </div>
        );
    }

    if (isExpired()) {
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <ClockIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">لینک منقضی شده</h1>
                    <p className="text-gray-600 mb-4">مدت زمان دسترسی به این سند به پایان رسیده است</p>
                    <p className="text-sm text-gray-500">
                        برای دسترسی مجدد با فرستنده تماس بگیرید
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* هدر */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <DocumentIcon className="w-12 h-12 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">سند اشتراکی</h1>
                            <p className="text-gray-600">به اشتراک گذاشته شده توسط {document.shared_by_name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* محتوا */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* اطلاعات سند */}
                    <div className="p-6 border-b">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {document.title}
                                </h2>
                                {document.description && (
                                    <p className="text-gray-600 mb-4">{document.description}</p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">نام فایل:</span>
                                        <p className="font-medium">{document.original_filename}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">حجم:</span>
                                        <p className="font-medium">{formatFileSize(document.file_size)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">تاریخ:</span>
                                        <p className="font-medium">{document.persian_date}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">آپلودکننده:</span>
                                        <p className="font-medium">{document.uploaded_by_name}</p>
                                    </div>
                                </div>

                                {document.category_name && (
                                    <div className="mt-4">
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: document.category_color + '20',
                                                color: document.category_color
                                            }}
                                        >
                                            {document.category_name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* دکمه‌های عملیات */}
                            <div className="flex flex-col gap-2 mr-6">
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <EyeIcon className="w-4 h-4" />
                                        {document.view_count}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DownloadIcon className="w-4 h-4" />
                                        {document.download_count}
                                    </span>
                                </div>

                                {document.share_permission === 'download' && (
                                    <button
                                        onClick={handleDownload}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        دانلود فایل
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* پیام اشتراک‌گذار */}
                    {document.share_message && (
                        <div className="p-6 bg-blue-50 border-b">
                            <div className="flex items-start gap-3">
                                <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-1">پیام از {document.shared_by_name}:</h4>
                                    <p className="text-blue-800">{document.share_message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* اطلاعات انقضا */}
                    {document.share_expires_at && (
                        <div className="p-6 bg-yellow-50 border-b">
                            <div className="flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <h4 className="font-medium text-yellow-900">مدت زمان دسترسی:</h4>
                                    <p className="text-yellow-800 text-sm">
                                        این لینک تا {new Date(document.share_expires_at).toLocaleDateString('fa-IR')} معتبر است
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* محدودیت‌های دسترسی */}
                    <div className="p-6">
                        <h4 className="font-medium text-gray-900 mb-3">سطح دسترسی شما:</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">مشاهده سند</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${document.share_permission === 'download' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={`text-sm ${document.share_permission === 'download' ? 'text-gray-700' : 'text-gray-400'}`}>
                                    دانلود فایل
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* راهنما */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-medium text-gray-900 mb-3">راهنما:</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• این سند با شما به صورت محدود به اشتراک گذاشته شده است</li>
                        <li>• در صورت نیاز به دسترسی بیشتر، با فرستنده تماس بگیرید</li>
                        <li>• لطفاً از محتوای این سند بدون اجازه استفاده نکنید</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}