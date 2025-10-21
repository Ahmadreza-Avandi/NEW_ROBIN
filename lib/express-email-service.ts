/**
 * Express Email Service Client
 * هدایت درخواست‌های ایمیل به سرویس Express
 */

interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentBase64?: string;
    }>;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    via?: string;
    info?: any;
    result?: any;
}

class ExpressEmailService {
    private baseUrl: string;
    private mimeTypes: { [key: string]: string };

    constructor() {
        // آدرس سرویس Express ایمیل
        this.baseUrl = process.env.EXPRESS_EMAIL_SERVICE_URL || 'http://localhost:3001';

        // MIME types for common file extensions
        this.mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif'
        };
    }

    private getMimeType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return this.mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * ارسال ایمیل با فایل ضمیمه از طریق multipart/form-data
     */
    async sendEmailWithAttachment(options: {
        to: string;
        subject: string;
        html?: string;
        text?: string;
        filePath: string;
        filename: string;
    }): Promise<EmailResult> {
        try {
            const FormData = require('form-data');
            const fs = require('fs');
            const fetch = require('node-fetch');

            const form = new FormData();
            form.append('to', options.to);
            form.append('subject', options.subject);
            if (options.html) form.append('html', options.html);
            if (options.text) form.append('text', options.text);

            // Read file and append as Buffer
            const fileBuffer = await fs.promises.readFile(options.filePath);
            form.append('files', fileBuffer, {
                filename: options.filename,
                contentType: this.getMimeType(options.filename)
            });

            console.log('📧 Sending email with attachment via Express service:', {
                to: options.to,
                subject: options.subject,
                filename: options.filename
            });

            const response = await fetch(`${this.baseUrl}/send`, {
                method: 'POST',
                body: form,
                headers: {
                    ...form.getHeaders()
                }
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                console.log('✅ Email with attachment sent successfully via Express service');
                return {
                    success: true,
                    messageId: data.info?.messageId || data.result?.id,
                    via: data.via,
                    info: data.info,
                    result: data.result
                };
            } else {
                console.error('❌ Express email service error:', data);
                return {
                    success: false,
                    error: data.error || 'Unknown error from Express service'
                };
            }

        } catch (error: any) {
            console.error('❌ Express email service attachment error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * تست اتصال به سرویس Express
     */
    async testConnection(): Promise<boolean> {
        try {
            // تست ساده با ارسال یک درخواست کوچک
            const testPayload = {
                to: 'test@example.com',
                subject: 'Connection Test',
                text: 'This is a connection test - will not be sent'
            };

            const response = await fetch(`${this.baseUrl}/send-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload)
            });

            // اگر سرویس در دسترس باشه، حتی اگر ایمیل ارسال نشه، response برمی‌گردونه
            if (response.status === 200 || response.status === 400 || response.status === 500) {
                console.log('✅ Express email service is available');
                return true;
            } else {
                console.error('❌ Express email service not responding:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Express email service connection error:', error);
            return false;
        }
    }

    /**
     * ارسال ایمیل ساده (JSON)
     */
    async sendEmail(options: EmailOptions): Promise<EmailResult> {
        try {
            // تبدیل attachments به فرمت مناسب
            const attachments = options.attachments?.map(att => ({
                filename: att.filename,
                contentBase64: att.contentBase64 ||
                    (Buffer.isBuffer(att.content) ? att.content.toString('base64') :
                        Buffer.from(att.content).toString('base64'))
            })) || [];

            const payload = {
                to: Array.isArray(options.to) ? options.to[0] : options.to, // فعلاً فقط یک گیرنده
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments
            };

            console.log('📧 Sending email via Express service:', {
                to: payload.to,
                subject: payload.subject,
                hasText: !!payload.text,
                hasHtml: !!payload.html,
                attachmentCount: attachments.length
            });

            const response = await fetch(`${this.baseUrl}/send-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                console.log('✅ Email sent successfully via Express service');
                return {
                    success: true,
                    messageId: data.info?.messageId || data.result?.id,
                    via: data.via,
                    info: data.info,
                    result: data.result
                };
            } else {
                console.error('❌ Express email service error:', data);
                return {
                    success: false,
                    error: data.error || 'Unknown error from Express service'
                };
            }

        } catch (error: any) {
            console.error('❌ Express email service request error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * ارسال ایمیل با فایل Buffer (برای Node.js) - استفاده از JSON با base64
     */
    async sendEmailWithBuffer(options: EmailOptions & {
        fileBuffers?: Array<{ filename: string; buffer: Buffer }>
    }): Promise<EmailResult> {
        try {
            // تبدیل فایل‌ها به base64 و استفاده از JSON endpoint
            const attachments: { filename: string; contentBase64: string }[] = [];

            // اضافه کردن فایل‌ها از Buffer
            if (options.fileBuffers) {
                options.fileBuffers.forEach(file => {
                    attachments.push({
                        filename: file.filename,
                        contentBase64: file.buffer.toString('base64')
                    });
                });
            }

            // اضافه کردن attachments موجود
            if (options.attachments) {
                options.attachments.forEach(att => {
                    const buffer = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content);
                    attachments.push({
                        filename: att.filename,
                        contentBase64: buffer.toString('base64')
                    });
                });
            }

            const payload = {
                to: Array.isArray(options.to) ? options.to[0] : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments
            };

            console.log('📧 Sending email with file attachments via Express service (JSON):', {
                to: payload.to,
                subject: payload.subject,
                attachmentCount: attachments.length
            });

            const response = await fetch(`${this.baseUrl}/send-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                console.log('✅ Email with attachments sent successfully via Express service');
                return {
                    success: true,
                    messageId: data.info?.messageId || data.result?.id,
                    via: data.via,
                    info: data.info,
                    result: data.result
                };
            } else {
                console.error('❌ Express email service error:', data);
                return {
                    success: false,
                    error: data.error || 'Unknown error from Express service'
                };
            }

        } catch (error: any) {
            console.error('❌ Express email service request error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * ارسال فایل‌ها به سرویس Express به‌صورت multipart/form-data (برای استفاده در سرور Node)
     */
    async sendEmailWithFilesServer(options: EmailOptions & { fileBuffers?: Array<{ filename: string; buffer: Buffer }> }): Promise<EmailResult> {
        try {
            // استفاده از کتابخانه form-data برای ارسال multipart در Node
            const FormData = require('form-data');
            const form = new FormData();

            form.append('to', Array.isArray(options.to) ? options.to[0] : options.to);
            form.append('subject', options.subject);

            if (options.text) form.append('text', options.text);
            if (options.html) form.append('html', options.html);

            if (options.fileBuffers) {
                for (const file of options.fileBuffers) {
                    // form-data اجازه می‌دهد بافر مستقیم اضافه شود با مشخص کردن filename
                    form.append('files', file.buffer, { filename: file.filename });
                }
            }

            // اضافه کردن attachments (اگر وجود داشته باشد)
            if (options.attachments) {
                for (const att of options.attachments) {
                    const buffer = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content);
                    form.append('files', buffer, { filename: att.filename });
                }
            }

            console.log('📧 Sending email with files via Express service (multipart/server)');

            const fetch = globalThis.fetch || require('node-fetch');
            const response = await fetch(`${this.baseUrl}/send`, {
                method: 'POST',
                headers: form.getHeaders(),
                body: form as any
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                return {
                    success: true,
                    messageId: data.info?.messageId || data.result?.id,
                    via: data.via,
                    info: data.info,
                    result: data.result
                };
            } else {
                console.error('❌ Express email service (multipart) error:', data);
                return { success: false, error: data.error || 'Unknown error from Express service' };
            }

        } catch (error: any) {
            console.error('❌ Express email service (multipart) request error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    }

    /**
     * ارسال فایل‌ها به سرویس Express با stream (axios + form-data) - بهینه‌تر برای فایل‌های بزرگ
     * دریافت آرایه‌ای از مسیر فایل‌ها و افزودن با createReadStream
     */
    async sendEmailWithFilesServerStream(options: EmailOptions & { filePaths?: Array<{ filename: string; path: string }> }): Promise<EmailResult> {
        try {
            const FormData = require('form-data');
            const fs = require('fs');
            const axios = require('axios');

            const form = new FormData();
            form.append('to', Array.isArray(options.to) ? options.to[0] : options.to);
            form.append('subject', options.subject);
            if (options.text) form.append('text', options.text);
            if (options.html) form.append('html', options.html);

            if (options.filePaths) {
                for (const f of options.filePaths) {
                    // createReadStream streams file directly into multipart
                    form.append('files', fs.createReadStream(f.path), { filename: f.filename });
                }
            }

            // attachments fallback
            if (options.attachments) {
                (options.attachments as any[]).forEach(att => {
                    const buffer = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content as any);
                    form.append('files', buffer, { filename: att.filename });
                });
            }

            const headers = form.getHeaders();
            const url = `${this.baseUrl}/send`;

            const response = await axios.post(url, form, { headers });
            const data = response.data;

            if (response.status === 200 && data.ok) {
                return { success: true, messageId: data.info?.messageId || data.result?.id, via: data.via, info: data.info, result: data.result };
            } else {
                console.error('❌ Express email service (multipart stream) error:', data);
                return { success: false, error: data.error || 'Unknown error from Express service' };
            }
        } catch (error: any) {
            console.error('❌ Express email service (multipart stream) request error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    }

    /**
     * ارسال ایمیل با فایل (multipart/form-data) - برای Browser
     */
    async sendEmailWithFiles(options: EmailOptions & { files?: File[] }): Promise<EmailResult> {
        try {
            const formData = new FormData();

            formData.append('to', Array.isArray(options.to) ? options.to[0] : options.to);
            formData.append('subject', options.subject);

            if (options.text) {
                formData.append('text', options.text);
            }

            if (options.html) {
                formData.append('html', options.html);
            }

            // اضافه کردن فایل‌ها
            if (options.files) {
                options.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            // اضافه کردن attachments به عنوان فایل
            if (options.attachments) {
                options.attachments.forEach(att => {
                    const blob = new Blob([att.content as any], { type: 'application/octet-stream' });
                    const file = new File([blob], att.filename);
                    formData.append('files', file as any);
                });
            }

            console.log('📧 Sending email with files via Express service');

            const response = await fetch(`${this.baseUrl}/send`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                console.log('✅ Email with files sent successfully via Express service');
                return {
                    success: true,
                    messageId: data.info?.messageId || data.result?.id,
                    via: data.via,
                    info: data.info,
                    result: data.result
                };
            } else {
                console.error('❌ Express email service error:', data);
                return {
                    success: false,
                    error: data.error || 'Unknown error from Express service'
                };
            }

        } catch (error: any) {
            console.error('❌ Express email service request error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * ارسال ایمیل گروهی
     */
    async sendBulkEmails(emails: Array<{
        to: string;
        subject: string;
        text?: string;
        html?: string;
        variables?: Record<string, string>;
    }>): Promise<Array<{
        to: string;
        success: boolean;
        messageId?: string;
        error?: string;
    }>> {
        const results = [];

        for (const email of emails) {
            try {
                const result = await this.sendEmail({
                    to: email.to,
                    subject: email.subject,
                    text: email.text,
                    html: email.html
                });

                results.push({
                    to: email.to,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error
                });

                // تاخیر کوتاه بین ایمیل‌ها
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error: any) {
                results.push({
                    to: email.to,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * ارسال ایمیل با قالب
     */
    async sendTemplateEmail(
        to: string,
        subject: string,
        template: string,
        variables: Record<string, string> = {}
    ): Promise<EmailResult> {
        // جایگزینی متغیرها در قالب
        let processedTemplate = template;
        let processedSubject = subject;

        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            processedTemplate = processedTemplate.replace(regex, value);
            processedSubject = processedSubject.replace(regex, value);
        });

        return this.sendEmail({
            to,
            subject: processedSubject,
            html: processedTemplate
        });
    }
}

// Export singleton instance
export const expressEmailService = new ExpressEmailService();
export default expressEmailService;