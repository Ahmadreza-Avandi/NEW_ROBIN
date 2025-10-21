const { google } = require('googleapis');

class GmailAPIService {
    constructor() {
        this.gmail = null;
        this.oAuth2Client = null;
        this.userEmail = '';
        this.initialized = false;
        // Don't auto-initialize in constructor
    }

    async initializeFromEnv() {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
            const userEmail = process.env.EMAIL_USER;

            console.log('🔧 Gmail API Environment Check:');
            console.log('- Client ID:', clientId ? '✅ Present' : '❌ Missing');
            console.log('- Client Secret:', clientSecret ? '✅ Present' : '❌ Missing');
            console.log('- Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
            console.log('- Email User:', userEmail ? '✅ Present' : '❌ Missing');

            if (clientId && clientSecret && refreshToken && userEmail) {
                return await this.configure(clientId, clientSecret, refreshToken, userEmail);
            }
            return false;
        } catch (error) {
            console.error('❌ Gmail API initialization error:', error);
            return false;
        }
    }

    async configure(clientId, clientSecret, refreshToken, userEmail) {
        try {
            console.log('🔧 Configuring Gmail API...');

            this.oAuth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'http://localhost:8080'
            );

            this.oAuth2Client.setCredentials({
                refresh_token: refreshToken
            });

            // Test access token with timeout
            console.log('🔑 Testing access token...');
            const tokenPromise = this.oAuth2Client.refreshAccessToken();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Token refresh timeout')), 10000)
            );

            const { credentials } = await Promise.race([tokenPromise, timeoutPromise]);
            console.log('✅ Access Token دریافت شد');

            this.gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
            this.userEmail = userEmail;
            this.initialized = true;

