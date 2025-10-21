const express = require('express');
const axios = require('axios');
const actions = require('../utils/actions');
const { enrichUserMessage, logEnrichmentResults } = require('../middleware/dataEnrichment');
const { createLogger } = require('../utils/logger');

const logger = createLogger('AI_ROUTE');
const router = express.Router();

// پرامپت سیستم بهبود یافته برای پاسخ مستقیم
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

## نحوه استفاده از داده‌های سیستم:
وقتی اطلاعات سیستم در پیام کاربر موجود باشه (بین [اطلاعات سیستم: ...]):
1. این داده‌ها رو به عنوان منبع اصلی اطلاعات استفاده کن
2. داده‌ها رو تحلیل کن و خلاصه مفیدی ارائه بده
3. اگر داده خاصی نیست، بگو که اطلاعاتی یافت نشد
4. عددها رو با کاما فرمت کن (مثل 1,250,000)
5. تاریخ‌ها رو به شمسی تبدیل کن

## مثال‌های پاسخ:
- "تعداد مشتریان فعال: 25 نفر. آخرین مشتری اضافه شده: شرکت پارس تک"
- "فروش امروز: 3 معامله به ارزش 2,500,000 تومان"
- "احمد 5 وظیفه داره که 2 تاش اولویت بالا هست"

## اگر داده‌ای نیست:
"متأسفانه اطلاعات مربوط به [موضوع] در دسترس نیست. می‌تونم در چیز دیگه‌ای کمکت کنم؟"

همیشه آماده کمک و راهنمایی هستی!`;
// پرامپت بهبود یافته برای تشخیص قصد
const INTENT_PROMPT = `تو باید قصد کاربر رو از متن تشخیص بدی. اگر متن درخواست مشخصی نداره یا فقط سوال عمومی هست، "null" برگردان.

دستورات قابل تشخیص:
- گزارش‌های شخصی: "گزارش خودم", "کارهای من", "فعالیت‌های من"
- گزارش همکاران: "گزارش احمد", "کار علی", "فعالیت سارا", "وظایف محمد"
- گزارشات کلی: "گزارشات امروز", "همه گزارشات", "کل فعالیت‌ها"
- تحلیل فروش: "فروش امروز", "فروش هفته", "فروش ماه", "درآمد"
- بازخورد مشتریان: "نظرات مشتریان", "بازخورد", "رضایت"
- وظایف و یادآوری: "یادآوری وظایف", "کارهای باقی‌مانده"
- ارسال فایل: "ارسال گزارش", "فایل برای احمد", "سند برای مدیر"

فقط اگر متن شامل درخواست مشخص باشه، اون رو برگردان. در غیر این صورت "null".

متن کاربر:`;

// Environment configuration
const AI_CONFIG = {
  OPENROUTER_API_KEY: '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',
  OPENROUTER_MODEL: 'anthropic/claude-3-haiku'
};

async function callOpenRouter(messages) {
  try {
    console.log('🔑 OpenRouter API Key:', AI_CONFIG.OPENROUTER_API_KEY ? 'Present' : 'Missing');
    console.log('🤖 OpenRouter Model:', AI_CONFIG.OPENROUTER_MODEL);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: AI_CONFIG.OPENROUTER_MODEL,
      messages: messages
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dastyar Robin'
      },
      timeout: 30000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('خطا در درخواست به OpenRouter:', error.message);
    if (error.response) {
      console.error('OpenRouter API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ENOTFOUND') {
      console.error('مشکل اتصال به اینترنت یا DNS');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('اتصال رد شد');
    }
    throw new Error('خطا در برقراری ارتباط با هوش مصنوعی');
  }
}

// مسیر برای پردازش پیام کاربر
router.post('/process', enrichUserMessage, logEnrichmentResults, async (req, res) => {
  try {
    const { userMessage, enrichedMessage, hasSystemData, history = [] } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'پیام کاربر الزامی است' });
    }

    // استفاده از پیام غنی‌شده اگر داده‌های سیستم موجود باشد
    const messageToProcess = hasSystemData ? enrichedMessage : userMessage;

    logger.aiRequest(messageToProcess, hasSystemData);
    
    // لاگ اضافی برای دیباگ
    if (hasSystemData) {
      logger.info('📊 Database data integrated into AI request', {
        originalLength: userMessage.length,
        enrichedLength: enrichedMessage.length,
        databaseRecords: req.databaseData?.successfulQueries || 0
      });
    }

    // ساخت پیام‌ها برای درخواست مستقیم
    const directMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.flatMap(h => [
        { role: 'user', content: h.user },
        { role: 'assistant', content: h.robin }
      ]),
      { role: 'user', content: messageToProcess }
    ];

    // ساخت پیام‌ها برای تشخیص قصد
    const intentMessages = [
      { role: 'system', content: `${INTENT_PROMPT} ${userMessage}` }
    ];

    // درخواست‌های موازی
    const [directResponse, intentResponse] = await Promise.all([
      callOpenRouter(directMessages),
      callOpenRouter(intentMessages)
    ]);

    logger.debug(`🎯 Intent detected: ${intentResponse}`);

    // بررسی و اجرای اکشن
    let actionResult = '';
    if (intentResponse && intentResponse.trim() !== 'null' && intentResponse !== 'نامشخص' && actions[intentResponse.trim()]) {
      logger.info(`⚡ Executing action: ${intentResponse.trim()}`);
      actionResult = actions[intentResponse.trim()]();
    } else if (intentResponse && intentResponse.trim() === 'null') {
      logger.debug('No specific action required');
    }

    // ادغام پاسخ نهایی
    let finalResponse = directResponse;
    if (actionResult) {
      finalResponse = `${directResponse}\n${actionResult}`;
    }

    logger.aiResponse(finalResponse.length, intentResponse);

    res.json({
      response: finalResponse,
      intent: intentResponse,
      actionExecuted: !!actionResult,
      databaseData: req.databaseData || null,
      hasSystemData: hasSystemData || false,
      enrichedMessage: hasSystemData ? enrichedMessage : null,
      originalMessage: userMessage,
      processingInfo: {
        keywordsFound: req.databaseData?.keywordsFound || 0,
        successfulQueries: req.databaseData?.successfulQueries || 0,
        failedQueries: req.databaseData?.failedQueries || 0
      }
    });

  } catch (error) {
    logger.error('خطا در پردازش پیام', { error: error.message });
    res.status(500).json({
      error: 'متأسفم، مشکلی پیش آمد. لطفاً دوباره امتحان کنید.'
    });
  }
});

module.exports = router;