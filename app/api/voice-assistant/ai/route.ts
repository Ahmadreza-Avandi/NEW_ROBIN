import { NextRequest, NextResponse } from 'next/server';
import { processUserText, formatDataForAI } from '@/lib/voice-assistant/keywordDetector';

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
    const systemMessage = `تو رابین هستی، دستیار هوشمند صوتی CRM شرکت رابین تجارت.

🎯 وظایف تو:
- کمک به کاربران در مدیریت مشتریان، فروش، و وظایف
- پاسخ دادن به سوالات درباره داده‌های CRM
- راهنمایی کاربران در استفاده از سیستم
- یادآوری اطلاعات از گفتگوهای قبلی

📋 قوانین مهم:
- همیشه به فارسی پاسخ بده
- پاسخ‌هایت کوتاه و مفید باشد (حداکثر 2-3 جمله برای پخش صوتی)
- از گفتگوهای قبلی برای درک بهتر سوال استفاده کن
- اگر کاربر به چیزی از گفتگوی قبلی اشاره کرد، آن را به خاطر بیاور
- اگر داده‌ای از دیتابیس داری، از آن استفاده کن
- اگر داده‌ای نداری، صادقانه بگو و راهنمایی کن
- از کلمات ساده و روان استفاده کن (برای تبدیل به صدا)
- از نمادها و ایموجی استفاده نکن

🔑 نکات مهم برای استفاده از هیستوری:
- اگر کاربر پرسید "او کیست؟" یا "آن شخص" یا "همان مشتری"، به گفتگوی قبلی رجوع کن
- اگر کاربر گفت "بیشتر بگو" یا "جزئیات بیشتر"، جزئیات بیشتری از موضوع قبلی بده
- اگر کاربر گفت "چطور؟" یا "چرا؟"، به سوال قبلی مرتبط کن
- اگر کاربر به نام شخصی اشاره کرد که قبلاً ذکر شده، از اطلاعات قبلی استفاده کن

مثال استفاده از هیستوری:
کاربر: "احمدرضا آوندی رو می‌شناسی?"
رابین: "بله، احمدرضا آوندی یکی از همکاران ماست با نقش agent"
کاربر: "چه کارهایی انجام داده؟"
رابین: [باید به احمدرضا آوندی از گفتگوی قبلی اشاره کنه]

${contextData ? `\n📊 داده‌های دیتابیس:\n${contextData}` : '\n💡 هیچ داده‌ای از دیتابیس دریافت نشد. فقط از دانش عمومی و گفتگوی قبلی استفاده کن.'}`;

    // ساخت تاریخچه گفتگو
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // اضافه کردن تاریخچه
    if (history && Array.isArray(history)) {
      console.log(`📚 Adding ${history.length} previous conversations to context`);
      history.forEach((h: any, index: number) => {
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

    if (!openrouterApiKey || openrouterApiKey === '.') {
      console.error('❌ OpenRouter API key not configured');
      return NextResponse.json({
        success: true,
        response: 'سلام! من رابین هستم. متاسفانه در حال حاضر سرویس هوش مصنوعی در دسترس نیست. لطفاً با مدیر سیستم تماس بگیرید.',
        hasData: dbResults.hasKeywords,
        dataCount: dbResults.results?.length || 0
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
        max_tokens: 500
      })
    });

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
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        response: 'متاسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.'
      },
      { status: 500 }
    );
  }
}