            console.log('✅ Gmail API configured successfully');
            return true;
        } catch (error) {
            console.error('❌ Gmail API configuration failed:', error.message);
            this.initialized = false;
            return false;
        }
    }

    async testConnection() {
        if (!this.gmail || !this.initialized) {
            console.log('❌ Gmail API not initialized');
            return false;
        }

        try {
            console.log('🔍 Testing Gmail API connection...');
            const profilePromise = this.gmail.users.getProfile({ userId: 'me' });
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), 15000)
            );

            await Promise.race([profilePromise, timeoutPromise]);
            console.log('✅ Gmail API connection successful');
            return true;
        } catch (error) {
            console.error('❌ Gmail API connection failed:', error.message);
            return false;
        }
    }

    createEmailContent(options) {
        const { to, subject, text, html, from, cc, bcc, attachments } = options;

        if (attachments && attachments.length > 0) {
            return this.createMultipartEmail(options);
        }

        const emailLines = [];
        emailLines.push(`To: ${Array.isArray(to) ? to.join(', ') : to}`);

        // Set From address
        if (from) {
            emailLines.push(`From: ${from}`);
        } else if (this.userEmail) {
            emailLines.push(`From: ${this.userEmail}`);
        } else {
            emailLines.push(`From: ${process.env.EMAIL_USER || 'noreply@example.com'}`);
        }

        if (cc) emailLines.push(`Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}`);
        if (bcc) emailLines.push(`Bcc: ${Array.isArray(bcc) ? bcc.join(', ') : bcc}`);

        // Encode subject for proper UTF-8 display
        const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
        emailLines.push(`Subject: ${encodedSubject}`);
        emailLines.push('Content-Type: text/html; charset=utf-8');
        emailLines.push('MIME-Version: 1.0');
        emailLines.push('');

        if (html) {
            emailLines.push(html);
        } else if (text) {
            emailLines.push(text.replace(/\n/g, '<br>'));
        }

        return emailLines.join('\n');
    }

    createMultipartEmail(options) {
        const { to, subject, text, html, from, cc, bcc, attachments } = options;
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const emailLines = [];
        emailLines.push(`To: ${Array.isArray(to) ? to.join(', ') : to}`);

        // Set From address
        if (from) {
            emailLines.push(`From: ${from}`);
        } else if (this.userEmail) {
            emailLines.push(`From: ${this.userEmail}`);
        } else {
            emailLines.push(`From: ${process.env.EMAIL_USER || 'noreply@example.com'}`);
        }

        if (cc) emailLines.push(`Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}`);
        if (bcc) emailLines.push(`Bcc: ${Array.isArray(bcc) ? bcc.join(', ') : bcc}`);

        // Encode subject for proper UTF-8 display
        const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
        emailLines.push(`Subject: ${encodedSubject}`);
        emailLines.push('MIME-Version: 1.0');
        emailLines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        emailLines.push('');

        // HTML content part
        emailLines.push(`--${boundary}`);
        emailLines.push('Content-Type: text/html; charset=utf-8');
        emailLines.push('Content-Transfer-Encoding: quoted-printable');
        emailLines.push('');

        const content = html || (text ? text.replace(/\n/g, '<br>') : '');
        emailLines.push(this.encodeQuotedPrintable(content));
        emailLines.push('');

        // Attachment parts
        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                emailLines.push(`--${boundary}`);
                emailLines.push(`Content-Type: ${attachment.contentType || 'application/octet-stream'}`);
                emailLines.push('Content-Transfer-Encoding: base64');
                emailLines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
                emailLines.push('');

                // Convert buffer to base64 and split into 76-character lines
                const base64Content = attachment.content.toString('base64');
                const lines = base64Content.match(/.{1,76}/g) || [];
                emailLines.push(...lines);
                emailLines.push('');
            }
        }

        emailLines.push(`--${boundary}--`);
        return emailLines.join('\n');
    }

    encodeQuotedPrintable(text) {
        return text
            .replace(/[^\x20-\x7E]/g, (match) => {
                const hex = match.charCodeAt(0).toString(16).toUpperCase();
                return `=${hex.padStart(2, '0')}`;
            })
            .replace(/(.{75})/g, '$1=\n');
    }

    async sendEmail(options) {
        if (!this.gmail || !this.initialized) {
            console.log('❌ Gmail API not configured');
            return {
                success: false,
                error: 'Gmail API not configured'
            };
        }

        try {
            console.log('📧 Preparing email...');
            const emailContent = this.createEmailContent(options);
            const encodedEmail = Buffer.from(emailContent).toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            console.log('📤 Sending email via Gmail API...');

            // Add timeout to send request
            const sendPromise = this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail
                }
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Send timeout')), 30000)
            );

            const result = await Promise.race([sendPromise, timeoutPromise]);

            console.log('✅ Email sent successfully');
            return {
                success: true,
                messageId: result.data.id
            };
        } catch (error) {
            console.error('❌ Gmail API send failed:', error.message);
            return {
                success: false,
                error: error.message || 'Unknown error occurred'
            };
        }
    }

    async sendEmailWithAttachment(options) {
        return this.sendEmail(options);
    }

    async sendBulkEmails(emails) {
        const results = [];

        for (const email of emails) {
            const result = await this.sendEmail(email);
            results.push(result);

            // Add delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
    }

    async sendTemplateEmail(to, subject, template, variables = {}) {
        let processedTemplate = template;

        // Replace variables in template
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processedTemplate = processedTemplate.replace(regex, value);
        });

        // Convert text to HTML with basic formatting
        const htmlContent = processedTemplate
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        return this.sendEmail({
            to,
            subject,
            html: this.wrapInEmailTemplate(htmlContent, subject)
        });
    }

    wrapInEmailTemplate(content, subject) {
        return `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .email-container {
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .email-body {
                    padding: 30px 20px;
                }
                .email-footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #eee;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                .button:hover {
                    background: #5a6fd8;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>سیستم مدیریت ارتباط با مشتری</h1>
                </div>
                <div class="email-body">
                    ${content}
                </div>
                <div class="email-footer">
                    <p>این پیام از سیستم مدیریت ارتباط با مشتری ارسال شده است</p>
                    <p>تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR')}</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getStatus() {
        return {
            configured: this.initialized,
            userEmail: this.userEmail,
            service: 'Gmail API',
            hasGmail: !!this.gmail
        };
    }
}

// Create singleton instance
const gmailAPIService = new GmailAPIService();

module.exports = gmailAPIService;