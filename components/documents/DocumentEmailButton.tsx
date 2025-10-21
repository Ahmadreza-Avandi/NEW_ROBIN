'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, FileText } from 'lucide-react';
import DocumentEmailModal from './DocumentEmailModal';
import { useDocumentEmail } from '@/hooks/use-document-email';

interface Document {
    id: string;
    title: string;
    original_filename: string;
    category_name?: string;
    category_color?: string;
    file_size: number;
}

interface DocumentEmailButtonProps {
    documents?: Document[];
    emails?: string[];
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
    buttonSize?: 'sm' | 'default' | 'lg';
    className?: string;
}

/**
 * دکمه گلوبال برای ارسال اسناد از طریق ایمیل
 * قابل استفاده در هر صفحه‌ای
 */
export default function DocumentEmailButton({
    documents = [],
    emails = [],
    buttonText = 'ارسال سند',
    buttonVariant = 'default',
    buttonSize = 'default',
    className = ''
}: DocumentEmailButtonProps) {
    const {
        isModalOpen,
        preSelectedDocuments,
        preSelectedEmails,
        openEmailModal,
        closeEmailModal
    } = useDocumentEmail();

    const handleClick = () => {
        openEmailModal(documents, emails);
    };

    return (
        <>
            <Button
                variant={buttonVariant}
                size={buttonSize}
                onClick={handleClick}
                className={`font-vazir ${className}`}
            >
                <Mail className="h-4 w-4 ml-2" />
                {buttonText}
            </Button>

            <DocumentEmailModal
                isOpen={isModalOpen}
                onClose={closeEmailModal}
                preSelectedDocuments={preSelectedDocuments}
                preSelectedEmails={preSelectedEmails}
            />
        </>
    );
}

/**
 * دکمه ساده برای ارسال اسناد (فقط آیکون)
 */
export function DocumentEmailIconButton({
    documents = [],
    emails = [],
    className = ''
}: {
    documents?: Document[];
    emails?: string[];
    className?: string;
}) {
    const {
        isModalOpen,
        preSelectedDocuments,
        preSelectedEmails,
        openEmailModal,
        closeEmailModal
    } = useDocumentEmail();

    const handleClick = () => {
        openEmailModal(documents, emails);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className={`font-vazir ${className}`}
                title="ارسال سند از طریق ایمیل"
            >
                <Mail className="h-4 w-4" />
            </Button>

            <DocumentEmailModal
                isOpen={isModalOpen}
                onClose={closeEmailModal}
                preSelectedDocuments={preSelectedDocuments}
                preSelectedEmails={preSelectedEmails}
            />
        </>
    );
}