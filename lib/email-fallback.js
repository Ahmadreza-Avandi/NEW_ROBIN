// سرویس ایمیل جایگزین برای مواقع مشکل اتصال Gmail API
const nodemailer = require('nodemailer');

class EmailFallbackService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🔧 Initializing fallback email service...');

            // Create SMTP transporter
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER || process.env.SMTP_USER,
                    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Test connection
            await this.transporter.verify();
            this.initialized = true;
            console.log('✅ Fallback email service initialized');
            return true;
        } catch (error) {
            console.error('❌ Fallback email service failed:', error.message);
            this.initialized = false;
            return false;
        }
    }

    async sendEmail(options) {
        if (!this.initialized) {
            const initResult = await this.initialize();
            if (!initResult) {
                return {
                    success: false,
                    error: 'Email service not available'
                };
            }
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || process.env.SMTP_USER,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html || options.text,
                attachments: options.attachments || []
            };

            if (options.cc) mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
            if (options.bcc) mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;

            const result = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('❌ Fallback email send failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getStatus() {
        return {
            configured: this.initialized,
            service: 'SMTP Fallback',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || '587'
        };
    }
}

// Create singleton instance
const emailFallbackService = new EmailFallbackService();

module.exports = emailFallbackService;