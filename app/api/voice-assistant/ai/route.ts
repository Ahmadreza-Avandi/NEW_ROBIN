import { NextRequest, NextResponse } from 'next/server';
import { processUserText, formatDataForAI } from '@/lib/voice-assistant/keywordDetector';

// افزایش timeout برای درخواست‌های طولانی
export const maxDuration = 60; // 60 ثانیه
export const dynamic = 'force-dynamic';

// تابع استخراج اسم کاربر از هیستوری
function extractUserNameFromHistory(history: any[], currentMessage: string): string | null {
  if (!history || history.length === 0) return null;
  
  // جستجو در هیستوری برای پیام‌هایی که اسم دارن
  for (const msg of history) {
    if (msg.user) {
      const userMsg = msg.user.toLowerCase();
      // الگوهای مختلف معرفی
      const patterns = [
        /اسم من (.+?)(?:\s|$)/,
        /اسمم (.+?)(?:\s|$)/,
        /نام من (.+?)(?:\s|$)/,
        /نامم (.+?)(?:\s|$)/,
        /من (.+?)(?:\s+هستم|\s+ام)/,
        /من (.+?)(?:\s|$)/
      ];
      
      for (const pattern of patterns) {
        const match = userMsg.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          // فیلتر کلمات غیرمرتبط
          if (name && name.length > 1 && !['چیه', 'چیست', 'کیه', 'کیست'].includes(name)) {
            return name;
          }
        }
      }
    }
  }
  
  // بررسی پیام فعلی هم
  const currentLower = currentMessage.toLowerCase();
  const patterns = [
    /اسم من (.+?)(?:\s|$)/,
    /اسمم (.+?)(?:\s|$)/,
    /من (.+?)(?:\s+هستم|\s+ام)/
  ];
  
  for (const pattern of patterns) {
    const match = currentLower.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name && name.length > 1 && !['چیه', 'چیست', 'کیه', 'کیست'].includes(name)) {
        return name;
      }
    }
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, history } = await req.json();
    
    // دریافت tenant_key از header یا استفاده از پیش‌فرض
    const tenantKey = req.headers.get('X-Tenant-Key') || 'rabin';

    console.log('🎤 Voice AI Request:', {
      message: userMessage.substring(0, 50) + '...',
      tenant: tenantKey,
      historyLength: history?.length || 0
    });

    // تست اتصال دیتابیس
    const { testConnection } = await import('@/lib/voice-assistant/database');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️ Database connection failed, continuing without DB data');
    }

    // پردازش متن کاربر و دریافت داده‌ها از دیتابیس
    const dbResults = await processUserText(userMessage, tenantKey);

    // فرمت کردن داده‌ها برای AI
    let contextData = '';
    if (dbResults.hasKeywords && dbResults.results) {
      contextData = formatDataForAI(dbResults.results);
      console.log('📊 Database data retrieved:', {
        keywords: dbResults.keywordsFound,
        queries: dbResults.successfulQueries
      });
    }

    // ساخت پیام سیستم با داده‌های دیتابیس
    const systemMessage = `تو رابین هستی، دستیار صوتی CRM شرکت رابین تجارت. تجارت.

🎯 وظایف تو:
- کمک به کاربران در مدیریت مشتریان، فروش، و وظایف
- پاسخ دادن به سوالات درباره داده‌های CRM با جزئیات کامل
- راهنمایی کاربران در استفاده از سیستم
- یادآوری اطلاعات از گفتگوهای قبلی
- ارائه توضیحات کامل و مفصل

📋 قوانین مهم:
- همیشه به فارسی پاسخ بده
- سیع کن اصل مطلب رو تو 1 الی سه جمله بگی

- اگر کاربر به چیزی از گفتگوی قبلی اشاره کرد، آن را به خاطر بیاور
- اگر داده‌ای از دیتابیس داری، همه جزئیات را بگو
- اگر داده‌ای نداری، صادقانه بگو و راهنمایی کامل ارائه کن
- از کلمات ساده و روان استفاده کن (برای تبدیل به صدا)
- از نمادها و ایموجی استفاده نکن

🔑 نکات مهم برای استفاده از هیستوری:
- اگر کاربر پرسید "او کیست؟" یا "آن شخص" یا "همان مشتری"، به گفتگوی قبلی رجوع کن
- اگر کاربر گفت "بیشتر بگو" یا "جزئیات بیشتر"، جزئیات بیشتری از موضوع قبلی بده
- اگر کاربر گفت "چطور؟" یا "چرا؟"، به سوال قبلی مرتبط کن
- اگر کاربر به نام شخصی اشاره کرد که قبلاً ذکر شده، از اطلاعات قبلی استفاده کن


${contextData ? `\n📊 داده‌های دیتابیس:\n${contextData}` : '\n💡 هیچ داده‌ای از دیتابیس دریافت نشد. فقط از دانش عمومی و گفتگوی قبلی استفاده کن.'}`;

    // ساخت تاریخچه گفتگو
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // اضافه کردن تاریخچه (فقط 10 گفتگوی آخر برای جلوگیری از timeout)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10); // فقط 10 گفتگوی آخر
      console.log(`📚 Adding ${recentHistory.length} previous conversations to context (total: ${history.length})`);
      recentHistory.forEach((h: any, index: number) => {
        if (h.user) {
          messages.push({ role: 'user', content: h.user });
          console.log(`  [${index + 1}] User: ${h.user.substring(0, 50)}...`);
        }
        if (h.robin) {
          messages.push({ role: 'assistant', content: h.robin });
          console.log(`  [${index + 1}] Robin: ${h.robin.substring(0, 50)}...`);
        }
      });
    } else {
      console.log('📚 No previous conversation history');
    }

    // اضافه کردن پیام فعلی
    messages.push({ role: 'user', content: userMessage });
    console.log(`💬 Current message: ${userMessage.substring(0, 100)}...`);

    // ارسال به OpenRouter AI
    const openrouterApiKey = process.env.RABIN_VOICE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    const openrouterModel = process.env.RABIN_VOICE_OPENROUTER_MODEL || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';

    if (!openrouterApiKey || openrouterApiKey === '.' || openrouterApiKey === 'your_openrouter_api_key_here') {
      console.error('❌ OpenRouter API key not configured - using simple fallback');
      
      // پاسخ ساده بدون AI ولی با استفاده از هیستوری
      let simpleResponse = '';
      
      // بررسی هیستوری برای استخراج اطلاعات
      const userName = extractUserNameFromHistory(history, userMessage);
      
      if (userName) {
        // اگر اسم کاربر رو داریم
        if (userMessage.includes('اسم') || userMessage.includes('نام')) {
          simpleResponse = `اسم شما ${userName} است.`;
        } else if (userMessage.includes('سلام') || userMessage.includes('حال')) {
          simpleResponse = `سلام ${userName}! خوبم، مرسی. چطور می‌تونم کمکت کنم؟`;
        } else {
          simpleResponse = `سلام ${userName}! `;
        }
      } else {
        simpleResponse = 'سلام! من رابین هستم. ';
      }
      
      if (dbResults.hasKeywords && dbResults.summary) {
        simpleResponse += ' ' + dbResults.summary;
      } else if (!userName) {
        simpleResponse += 'چطور می‌تونم کمکتون کنم؟';
      }
      
      return NextResponse.json({
        success: true,
        response: simpleResponse,
        hasData: dbResults.hasKeywords,
        dataCount: dbResults.results?.length || 0,
        warning: 'AI service not configured'
      });
    }

    console.log('🤖 Calling OpenRouter AI:', {
      model: openrouterModel,
      totalMessages: messages.length,
      systemMessage: 1,
      historyMessages: (history?.length || 0) * 2, // user + assistant
      currentMessage: 1,
      hasDbData: !!contextData
    });

    // اضافه کردن timeout برای OpenRouter
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ OpenRouter request timeout after 50 seconds');
      controller.abort();
    }, 50000); // 50 second timeout

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Rabin CRM Voice Assistant'
      },
      body: JSON.stringify({
        model: openrouterModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800 // افزایش برای پاسخ‌های طولانی‌تر و کامل‌تر
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ OpenRouter API Error:', errorText);
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices?.[0]?.message?.content || 'متاسفانه نتوانستم پاسخ مناسبی تولید کنم.';

    console.log('✅ AI Response generated:', response.substring(0, 50) + '...');

    return NextResponse.json({
      success: true,
      response,
      hasData: dbResults.hasKeywords,
      dataCount: dbResults.results?.length || 0,
      summary: dbResults.summary
    });

  } catch (error: any) {
    console.error('❌ Voice AI API Error:', error);
    
    let errorMessage = 'متاسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.';
    
    if (error.name === 'AbortError') {
      console.error('⏱️ Request was aborted (timeout)');
      errorMessage = 'درخواست طولانی شد. لطفاً دوباره تلاش کنید.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        response: errorMessage
      },
      { status: 500 }
    );
  }
}
