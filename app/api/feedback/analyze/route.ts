import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: 'root',
    password: '1234',
    database: 'crm_system',
    timezone: '+00:00',
    charset: 'utf8mb4',
};

export async function POST(request: NextRequest) {
    try {
        const { startDate, endDate } = await request.json();

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'تاریخ شروع و پایان الزامی است' },
                { status: 400 }
            );
        }

        // اتصال به دیتابیس
        const connection = await mysql.createConnection(dbConfig);

        try {
            // دریافت بازخوردها در بازه زمانی مشخص
            const [feedbackRows] = await connection.execute(`
        SELECT 
          f.*,
          c.name as customer_name,
          c.segment as customer_segment
        FROM feedback f
        LEFT JOIN customers c ON f.customer_id = c.id
        WHERE f.created_at BETWEEN ? AND ?
        ORDER BY f.created_at DESC
      `, [startDate, endDate]);

            const feedbacks = feedbackRows as any[];

            if (feedbacks.length === 0) {
                return NextResponse.json({
                    summary: 'در بازه زمانی انتخاب شده هیچ بازخوردی یافت نشد.',
                    sentiment_analysis: {
                        positive: 0,
                        neutral: 0,
                        negative: 0
                    },
                    key_themes: [],
                    recommendations: ['بازخوردهای بیشتری از مشتریان جمع‌آوری کنید'],
                    priority_issues: [],
                    customer_satisfaction_trend: 'داده‌ای برای تحلیل روند موجود نیست.'
                });
            }

            // آماده‌سازی داده‌ها برای ارسال به هوش مصنوعی
            const feedbackData = feedbacks.map(f => ({
                type: f.type,
                title: f.title || '',
                comment: f.comment || '',
                score: f.score,
                sentiment: f.sentiment,
                category: f.category || '',
                priority: f.priority,
                channel: f.channel,
                customer_segment: f.customer_segment || 'نامشخص'
            }));

            // ارسال به هوش مصنوعی برای تحلیل
            const aiAnalysis = await analyzeWithAI(feedbackData);

            // محاسبه آمار احساسات
            const sentimentStats = calculateSentimentStats(feedbacks);

            const response = {
                summary: aiAnalysis.summary,
                sentiment_analysis: sentimentStats,
                key_themes: aiAnalysis.key_themes,
                recommendations: aiAnalysis.recommendations,
                priority_issues: aiAnalysis.priority_issues,
                customer_satisfaction_trend: aiAnalysis.customer_satisfaction_trend
            };

            return NextResponse.json(response);

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error('خطا در تحلیل بازخوردها:', error);
        return NextResponse.json(
            { error: 'خطا در تحلیل بازخوردها' },
            { status: 500 }
        );
    }
}

async function analyzeWithAI(feedbackData: any[]) {
    try {
        // آماده‌سازی پرامپت برای هوش مصنوعی
        const prompt = createAnalysisPrompt(feedbackData);

        // ارسال به هوش مصنوعی (OpenAI یا سرویس دیگر)
        const aiResponse = await callAIService(prompt);

        if (aiResponse) {
            return aiResponse;
        }
    } catch (error) {
        console.error('خطا در ارتباط با هوش مصنوعی:', error);
    }

    // در صورت عدم دسترسی به هوش مصنوعی، تحلیل محلی
    return performLocalAnalysis(feedbackData);
}

function createAnalysisPrompt(feedbackData: any[]): string {
    const feedbackTexts = feedbackData.map(f =>
        `نوع: ${f.type}, عنوان: ${f.title || 'ندارد'}, نظر: ${f.comment || 'ندارد'}, امتیاز: ${f.score || 'ندارد'}, احساس: ${f.sentiment || 'ندارد'}`
    ).join('\n');

    return `
لطفاً بازخوردهای زیر را تحلیل کنید و نتیجه را به صورت JSON برگردانید:

${feedbackTexts}

لطفاً پاسخ را دقیقاً به این فرمت JSON برگردانید:
{
  "summary": "خلاصه کلی از تحلیل بازخوردها",
  "key_themes": ["موضوع 1", "موضوع 2", "موضوع 3"],
  "recommendations": ["پیشنهاد 1", "پیشنهاد 2", "پیشنهاد 3"],
  "priority_issues": ["مسئله 1", "مسئله 2", "مسئله 3"],
  "customer_satisfaction_trend": "تحلیل روند رضایت مشتری"
}
`;
}

async function callAIService(prompt: string) {
    // اینجا می‌توانید به OpenAI، Claude، یا هر سرویس هوش مصنوعی دیگری متصل شوید
    // مثال برای OpenAI:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
    */

    // فعلاً null برمی‌گردانیم تا تحلیل محلی انجام شود
    return null;
}

