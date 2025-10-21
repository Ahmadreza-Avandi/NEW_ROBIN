// سرویس ایمیل ساده با SMTP
const nodemailer = require('nodemailer');

class SimpleEmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🔧 Initializing simple email service...');

            // بررسی متغیرهای محیطی
            const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
            const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

            console.log('📧 Email Config Check:');
            console.log('- Email User:', emailUser ? '✅ Present' : '❌ Missing');
            console.log('- Email Pass:', emailPass && emailPass !== 'your_app_password_here' ? '✅ Present' : '❌ Missing or Default');

            if (!emailUser || !emailPass || emailPass === 'your_app_password_here' || emailPass.includes('your_app_password')) {
                console.log('⚠️ Email credentials not properly configured');
                console.log('📧 Please follow these steps:');
                console.log('1. Go to https://myaccount.google.com/security');
                console.log('2. Enable 2-Step Verification');
                console.log('3. Generate App Password for Mail');
                console.log('4. Update EMAIL_PASS in .env.local with the 16-character password');
                return false;
            }

            // Create SMTP transporter
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: emailUser,
                    pass: emailPass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Test connection
            console.log('🔍 Testing SMTP connection...');
            await this.transporter.verify();
            this.initialized = true;
            console.log('✅ Simple email service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Simple email service failed:', error.message);
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
                    error: 'Email service not available - please configure EMAIL_PASS in .env.local'
                };
            }
        }

        try {
            console.log('📤 Sending email via SMTP...');

            const mailOptions = {
                from: process.env.EMAIL_USER || process.env.SMTP_USER,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html || options.text || options.message,
                attachments: options.attachments || []
            };

            if (options.cc) mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
            if (options.bcc) mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully via SMTP');

            return {
                success: true,
                messageId: result.messageId,
                service: 'SMTP'
            };
        } catch (error) {
            console.error('❌ SMTP email send failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testConnection() {
        if (!this.initialized) {
            return await this.initialize();
        }

        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('❌ SMTP connection test failed:', error.message);
            return false;
        }
    }

    getStatus() {
        return {
            configured: this.initialized,
            service: 'Simple SMTP',
            user: process.env.EMAIL_USER || process.env.SMTP_USER
        };
    }
}

// Create singleton instance
const simpleEmailService = new SimpleEmailService();

module.exports = simpleEmailService;