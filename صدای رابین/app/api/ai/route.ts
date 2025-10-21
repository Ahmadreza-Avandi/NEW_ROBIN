import { NextRequest, NextResponse } from 'next/server';
import { processUserText, formatDataForAI } from '../../../lib/keywordDetector';
import { testConnection } from '@/lib/database';

// پرامپت سیستم بهبود یافته
const SYSTEM_PROMPT = `تو رابین هستی، دستیار هوشمند شرکت رابین. توسط احمدرضا آوندی توسعه داده شدی و مدیر عامل شرکت مهندس کریمی هست.

## شخصیت و نحوه صحبت:
- صمیمی، دوستانه و غیررسمی صحبت کن
- همیشه به زبان فارسی پاسخ بده
- پاسخ‌ها رو کوتاه، مفید و قابل فهم نگه دار
- فقط در اولین مکالمه سلام کن، بعدش مستقیم جواب بده
- اگر اسم کاربر رو نمی‌دونی، بپرس

## دسترسی‌های تو:
- اطلاعات کامل همکاران، مشتریان و فعالیت‌های شرکت
- گزارشات فروش، معاملات و درآمد
- وظایف و پروژه‌های در حال انجام
- بازخوردهای مشتریان و نظرسنجی‌ها
- رویدادهای تقویم و جلسات
- اسناد و مدارک شرکت
- گزارشات روزانه همکاران

    باید تا جایی که میشه به همه سوالات پاسخ بدی چون تیم فروش و مدیرعامل به تو دسترسی دارند

## نحوه استفاده از داده‌های سیستم:
وقتی اطلاعات سیستم در پیام کاربر موجود باشه (بین [اطلاعات سیستم: ...]):
1. این داده‌ها رو به عنوان منبع اصلی اطلاعات استفاده کن
2. داده‌ها رو تحلیل کن و خلاصه مفیدی ارائه بده
3. اگر داده خاصی نیست، بگو که اطلاعاتی یافت نشد
4. عددها رو با کاما فرمت کن (مثل 1,250,000)
5. اسامی و جزئیات مهم رو ذکر کن

همیشه آماده کمک و راهنمایی هستی!`;

// Environment configuration
const AI_CONFIG = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 's',
  // استفاده از مدل بدون تگ فکری - گزینه‌های پیشنهادی:
  // - google/gemini-2.0-flash-exp:free (سریع، رایگان، بدون تگ فکری)
  // - meta-llama/llama-3.2-3b-instruct:free (سریع و کوچک)
  // - anthropic/claude-3-haiku (پولی ولی عالی)
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free'
};

