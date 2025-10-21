import { NextRequest } from 'next/server';

// Import Gmail API service
let gmailService: any;
try {
    // Try different import paths for different environments
    try {
        gmailService = require('./gmail-api.js');
    } catch (e) {
        try {
            gmailService = require('../lib/gmail-api.js');
        } catch (e2) {
            gmailService = require(require('path').resolve(process.cwd(), 'lib/gmail-api.js'));
        }
    }
} catch (error) {
    console.warn('Gmail service not available:', error.message);
    gmailService = null;
}

export interface DocumentEmailOptions {
    documentId: string;
    emails: string[];
    subject?: string;
    message?: string;
    includeAttachment?: boolean;
    userToken?: string;
}

export interface DocumentEmailResult {
    success: boolean;
    message: string;
    sentEmails?: string[];
    failedEmails?: string[];
    error?: string;
}

class DocumentEmailService {
    private async getDocumentData(documentId: string, userToken?: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/documents/${documentId}`, {
                headers: {
                    'Authorization': userToken ? `Bearer ${userToken}` : '',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('سند یافت نشد');
            }

            return await response.json();
        } catch (error) {
            throw new Error('خطا در دریافت اطلاعات سند');
        }
    }

    private async getDocumentFile(documentId: string, userToken?: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/documents/${documentId}/download`, {
                headers: {
                    'Authorization': userToken ? `Bearer ${userToken}` : '',
                },
            });

            if (!response.ok) {
                throw new Error('فایل سند یافت نشد');
            }

            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer);
        } catch (error) {
            throw new Error('خطا در دریافت فایل سند');
        }
    }

    private createEmailTemplate(documentData: any, message?: string, includeAttachment?: boolean) {
        return `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; background: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📄 سند جدید برای شما ارسال شد</h1>
          </div>
          <div style="padding: 30px;">
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10B981;">
              <p style="margin: 0 0 10px 0;"><strong>📋 نام سند:</strong> ${documentData.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>📁 نام فایل:</strong> ${documentData.original_filename}</p>
              <p style="margin: 0 0 10px 0;"><strong>📊 حجم فایل:</strong> ${this.formatFileSize(documentData.file_size)}</p>
              <p style="margin: 0 0 10px 0;"><strong>📅 تاریخ آپلود:</strong> ${documentData.persian_date}</p>
              ${documentData.description ? `<p style="margin: 0;"><strong>📝 توضیحات:</strong> ${documentData.description}</p>` : ''}
            </div>
            
            ${message ? `
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #3B82F6;">
                <p style="margin: 0;"><strong>💬 پیام:</strong></p>
                <p style="margin: 10px 0 0 0; color: #374151;">${message}</p>
              </div>
            ` : ''}

            ${includeAttachment ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #92400e;">📎 فایل سند به این ایمیل ضمیمه شده است</p>
              </div>
            ` : `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/documents" 
                   style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                   🔗 مشاهده در سیستم
                </a>
              </div>
            `}

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              این ایمیل از سیستم مدیریت اسناد ارسال شده است<br>
              تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>
      </div>
    `;
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async sendDocumentByEmail(options: DocumentEmailOptions): Promise<DocumentEmailResult> {
        try {
            // Initialize Gmail API if not already done
            if (!gmailService.gmail) {
                console.log('🔧 Initializing Gmail API...');
                const initResult = await gmailService.initializeFromEnv();
                if (!initResult) {
                    return {
                        success: false,
                        message: 'خطا در راه‌اندازی سرویس ایمیل',
                        error: 'Gmail API initialization failed'
                    };
                }
            }

            // Get document data
            const documentData = await this.getDocumentData(options.documentId, options.userToken);

            // Get document file if attachment is requested
            let fileBuffer: Buffer | null = null;
            if (options.includeAttachment) {
                fileBuffer = await this.getDocumentFile(options.documentId, options.userToken);
            }

            // Create email content
            const emailContent = this.createEmailTemplate(
                documentData,
                options.message,
                options.includeAttachment
            );

            const subject = options.subject || `📄 سند "${documentData.title}" برای شما ارسال شد`;

            const sentEmails: string[] = [];
            const failedEmails: string[] = [];

            // Send email to each recipient
            for (const email of options.emails) {
                try {
                    let emailOptions: any = {
                        to: email,
                        subject: subject,
                        html: emailContent
                    };

                    // Add attachment if requested
                    if (options.includeAttachment && fileBuffer) {
                        emailOptions.attachments = [{
                            filename: documentData.original_filename,
                            content: fileBuffer,
                            contentType: documentData.mime_type
                        }];
                    }

                    const result = await gmailService.sendEmailWithAttachment(emailOptions);

                    if (result.success) {
                        sentEmails.push(email);
                        console.log('✅ ایمیل سند ارسال شد:', email);
                    } else {
                        failedEmails.push(email);
                        console.log('❌ خطا در ارسال ایمیل:', email, result.error);
                    }

                    // Add delay between emails
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (emailError) {
                    failedEmails.push(email);
                    console.error('❌ خطا در ارسال ایمیل به:', email, emailError);
                }
            }

            const allSuccess = failedEmails.length === 0;
            const partialSuccess = sentEmails.length > 0 && failedEmails.length > 0;

            return {
                success: allSuccess || partialSuccess,
                message: allSuccess
                    ? 'سند با موفقیت به همه گیرندگان ارسال شد'
                    : partialSuccess
                        ? `سند به ${sentEmails.length} نفر ارسال شد، ${failedEmails.length} نفر ناموفق`
                        : 'خطا در ارسال سند به همه گیرندگان',
                sentEmails,
                failedEmails
            };

        } catch (error: any) {
            console.error('❌ خطا در سرویس ارسال سند:', error);
            return {
                success: false,
                message: 'خطا در ارسال سند',
                error: error.message || 'خطای نامشخص'
            };
        }
    }
}

// Create singleton instance
export const documentEmailService = new DocumentEmailService();

// Global function for use in components
export const sendDocumentByEmail = (options: DocumentEmailOptions): Promise<DocumentEmailResult> => {
    return documentEmailService.sendDocumentByEmail(options);
};