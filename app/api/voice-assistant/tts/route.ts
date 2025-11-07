import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'متن الزامی است' },
        { status: 400 }
      );
    }

    const processedText = text.trim();

    console.log('🎤 TTS Request for text:', processedText.substring(0, 100) + '...');
    console.log('📏 Text length:', processedText.length);

    // استفاده از API جدید
    const ttsUrl = process.env.RABIN_VOICE_TTS_API_URL || 
                   process.env.TTS_API_URL || 
                   'https://api.ahmadreza-avandi.ir/text-to-speech';

    console.log('🌐 Sending request to TTS API:', ttsUrl);

    const requestBody = {
      text: processedText,
      speaker: "3"
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const ttsResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    console.log('📡 TTS API Response Status:', ttsResponse.status, ttsResponse.statusText);

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ TTS API Error Response:', errorText);
      throw new Error(`TTS API error: ${ttsResponse.status} - ${errorText}`);
    }

    const data = await ttsResponse.json();
    console.log('✅ TTS API Response:', JSON.stringify(data, null, 2));

    // ساختار جدید پاسخ API
    if (data && data.success && data.audioUrl) {
      console.log('🔗 Audio URL:', data.audioUrl);
      console.log('🔗 Direct URL:', data.directUrl);

      return NextResponse.json({
        success: true,
        audioUrl: data.audioUrl,
        directUrl: data.directUrl,
        checksum: data.checksum,
        base64: data.base64 || null,
        requestId: data.requestId,
        shamsiDate: data.shamsiDate
      });
    } else {
      console.error('❌ Invalid TTS response structure:', data);
      throw new Error(data.error || 'پاسخ نامعتبر از سرور TTS');
    }

  } catch (error: any) {
    console.error('❌ TTS Error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Return more specific error messages
    let errorMessage = 'خطا در تبدیل متن به صدا';
    let errorDetails = error.message;

    if (error.message.includes('timeout') || error.name === 'AbortError') {
      errorMessage = 'زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.';
      errorDetails = 'Request timeout after 30 seconds';
    } else if (error.message.includes('500')) {
      errorMessage = 'خطا در سرور TTS. لطفاً متن کوتاه‌تری امتحان کنید.';
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      errorMessage = 'خطا در اتصال به سرور TTS. لطفاً بعداً تلاش کنید.';
      errorDetails = 'Cannot connect to TTS API server';
      console.error('🔥 Network Error Details:');
      console.error('   - TTS API may be down or unreachable');
      console.error('   - Check firewall/network settings');
    } else if (error.message.includes('network')) {
      errorMessage = 'خطا در اتصال به اینترنت';
    }

    console.error('💬 User-facing error:', errorMessage);
    console.error('🔧 Technical details:', errorDetails);

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint برای health check
export async function GET(req: NextRequest) {
  try {
    const ttsApiUrl = process.env.RABIN_VOICE_TTS_API_URL || 
                      process.env.TTS_API_URL || 
                      'https://api.ahmadreza-avandi.ir/text-to-speech';

    return NextResponse.json({
      success: true,
      status: 'TTS API is ready',
      endpoint: ttsApiUrl,
      configured: !!process.env.RABIN_VOICE_TTS_API_URL
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