// تابع فراخوانی OpenRouter API با retry mechanism
async function callOpenRouter(messages: any[], retryCount = 0): Promise<string> {
  const maxRetries = 3;
  
  try {
    console.log('🤖 Calling OpenRouter API... (attempt', retryCount + 1, 'of', maxRetries + 1, ')');
    console.log('🔑 Using API Key:', AI_CONFIG.OPENROUTER_API_KEY.substring(0, 20) + '...');
    console.log('🤖 Using Model:', AI_CONFIG.OPENROUTER_MODEL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Dastyar Robin'
        },
        body: JSON.stringify({
          model: AI_CONFIG.OPENROUTER_MODEL,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 OpenRouter response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter error response:', errorText);
        
        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < maxRetries) {
          console.log(`⏳ Retrying after ${(retryCount + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return callOpenRouter(messages, retryCount + 1);
        }
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter response received');

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter');
      }

      let content = data.choices[0].message.content;
      
      // حذف تگ‌های فکری و محتوای داخل آنها
      // برخی مدل‌ها مثل qwen از <think> استفاده می‌کنند
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
      content = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      
      // حذف متن‌های انگلیسی که توضیح فرآیند فکری هستند
      // اگر پاسخ شامل جملات انگلیسی طولانی باشه، احتمالاً فکر داخلی مدله
      const lines = content.split('\n');
      const persianLines = lines.filter((line: string) => {
        const trimmed = line.trim();
        // نگه داشتن خطوط خالی و خطوطی که فارسی دارند
        if (!trimmed) return false;
        // اگر بیشتر از 80% خط انگلیسی باشه و شامل کلمات کلیدی فکری باشه، حذفش کن
        const hasThinkingKeywords = /\b(okay|let me|check|need to|should|according to|first|also|since|maybe|structure)\b/i.test(trimmed);
        const persianChars = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
        const totalChars = trimmed.length;
        const persianRatio = persianChars / totalChars;
        
        // اگر خط شامل کلمات فکری باشه و فارسی کمی داشته باشه، حذفش کن
        if (hasThinkingKeywords && persianRatio < 0.3) {
          return false;
        }
        
        return true;
      });
      
      content = persianLines.join('\n').trim();
      
      // اگر پاسخ خالی شد، از پاسخ اصلی استفاده کن
      if (!content) {
        content = data.choices[0].message.content;
      }
      
      console.log('🧹 Cleaned response length:', content.length);
      
      return content;
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (fetchError.name === 'AbortError') {
        console.error('❌ Request timeout');
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying after timeout...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return callOpenRouter(messages, retryCount + 1);
        }
        throw new Error('زمان انتظار برای پاسخ هوش مصنوعی به پایان رسید');
      }
      
      // Handle network errors
      if (fetchError.message.includes('fetch failed') || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        console.error('❌ Network error:', fetchError.message);
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying after network error...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return callOpenRouter(messages, retryCount + 1);
        }
        throw new Error('خطا در اتصال به سرور هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
      
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('❌ OpenRouter API Error:', error.message);
    console.error('❌ Error details:', error);
    
    // Return a fallback response instead of throwing
    if (retryCount >= maxRetries) {
      console.log('⚠️ Max retries reached, returning fallback response');
      return 'متأسفم، در حال حاضر نمی‌توانم به سرور هوش مصنوعی متصل شوم. لطفاً بعداً دوباره تلاش کنید.';
    }
    
    throw new Error('خطا در برقراری ارتباط با هوش مصنوعی: ' + error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, history = [] } = await request.json();

    if (!userMessage) {
      return NextResponse.json({ error: 'پیام کاربر الزامی است' }, { status: 400 });
    }

    console.log('🎯 AI Request received:', userMessage);

    // تست اتصال دیتابیس (اختیاری - نباید مانع کار سیستم بشه)
    let enrichmentResult: any = { hasKeywords: false };
    let messageToProcess = userMessage;
    let hasSystemData = false;

    try {
      const dbConnected = await testConnection();
      
      if (dbConnected) {
        console.log('✅ Database connected, processing keywords...');

        // پردازش متن و دریافت داده‌ها
        enrichmentResult = await processUserText(userMessage);

        if (enrichmentResult.hasKeywords && enrichmentResult.successfulQueries > 0) {
          console.log(`📊 Data enrichment successful: ${enrichmentResult.successfulQueries} queries`);

          // فرمت کردن داده‌ها برای AI
          const formattedData = formatDataForAI(enrichmentResult.results);
          messageToProcess = `${userMessage}\n\n[اطلاعات سیستم:\n${formattedData}]`;
          hasSystemData = true;

          console.log('📋 Message enriched with database context');
        } else {
          console.log('ℹ️ No relevant data found or no keywords detected');
        }
      } else {
        console.warn('⚠️ Database connection failed, proceeding without data enrichment');
      }
    } catch (dbError: any) {
      console.error('⚠️ Database error (non-critical):', dbError.message);
      console.log('➡️ Continuing without database data...');
      // ادامه بدون دیتابیس - این نباید مانع کار سیستم بشه
    }

    // ساخت پیام‌ها برای AI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.flatMap((h: any) => [
        { role: 'user', content: h.user },
        { role: 'assistant', content: h.robin }
      ]),
      { role: 'user', content: messageToProcess }
    ];

    // فراخوانی AI
    const aiResponse = await callOpenRouter(messages);

    console.log('✅ AI Response generated');

    return NextResponse.json({
      response: aiResponse,
      intent: null,
      actionExecuted: enrichmentResult.hasKeywords,
      hasSystemData: hasSystemData,
      originalMessage: userMessage,
      enrichedMessage: hasSystemData ? messageToProcess : null,
      databaseData: enrichmentResult,
      processingInfo: {
        keywordsFound: enrichmentResult.keywordsFound || 0,
        successfulQueries: enrichmentResult.successfulQueries || 0,
        failedQueries: enrichmentResult.failedQueries || 0
      }
    });

  } catch (error: any) {
    console.error('❌ AI API Error:', error.message);
    console.error('❌ Full error:', error);

    return NextResponse.json({
      response: 'متأسفم، مشکلی در پردازش درخواست شما پیش آمد. لطفاً دوباره تلاش کنید.',
      intent: null,
      actionExecuted: false,
      hasSystemData: false,
      error: error.message
    }, { status: 500 });
  }
}