function performLocalAnalysis(feedbackData: any[]) {
    const totalFeedbacks = feedbackData.length;
    const complaints = feedbackData.filter(f => f.type === 'complaint').length;
    const suggestions = feedbackData.filter(f => f.type === 'suggestion').length;
    const praises = feedbackData.filter(f => f.type === 'praise').length;

    // تحلیل موضوعات کلیدی
    const themes = extractKeyThemes(feedbackData);

    // تحلیل مسائل اولویت‌دار
    const priorityIssues = extractPriorityIssues(feedbackData);

    // تولید پیشنهادات
    const recommendations = generateRecommendations(feedbackData);

    return {
        summary: `در بازه زمانی انتخاب شده، ${totalFeedbacks} بازخورد دریافت شده است. از این تعداد ${complaints} شکایت، ${suggestions} پیشنهاد و ${praises} تشکر بوده است. تحلیل نشان می‌دهد که عمده بازخوردها در زمینه ${themes[0] || 'خدمات'} متمرکز شده‌اند.`,
        key_themes: themes,
        recommendations: recommendations,
        priority_issues: priorityIssues,
        customer_satisfaction_trend: generateSatisfactionTrend(feedbackData)
    };
}

function calculateSentimentStats(feedbacks: any[]) {
    const total = feedbacks.length;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0 };

    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;

    return {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100)
    };
}

function extractKeyThemes(feedbacks: any[]): string[] {
    const themes = new Set<string>();

    feedbacks.forEach(f => {
        if (f.category) themes.add(f.category);
        if (f.type === 'complaint') themes.add('شکایات');
        if (f.type === 'suggestion') themes.add('پیشنهادات');
        if (f.type === 'praise') themes.add('تشکرات');
        if (f.channel === 'phone') themes.add('تماس تلفنی');
        if (f.channel === 'email') themes.add('ایمیل');
        if (f.channel === 'website') themes.add('وب‌سایت');
    });

    return Array.from(themes).slice(0, 8);
}

function extractPriorityIssues(feedbacks: any[]): string[] {
    const highPriorityFeedbacks = feedbacks.filter(f =>
        f.priority === 'high' || f.sentiment === 'negative'
    );

    const issues = new Set<string>();

    highPriorityFeedbacks.forEach(f => {
        if (f.title) issues.add(f.title);
        if (f.category) issues.add(`مشکل در ${f.category}`);
    });

    const commonIssues = [
        'کیفیت خدمات نیاز به بهبود دارد',
        'زمان پاسخگویی طولانی است',
        'نیاز به آموزش بیشتر پرسنل',
        'بهبود فرآیندهای داخلی'
    ];

    return Array.from(issues).slice(0, 3).concat(
        commonIssues.slice(0, 4 - Array.from(issues).slice(0, 3).length)
    );
}

function generateRecommendations(feedbacks: any[]): string[] {
    const recommendations = [
        'بهبود سیستم پشتیبانی مشتریان',
        'ایجاد فرآیند پیگیری منظم بازخوردها',
        'آموزش تیم خدمات مشتریان',
        'بهینه‌سازی کانال‌های ارتباطی',
        'ایجاد سیستم پاداش برای بازخوردهای مثبت'
    ];

    const complaints = feedbacks.filter(f => f.type === 'complaint').length;
    const total = feedbacks.length;

    if (complaints / total > 0.3) {
        recommendations.unshift('اولویت فوری: کاهش شکایات مشتریان');
    }

    return recommendations.slice(0, 5);
}

function generateSatisfactionTrend(feedbacks: any[]): string {
    const avgScore = feedbacks
        .filter(f => f.score)
        .reduce((sum, f) => sum + f.score, 0) / feedbacks.filter(f => f.score).length;

    if (isNaN(avgScore)) {
        return 'امتیاز رضایت قابل محاسبه نیست زیرا داده‌های کافی موجود نیست.';
    }

    if (avgScore >= 4) {
        return `رضایت مشتریان در سطح عالی (${avgScore.toFixed(1)}/5) قرار دارد. روند کلی مثبت است.`;
    } else if (avgScore >= 3) {
        return `رضایت مشتریان در سطح متوسط (${avgScore.toFixed(1)}/5) است. نیاز به بهبود وجود دارد.`;
    } else {
        return `رضایت مشتریان در سطح پایین (${avgScore.toFixed(1)}/5) است. نیاز فوری به اقدامات اصلاحی.`;
    }
}