// Notification Service for automatic email notifications - Version 2
class NotificationService {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
    }

    // ارسال ایمیل خوش‌آمدگویی به همکار جدید
    async sendNewColleagueWelcomeEmail(userEmail, userName, password) {
        try {
            if (!this.initialized) {
                console.log('⚠️ Email service not initialized');
                return { success: false, error: 'Email service not available' };
            }

            const subject = '👋 به شرکت رابین تجارت خاورمیانه خوش آمدید';
            const content = `
                <div style="font-family: 'Vazirmatn', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
                    <div style="background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">👋 به خانواده رابین خوش آمدید!</h1>
                        <div style="margin-top: 10px; font-size: 16px;">شرکت رابین تجارت خاورمیانه</div>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333;">همکار گرامی ${userName} عزیز!</h2>
                        
                        <p>حساب کاربری شما در سیستم مدیریت ارتباط با مشتری (CRM) شرکت رابین تجارت خاورمیانه با موفقیت ایجاد شد.</p>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #2196F3;">
                            <p style="margin-bottom: 10px;"><strong>🔑 اطلاعات ورود شما:</strong></p>
                            <p style="margin: 5px 0;"><strong>ایمیل:</strong> ${userEmail}</p>
                            <p style="margin: 5px 0;"><strong>رمز عبور:</strong> ${password}</p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #ffc107;">
                            <p style="margin: 0;"><strong>🔒 نکته امنیتی:</strong> لطفاً در اولین ورود، رمز عبور خود را تغییر دهید.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/dashboard" 
                               style="background: #00BCD4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                ورود به سیستم
                            </a>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        
                        <div style="text-align: center; color: #666;">
                            <p>🏢 شرکت رابین تجارت خاورمیانه</p>
                            <p style="font-size: 14px;">این ایمیل به صورت خودکار از سیستم CRM ارسال شده است</p>
                            <p style="font-size: 14px;">تاریخ: ${new Date().toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>
                        </div>
                    </div>
                </div>
            `;

            try {
                const response = await fetch('/api/Gmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: userEmail,
                        subject: subject,
                        html: content
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('✅ Welcome email sent to new colleague:', userEmail);
                    return { success: true, messageId: result.messageId };
                } else {
                    console.error('❌ Failed to send welcome email via Gmail API:', result.error);
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('❌ Gmail API request failed:', error);
                return { success: false, error: error.message };
            }
        } catch (error) {
            console.error('❌ Welcome email error:', error);
            return { success: false, error: error.message };
        }
    }

    // 4. ارسال ایمیل برای پیام جدید
    async sendNewMessageEmail(userEmail, userName, senderName, messageContent) {
        try {
            if (!this.initialized) {
                console.log('⚠️ Email service not initialized');
                return { success: false, error: 'Email service not available' };
            }

            const subject = `💬 پیام جدید از ${senderName}`;
            const content = `
                <h2>پیام جدید دریافت کردید 💬</h2>
                
                <p>سلام ${userName} عزیز،</p>
                
                <p>پیام جدیدی از <strong>${senderName}</strong> برای شما ارسال شده است:</p>
                
                <div class="highlight-box">
                    <p><strong>💬 متن پیام:</strong></p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 10px 0; border-right: 4px solid #00BCD4;">
                        ${messageContent.length > 200 ? messageContent.substring(0, 200) + '...' : messageContent}
                    </div>
                    <p><strong>فرستنده:</strong> ${senderName}</p>
                    <p><strong>تاریخ ارسال:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
                    <p><strong>ساعت ارسال:</strong> ${new Date().toLocaleTimeString('fa-IR')}</p>
                </div>
                
                <div class="warning-box">
                    <p><strong>💡 یادآوری:</strong> لطفاً وارد سیستم شوید و به پیام پاسخ دهید.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/dashboard/chat" class="button">
                        مشاهده پیام‌ها
                    </a>
                </div>
                
                <p>موفق باشید! 💪</p>
            `;

            try {
                const response = await fetch('/api/Gmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: userEmail,
                        subject: subject,
                        html: content
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('✅ Email notification sent via Gmail API:', userEmail);
                    return { success: true, messageId: result.messageId };
                } else {
                    console.error('❌ Failed to send email notification via Gmail API:', result.error);
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('❌ Gmail API request failed:', error);
                return { success: false, error: error.message };
            }
        } catch (error) {
            console.error('❌ New message email error:', error);
            return { success: false, error: error.message };
        }
    }

    // 5. ارسال ایمیل عمومی (برای اشتراک‌گذاری اسناد و موارد دیگر)
    async sendEmail(to, subject, htmlContent) {
        try {
            if (!this.initialized) {
                console.log('⚠️ Email service not initialized');
                return { success: false, error: 'Email service not available' };
            }

            try {
                const response = await fetch('/api/Gmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: to,
                        subject: subject,
                        html: htmlContent
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('✅ Email sent via Gmail API:', to);
                    return { success: true, messageId: result.messageId };
                } else {
                    console.error('❌ Failed to send email via Gmail API:', result.error);
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('❌ Gmail API request failed:', error);
                return { success: false, error: error.message };
            }
        } catch (error) {
            console.error('❌ Email sending error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = NotificationService;