// Helper functions for generating email templates

export const generateEmailTemplate = (content, subject, options = {}) => {
    const {
        logoUrl = 'https://uploadkon.ir/uploads/5c1f19_25x-removebg-preview.png',
        companyName = 'شرکت رابین تجارت خاورمیانه',
        systemName = 'سیستم مدیریت ارتباط با مشتری (CRM)'
    } = options;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%);
            padding: 20px;
            direction: rtl;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .email-header {
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 50%, #FF9800 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .email-header .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .email-header .logo img {
            width: 60px;
            height: 60px;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        .email-header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        
        .email-header .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }
        
        .email-body {
            padding: 40px 30px;
            background: white;
            position: relative;
        }
        
        .email-body h2 {
            color: #00BCD4;
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            border-right: 4px solid #00BCD4;
            padding-right: 15px;
        }
        
        .email-body p {
            margin-bottom: 16px;
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .email-body strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
            border: 1px solid rgba(0, 188, 212, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        
        .highlight-box::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%);
            border-radius: 0 12px 12px 0;
        }
        
        .warning-box {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%);
            border: 1px solid rgba(255, 152, 0, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        
        .warning-box::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            border-radius: 0 12px 12px 0;
        }
        
        .success-box {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
            border: 1px solid rgba(76, 175, 80, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        
        .success-box::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            border-radius: 0 12px 12px 0;
        }
        
        .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: none;
            cursor: pointer;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #00ACC1 0%, #43A047 100%);
        }
        
        .button-secondary {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        }
        
        .button-secondary:hover {
            background: linear-gradient(135deg, #FB8C00 0%, #EF6C00 100%);
        }
        
        .email-footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(0, 188, 212, 0.1);
            position: relative;
        }
        
        .email-footer p {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .email-footer .company-info {
            color: #00BCD4;
            font-weight: 500;
            font-size: 15px;
            margin-bottom: 12px;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 188, 212, 0.3) 50%, transparent 100%);
            margin: 30px 0;
        }
        
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-wrapper {
                border-radius: 12px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .email-footer {
                padding: 20px;
            }
            
            .button {
                display: block;
                text-align: center;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="logo">
                <img src="${logoUrl}" alt="${companyName}" />
            </div>
            <h1>${subject}</h1>
            <div class="subtitle">${companyName}</div>
        </div>
        
        <div class="email-body">
            ${content}
        </div>
        
        <div class="divider"></div>
        
        <div class="email-footer">
            <div class="company-info">${companyName}</div>
            <p>${systemName}</p>
            <p>این پیام به صورت خودکار از سیستم ارسال شده است</p>
            <p>تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })}</p>
            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                اگر این ایمیل برای شما ارسال نشده، لطفاً آن را نادیده بگیرید
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

// تمپلیت خوش‌آمدگویی
export const generateWelcomeEmailContent = (userName, userEmail) => {
    return `
    <h2>سلام ${userName} عزیز! 🎉</h2>
    
    <p>شما با موفقیت به سیستم مدیریت ارتباط با مشتری <strong>شرکت رابین تجارت خاورمیانه</strong> وارد شدید.</p>
    
    <div class="highlight-box">
        <p><strong>📍 اطلاعات ورود:</strong></p>
        <p><strong>ایمیل:</strong> ${userEmail}</p>
        <p><strong>تاریخ ورود:</strong> ${new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })}</p>
        <p><strong>ساعت ورود:</strong> ${new Date().toLocaleTimeString('fa-IR')}</p>
    </div>
    
    <p>از امکانات کامل سیستم استفاده کنید و در صورت نیاز به راهنمایی با تیم پشتیبانی تماس بگیرید.</p>
    
    <div class="warning-box">
        <p><strong>💡 نکته امنیتی:</strong> اگر این ورود توسط شما انجام نشده، لطفاً فوراً با مدیر سیستم تماس بگیرید.</p>
    </div>
    
    <p>موفق و پیروز باشید! 🚀</p>
  `;
};

// تمپلیت اطلاع‌رسانی وظیفه
export const generateTaskNotificationContent = (userName, taskData) => {
    return `
    <h2>وظیفه جدید برای شما ثبت شد 📋</h2>
    
    <p>سلام ${userName} عزیز،</p>
    
    <p>وظیفه جدیدی در سیستم برای شما ثبت شده است:</p>
    
    <div class="highlight-box">
        <p><strong>📋 جزئیات وظیفه:</strong></p>
        <p><strong>عنوان:</strong> ${taskData.title}</p>
        <p><strong>توضیحات:</strong> ${taskData.description || 'ندارد'}</p>
        <p><strong>اولویت:</strong> ${getPriorityText(taskData.priority)}</p>
        <p><strong>دسته‌بندی:</strong> ${getCategoryText(taskData.category)}</p>
        ${taskData.due_date ? `<p><strong>مهلت انجام:</strong> ${new Date(taskData.due_date).toLocaleDateString('fa-IR')}</p>` : ''}
        <p><strong>تاریخ ثبت:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
    </div>
    
    <div class="warning-box">
        <p><strong>💡 یادآوری:</strong> لطفاً وارد سیستم شوید و وضعیت وظیفه را به‌روزرسانی کنید.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/dashboard/tasks" class="button">
            مشاهده وظایف
        </a>
    </div>
    
    <p>موفق باشید! 💪</p>
  `;
};

// Helper functions
export const getPriorityText = (priority) => {
    const priorities = {
        'low': '🟢 کم',
        'medium': '🟡 متوسط',
        'high': '🔴 بالا',
        'urgent': '🚨 فوری'
    };
    return priorities[priority] || priority;
};

export const getCategoryText = (category) => {
    const categories = {
        'follow_up': 'پیگیری',
        'meeting': 'جلسه',
        'call': 'تماس',
        'email': 'ایمیل',
        'task': 'وظیفه',
        'other': 'سایر'
    };
    return categories[category] || category;
};

// Already exported above