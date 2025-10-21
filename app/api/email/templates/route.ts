import { NextResponse } from 'next/server';

// Define email template types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for email templates
const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'ایمیل خوش‌آمدگویی',
    subject: 'به سیستم CRM خوش آمدید!',
    body: `
      <h2>به خانواده بزرگ ما خوش آمدید! 🎉</h2>
      
      <p>سلام و احترام،</p>
      
      <p>از اینکه به پلتفرم مدیریت ارتباط با مشتری ما پیوستید، بسیار خوشحالیم. این سیستم به شما کمک می‌کند تا:</p>
      
      <div class="highlight-box">
        <p><strong>✨ مزایای استفاده از سیستم:</strong></p>
        <p>• مدیریت حرفه‌ای اطلاعات مشتریان</p>
        <p>• پیگیری دقیق فرآیندهای فروش</p>
        <p>• تحلیل هوشمند داده‌ها</p>
        <p>• ارتباط مؤثر با تیم</p>
      </div>
      
      <p>برای شروع کار با سیستم، روی دکمه زیر کلیک کنید:</p>
      
      <a href="{{loginLink}}" class="button">ورود به سیستم</a>
      
      <p>اگر سوالی دارید، تیم پشتیبانی ما آماده کمک به شماست.</p>
      
      <p>موفق و پیروز باشید! 🚀</p>
    `,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'بازنشانی رمز عبور',
    subject: 'درخواست بازنشانی رمز عبور',
    body: `
      <h2>درخواست بازنشانی رمز عبور 🔐</h2>
      
      <p>سلام،</p>
      
      <p>درخواستی برای بازنشانی رمز عبور حساب کاربری شما دریافت شده است.</p>
      
      <div class="highlight-box">
        <p><strong>⚠️ نکته امنیتی:</strong></p>
        <p>اگر این درخواست را شما ارسال نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید و رمز عبور شما تغییر نخواهد کرد.</p>
      </div>
      
      <p>برای بازنشانی رمز عبور، روی دکمه زیر کلیک کنید:</p>
      
      <a href="{{resetLink}}" class="button">بازنشانی رمز عبور</a>
      
      <p><strong>توجه:</strong> این لینک تنها برای 24 ساعت معتبر است.</p>
      
      <p>با تشکر از همراهی شما</p>
    `,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'اطلاع‌رسانی فعالیت جدید',
    subject: 'فعالیت جدید در سیستم CRM',
    body: `
      <h2>فعالیت جدید ثبت شد 📋</h2>
      
      <p>سلام {{name}}،</p>
      
      <p>فعالیت جدیدی در سیستم CRM برای شما ثبت شده است:</p>
      
      <div class="highlight-box">
        <p><strong>جزئیات فعالیت:</strong></p>
        <p><strong>نوع:</strong> {{activityType}}</p>
        <p><strong>عنوان:</strong> {{activityTitle}}</p>
        <p><strong>تاریخ:</strong> {{activityDate}}</p>
        <p><strong>وضعیت:</strong> {{activityStatus}}</p>
      </div>
      
      <p>برای مشاهده جزئیات بیشتر و مدیریت فعالیت‌ها، به سیستم مراجعه کنید:</p>
      
      <a href="{{dashboardLink}}" class="button">مشاهده داشبورد</a>
      
      <p>موفق باشید! 💪</p>
    `,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'گزارش هفتگی',
    subject: 'گزارش عملکرد هفتگی شما',
    body: `
      <h2>گزارش هفتگی عملکرد 📊</h2>
      
      <p>سلام {{name}}،</p>
      
      <p>گزارش عملکرد هفته گذشته شما آماده شده است:</p>
      
      <div class="highlight-box">
        <p><strong>📈 آمار این هفته:</strong></p>
        <p>• تعداد مشتریان جدید: {{newCustomers}}</p>
        <p>• فعالیت‌های انجام شده: {{completedActivities}}</p>
        <p>• معاملات بسته شده: {{closedDeals}}</p>
        <p>• میزان فروش: {{salesAmount}} تومان</p>
      </div>
      
      <p>عملکرد شما در این هفته {{performance}} بوده است. برای بهبود نتایج، پیشنهادهای زیر را در نظر بگیرید:</p>
      
      <p>• تماس بیشتر با مشتریان بالقوه</p>
      <p>• پیگیری منظم معاملات در حال انجام</p>
      <p>• استفاده از ابزارهای تحلیلی سیستم</p>
      
      <a href="{{reportsLink}}" class="button">مشاهده گزارش کامل</a>
      
      <p>به امید موفقیت‌های بیشتر! 🎯</p>
    `,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'دعوت به رویداد',
    subject: 'دعوت به {{eventName}}',
    body: `
      <h2>دعوت ویژه به رویداد 🎪</h2>
      
      <p>سلام {{name}}،</p>
      
      <p>با کمال میل شما را به رویداد ویژه‌ای دعوت می‌کنیم:</p>
      
      <div class="highlight-box">
        <p><strong>🎉 جزئیات رویداد:</strong></p>
        <p><strong>نام رویداد:</strong> {{eventName}}</p>
        <p><strong>تاریخ:</strong> {{eventDate}}</p>
        <p><strong>زمان:</strong> {{eventTime}}</p>
        <p><strong>مکان:</strong> {{eventLocation}}</p>
        <p><strong>نوع:</strong> {{eventType}}</p>
      </div>
      
      <p>این رویداد فرصت عالی برای:</p>
      <p>• آشنایی با ویژگی‌های جدید سیستم</p>
      <p>• تبادل تجربه با سایر کاربران</p>
      <p>• دریافت آموزش‌های تخصصی</p>
      <p>• شبکه‌سازی حرفه‌ای</p>
      
      <a href="{{registrationLink}}" class="button">ثبت‌نام در رویداد</a>
      
      <p>منتظر حضور گرم شما هستیم! 🤝</p>
    `,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// GET handler to retrieve all email templates
export async function GET() {
  return NextResponse.json(emailTemplates);
}

// POST handler to create a new email template
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.subject || !body.body) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required fields' },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: body.name,
      subject: body.subject,
      body: body.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real application, you would save this to a database
    emailTemplates.push(newTemplate);

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}