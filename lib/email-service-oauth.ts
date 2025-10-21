import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { executeQuery } from './database';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer;
    }>;
}

export class EmailServiceOAuth {
    private transporter: nodemailer.Transporter | null = null;
    private oAuth2Client: any = null;

    private getOAuth2Client() {
        if (!this.oAuth2Client) {
            this.oAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'urn:ietf:wg:oauth:2.0:oob'
            );
            this.oAuth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });
        }
        return this.oAuth2Client;
    }

    async initialize() {
        try {
            const oAuth2Client = this.getOAuth2Client();

            // Get access token
            const atResponse = await oAuth2Client.getAccessToken();
            const accessToken = (atResponse && typeof atResponse === 'object')
                ? atResponse.token || atResponse?.access_token
                : atResponse;

            console.log('🔍 Access token fetched (truncated):', accessToken ? accessToken.slice(0, 10) + '...' : null);

            if (!accessToken) {
                throw new Error('No access token retrieved from refresh token. Check refresh token validity.');
            }

            // Create transporter with OAuth2
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken
                },
                debug: false,
                logger: false
            });

            // Verify transporter connection
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully with OAuth2');
            return true;
        } catch (error) {
            console.error('❌ Email service initialization failed:', error);
            return false;
        }
    }

    async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
        try {
            if (!this.transporter) {
                const initialized = await this.initialize();
                if (!initialized) {
                    return { success: false, error: 'Email service not initialized' };
                }
            }

            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@crm-system.com',
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments || []
            };

            const result = await this.transporter!.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', result.messageId);

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Email sending failed:', error);

            // Try Gmail API fallback
            try {
                console.log('🔄 Trying Gmail API fallback...');
                const gmailResult = await this.sendWithGmailAPI(options);
                return { success: true, messageId: gmailResult.id };
            } catch (gmailError) {
                console.error('❌ Gmail API fallback also failed:', gmailError);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown email error'
                };
            }
        }
    }

    private async sendWithGmailAPI(options: EmailOptions): Promise<any> {
        const oAuth2Client = this.getOAuth2Client();
        const accessTokenObj = await oAuth2Client.getAccessToken();
        const accessToken = (accessTokenObj && typeof accessTokenObj === 'object')
            ? accessTokenObj.token || accessTokenObj?.access_token
            : accessTokenObj;

        if (!accessToken) throw new Error('No access token for Gmail API');

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        // Build MIME message
        const boundary = '----=_Boundary_' + Date.now();
        let body = [];
        body.push(`From: ${process.env.EMAIL_USER}`);
        body.push(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        body.push(`Subject: =?UTF-8?B?${Buffer.from(options.subject || '').toString('base64')}?=`);
        body.push('MIME-Version: 1.0');
        body.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        body.push('');

        // HTML/text part
        body.push(`--${boundary}`);
        body.push('Content-Type: text/html; charset="UTF-8"');
        body.push('Content-Transfer-Encoding: 7bit');
        body.push('');
        body.push(options.html || (options.text ? options.text.replace(/\n/g, '<br>') : ''));

        // Attachments
        if (options.attachments) {
            for (const att of options.attachments) {
                body.push(`--${boundary}`);
                let mimeType = 'application/octet-stream';
                if (att.filename) {
                    if (att.filename.endsWith('.txt')) mimeType = 'text/plain';
                    if (att.filename.endsWith('.pdf')) mimeType = 'application/pdf';
                    if (att.filename.endsWith('.jpg')) mimeType = 'image/jpeg';
                    if (att.filename.endsWith('.png')) mimeType = 'image/png';
                }
                body.push(`Content-Type: ${mimeType}; name="${att.filename}"`);
                body.push(`Content-Disposition: attachment; filename="${att.filename}"`);
                body.push('Content-Transfer-Encoding: base64');
                body.push('');

                let content = '';
                if (att.content) {
                    content = Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64');
                } else if (att.path) {
                    const fs = require('fs');
                    const fileContent = await fs.promises.readFile(att.path);
                    content = fileContent.toString('base64');
                }
                body.push(content);
            }
        }
        body.push(`--${boundary}--`);

        const raw = Buffer.from(body.join('\r\n')).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw }
        });

        return res.data;
    }

    async sendTestEmail(recipient: string): Promise<{ success: boolean; error?: string }> {
        const subject = 'تست سرویس ایمیل سیستم CRM';
        const html = `
      <div dir="rtl" style="font-family: 'Vazir', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">✅ تست سرویس ایمیل</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; line-height: 1.6;">سلام،</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            این ایمیل برای تست سرویس ایمیل سیستم CRM ارسال شده است.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">📋 جزئیات تست:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>⏰ زمان ارسال:</strong> ${new Date().toLocaleString('fa-IR')}</li>
              <li style="padding: 5px 0;"><strong>📧 گیرنده:</strong> ${recipient}</li>
              <li style="padding: 5px 0;"><strong>🔧 وضعیت سیستم:</strong> فعال و آماده</li>
              <li style="padding: 5px 0;"><strong>🌐 سرور:</strong> Gmail OAuth2</li>
            </ul>
          </div>

          <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-right: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              <strong>🎉 موفقیت!</strong> اگر این ایمیل را دریافت کرده‌اید، یعنی سرویس ایمیل به درستی کار می‌کند.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
          <p style="margin: 0;">
            این ایمیل به صورت خودکار از سیستم CRM ارسال شده است.
          </p>
        </div>
      </div>
    `;

        return await this.sendEmail({
            to: recipient,
            subject,
            html
        });
    }
}

export const emailServiceOAuth = new EmailServiceOAuth();