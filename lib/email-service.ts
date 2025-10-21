import nodemailer from 'nodemailer';
import { executeQuery } from './database';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize() {
    try {
      // Get email configuration from database
      const emailConfig = await executeQuery(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['email_config']
      );

      const config = emailConfig[0]?.setting_value || {};

      // Create transporter with Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || config.smtp_user,
          pass: process.env.EMAIL_PASS || config.smtp_password
        }
      });

      // Test the connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
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
        attachments: options.attachments || []
      };

      const result = await this.transporter!.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);

      return { success: true };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  async sendBackupEmail(backupResult: any, recipient: string = 'only.link086@gmail.com'): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'بک‌آپ دیتابیس سیستم CRM';
      const html = `
        <div dir="rtl" style="font-family: 'Vazir', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🗄️ بک‌آپ دیتابیس CRM</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; line-height: 1.6;">سلام،</p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              بک‌آپ دیتابیس سیستم CRM با موفقیت ایجاد و آماده دانلود است.
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">📊 جزئیات بک‌آپ:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0;"><strong>📁 نام فایل:</strong> ${backupResult.fileName}</li>
                <li style="padding: 5px 0;"><strong>📏 حجم فایل:</strong> ${(backupResult.fileSize / 1024 / 1024).toFixed(2)} MB</li>
                <li style="padding: 5px 0;"><strong>⏱️ مدت زمان ایجاد:</strong> ${Math.round(backupResult.duration / 1000)} ثانیه</li>
                <li style="padding: 5px 0;"><strong>🗜️ نوع فایل:</strong> فشرده شده (gzip)</li>
                <li style="padding: 5px 0;"><strong>📅 زمان ایجاد:</strong> ${new Date().toLocaleString('fa-IR')}</li>
              </ul>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-right: 4px solid #2196f3;">
              <p style="margin: 0; color: #1976d2;">
                <strong>💡 نکته:</strong> فایل بک‌آپ به صورت فشرده (gzip) ذخیره شده است. 
                برای استفاده از آن، ابتدا فایل را استخراج کنید.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;">
                🔗 مشاهده در پنل مدیریت
              </a>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin-top: 20px;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ هشدار امنیتی:</strong> این فایل حاوی اطلاعات حساس دیتابیس است. 
                لطفاً آن را در مکان امنی نگهداری کنید.
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
            <p style="margin: 0;">
              این ایمیل به صورت خودکار از سیستم CRM ارسال شده است.<br>
              زمان ارسال: ${new Date().toLocaleString('fa-IR')}
            </p>
          </div>
        </div>
      `;

      // If backup file exists, attach it
      const attachments = [];
      if (backupResult.filePath && backupResult.fileName) {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(process.cwd(), 'backups', backupResult.fileName);

        try {
          await fs.promises.access(fullPath);
          attachments.push({
            filename: backupResult.fileName,
            path: fullPath
          });
          console.log('📎 Backup file will be attached to email');
        } catch (error) {
          console.log('⚠️ Backup file not found for attachment, sending notification only');
        }
      }

      return await this.sendEmail({
        to: recipient,
        subject,
        html,
        attachments
      });
    } catch (error) {
      console.error('Error sending backup email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
              <li style="padding: 5px 0;"><strong>🌐 سرور:</strong> Gmail SMTP</li>
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

export const emailService = new EmailService();