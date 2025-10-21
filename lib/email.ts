import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}

// تنظیمات SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
    try {
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'سیستم مدیریت اسناد'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('ایمیل ارسال شد:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('خطا در ارسال ایمیل:', error);
        throw error;
    }
}

// تست اتصال SMTP
export async function testEmailConnection() {
    try {
        await transporter.verify();
        console.log('اتصال SMTP موفق');
        return true;
    } catch (error) {
        console.error('خطا در اتصال SMTP:', error);
        return false;
    }
}

// Export emailService object
export const emailService = {
    sendEmail: async ({ to, subject, html, attachments }: EmailOptions) => {
        try {
            const result = await sendEmail({ to, subject, html, attachments });
            return result;
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
    
    sendTemplateEmail: async (to: string, subject: string, template: string, variables: Record<string, string> = {}) => {
        try {
            let html = template;
            // Replace variables in template
            Object.entries(variables).forEach(([key, value]) => {
                html = html.replace(new RegExp(`{${key}}`, 'g'), value);
            });
            
            const result = await sendEmail({ to, subject, html });
            return result;
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
    
    testConnection: testEmailConnection,
    
    getStatus: () => {
        const configured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        return {
            configured,
            config: configured ? {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || '587',
                user: process.env.SMTP_USER,
                secure: process.env.SMTP_PORT === '465'
            } : null
        };
    }
};