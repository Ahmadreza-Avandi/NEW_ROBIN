/**
 * Express Email Service Client
 * هدایت درخواست‌های ایمیل به سرویس Express
 */

import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

class ExpressEmailService {
    constructor() {
        // آدرس سرویس Express ایمیل
        this.baseUrl = process.env.EXPRESS_EMAIL_SERVICE_URL || 'http://localhost:3001';
    }

    /**
     * تست اتصال به سرویس Express
     */
    async testConnection() {
        try {
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
     * ارسال ایمیل با فایل ضمیمه از طریق multipart/form-data
     */
    async sendEmailWithAttachment(options) {
        try {
            const form = new FormData();
            form.append('to', options.to);
            form.append('subject', options.subject);
            if (options.html) form.append('html', options.html);
            if (options.text) form.append('text', options.text);

            // Add file as stream
            const fileStream = fs.createReadStream(options.filePath);
            form.append('files', fileStream, options.filename);

            console.log('📧 Sending email with attachment via Express service:', {
                to: options.to,
                subject: options.subject,
                filename: options.filename
            });

            const response = await fetch(`${this.baseUrl}/send`, {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
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

        } catch (error) {
            console.error('❌ Express email service attachment error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * ارسال ایمیل ساده (JSON)
     */
    async sendEmail(options) {
        try {
            const attachments = options.attachments?.map(att => ({
                filename: att.filename,
                contentBase64: att.contentBase64 ||
                    (Buffer.isBuffer(att.content) ? att.content.toString('base64') :
                        Buffer.from(att.content).toString('base64'))
            })) || [];

            const payload = {
                to: Array.isArray(options.to) ? options.to[0] : options.to,
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

        } catch (error) {
            console.error('❌ Express email service request error:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }
}

// Create singleton instance
export const expressEmailService = new ExpressEmailService();
