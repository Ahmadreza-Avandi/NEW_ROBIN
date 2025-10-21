'use client';

import { useState } from 'react';
import { sendDocumentByEmail, sendMultipleDocumentsByEmail } from '@/lib/document-email-service';

interface Document {
    id: string;
    title: string;
    original_filename: string;
    category_name?: string;
    category_color?: string;
    file_size: number;
}

export function useDocumentEmail() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preSelectedDocuments, setPreSelectedDocuments] = useState<Document[]>([]);
    const [preSelectedEmails, setPreSelectedEmails] = useState<string[]>([]);

    /**
     * باز کردن مودال ارسال ایمیل با اسناد و ایمیل‌های از پیش انتخاب شده
     */
    const openEmailModal = (documents: Document[] = [], emails: string[] = []) => {
        setPreSelectedDocuments(documents);
        setPreSelectedEmails(emails);
        setIsModalOpen(true);
    };

    /**
     * بستن مودال ارسال ایمیل
     */
    const closeEmailModal = () => {
        setIsModalOpen(false);
        setPreSelectedDocuments([]);
        setPreSelectedEmails([]);
    };

    /**
     * ارسال مستقیم یک سند (بدون نمایش مودال)
     */
    const sendDocument = async (documentId: string, emails: string[], message?: string) => {
        return await sendDocumentByEmail({
            documentId,
            emails,
            message,
            permissionType: 'view',
            expiresInDays: 30
        });
    };

    /**
     * ارسال مستقیم چندین سند (بدون نمایش مودال)
     */
    const sendMultipleDocuments = async (documentIds: string[], emails: string[], message?: string) => {
        return await sendMultipleDocumentsByEmail(documentIds, emails, message);
    };

    return {
        // State
        isModalOpen,
        preSelectedDocuments,
        preSelectedEmails,

        // Actions
        openEmailModal,
        closeEmailModal,
        sendDocument,
        sendMultipleDocuments
    };
}

// Export برای استفاده در کامپوننت‌ها
export default useDocumentEmail;