// Audio Intelligence Service - Complete voice interaction system
import { enhancedPersianSpeechRecognition } from './enhanced-persian-speech-recognition';
import { advancedSpeechToText } from './advanced-speech-to-text';
import { talkBotTTS } from './talkbot-tts';
import { sahabTTSV2 } from './sahab-tts-v2';

export interface VoiceCommand {
    text: string;
    type: 'report' | 'feedback_analysis' | 'sales_analysis' | 'profitability_analysis' | 'document_email' | 'general' | 'unknown';
    employeeName?: string;
    timePeriod?: string;
    fileName?: string;
    confidence: number;
}

export interface AIResponse {
    text: string;
    type: 'success' | 'error' | 'info';
    data?: any;
}

export class AudioIntelligenceService {
    private isProcessing = false;
    private isSpeaking = false;
    private currentSession: string | null = null;

    constructor() {
        console.log('🎯 Audio Intelligence Service initialized');
    }

    // Helper method to find authentication token
    private findAuthToken(): string | null {
        // Try different methods to get authentication token
        let token = null;

        // Method 1: Check cookies with different possible names
        const cookies = document.cookie.split('; ');
        const possibleTokenNames = ['auth-token', 'token', 'authToken', 'jwt', 'access_token'];

        for (const tokenName of possibleTokenNames) {
            const cookieValue = cookies.find(row => row.startsWith(`${tokenName}=`))?.split('=')[1];
            if (cookieValue) {
                token = cookieValue;
                console.log(`✅ Found token in cookie: ${tokenName}`);
                break;
            }
        }

        // Method 2: Check localStorage
        if (!token) {
            for (const tokenName of possibleTokenNames) {
                const localStorageValue = localStorage.getItem(tokenName);
                if (localStorageValue) {
                    token = localStorageValue;
                    console.log(`✅ Found token in localStorage: ${tokenName}`);
                    break;
                }
            }
        }

        // Method 3: Check sessionStorage
        if (!token) {
            for (const tokenName of possibleTokenNames) {
                const sessionStorageValue = sessionStorage.getItem(tokenName);
                if (sessionStorageValue) {
                    token = sessionStorageValue;
                    console.log(`✅ Found token in sessionStorage: ${tokenName}`);
                    break;
                }
            }
        }

        console.log('🔍 Available cookies:', document.cookie);
        console.log('🔍 Token found:', token ? 'Yes' : 'No');

        return token;
    }

    // Main method to handle complete voice interaction
    async handleVoiceInteraction(): Promise<{
        transcript: string;
        response: AIResponse;
        success: boolean;
    }> {
        if (this.isProcessing) {
            throw new Error('در حال حاضر درخواست دیگری در حال پردازش است');
        }

        this.isProcessing = true;
        this.currentSession = Date.now().toString();

        try {
            console.log('🎤 شروع تعامل صوتی...');

            // Step 1: Listen to user voice
            const transcript = await this.listenToUser();
            console.log('📝 متن دریافت شده:', transcript);

            // Step 2: Analyze the command
            const command = this.analyzeVoiceCommand(transcript);
            console.log('🔍 دستور تحلیل شده:', command);

            // Step 3: Process the command
            const response = await this.processCommand(command);
            console.log('💬 پاسخ تولید شده:', response.text.substring(0, 100) + '...');

            // Step 4: Speak the response
            await this.speakResponse(response.text);

            return {
                transcript,
                response,
                success: true
            };

        } catch (error) {
            console.error('❌ خطا در تعامل صوتی:', error);

            const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
            const errorResponse: AIResponse = {
                text: `متأسفم، خطایی رخ داد: ${errorMessage}`,
                type: 'error'
            };

            // Try to speak the error message
            try {
                await this.speakResponse(errorResponse.text);
            } catch (ttsError) {
                console.error('❌ خطا در خواندن پیام خطا:', ttsError);
            }

            return {
                transcript: '',
                response: errorResponse,
                success: false
            };

        } finally {
            this.isProcessing = false;
            this.currentSession = null;
        }
    }

    // Listen to user voice input
    private async listenToUser(): Promise<string> {
        try {
            // Try advanced speech-to-text first (more reliable)
            if (advancedSpeechToText.isSupported()) {
                console.log('🎤 Using advanced speech-to-text service...');
                return await advancedSpeechToText.recordAndConvert(30000); // 30 seconds max
            }

            // Fallback to Web Speech API
            console.log('🎤 Falling back to Web Speech API...');
            const microphoneOk = await enhancedPersianSpeechRecognition.testMicrophone();
            if (!microphoneOk) {
                console.warn('میکروفون در دسترس نیست، استفاده از ورودی دستی');
                return await enhancedPersianSpeechRecognition.getManualInput();
            }

            return await enhancedPersianSpeechRecognition.startListening();
        } catch (error) {
            console.error('خطا در تشخیص گفتار:', error);

            // Final fallback to manual input
            console.log('استفاده از ورودی دستی به عنوان fallback نهایی');
            return await enhancedPersianSpeechRecognition.getManualInput();
        }
    }

    // Analyze voice command to determine type and extract information
    private analyzeVoiceCommand(text: string): VoiceCommand {
        // Remove wake phrase remnants if present
        const cleanText = text
            .toLowerCase()
            .replace(/\bرابین\s*درود\b/gi, '')
            .replace(/\bروبین\s*درود\b/gi, '')
            .replace(/\brobin\s*dorood?\b/gi, '')
            .trim();
        console.log('🔍 تحلیل دستور صوتی:', cleanText);

        // First check for document email commands (highest priority)
        const documentEmailKeywords = [
            'ارسال فایل', 'فایل ارسال کن', 'سند ارسال کن', 'ارسال سند',
            'فایل بفرست', 'سند بفرست', 'فایل رو برای', 'سند رو برای',
            'ارسال فایل برای', 'فایل برای', 'سند برای', 'بفرست برای',
            'send file', 'email file', 'فایل نمونه', 'سند نمونه'
        ];
        const hasDocumentEmailKeyword = documentEmailKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasDocumentEmailKeyword) {
            console.log('✅ دستور ارسال فایل تشخیص داده شد');
            const employeeName = this.extractEmployeeName(text);
            const fileName = this.extractFileName(text);
            const command: VoiceCommand = {
                text,
                type: 'document_email',
                employeeName,
                fileName,
                confidence: (employeeName && fileName) ? 0.98 : (employeeName || fileName) ? 0.85 : 0.7
            };
            console.log('📧 دستور نهایی (ارسال فایل):', command);
            return command;
        }

        // Then check for report commands
        const reportKeywords = ['گزارش', 'report', 'گزارش کار', 'کارکرد'];
        const hasReportKeyword = reportKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasReportKeyword) {
            console.log('✅ دستور گزارش تشخیص داده شد');

            // Extract employee name with high priority
            let employeeName = this.extractEmployeeName(text);
            console.log('📝 نام کارمند استخراج شده:', employeeName);

            // اگر نام خاصی ذکر شده، مستقیماً برگردان
            if (employeeName && employeeName !== 'current_user') {
                const command: VoiceCommand = {
                    text,
                    type: 'report',
                    employeeName,
                    confidence: 0.98 // اطمینان بالا برای گزارش با نام مشخص
                };
                console.log('� دستور نهایی (گزارش شخص):', command);
                return command;
            }

            // اگر اشاره به خود کاربر شده
            if (cleanText.includes('خودم') || cleanText.includes('من') || cleanText.includes('خود')) {
                const command: VoiceCommand = {
                    text,
                    type: 'report',
                    employeeName: 'current_user',
                    confidence: 0.95
                };
                console.log('� دستور نهایی (گزارش شخصی):', command);
                return command;
            }

            // اگر فقط کلمه گزارش آمده، فرض می‌کنیم برای خود کاربر است
            const command: VoiceCommand = {
                text,
                type: 'report',
                employeeName: 'current_user',
                confidence: 0.85
            };
            console.log('🔍 دستور نهایی (گزارش پیش‌فرض):', command);
            return command;
        }

        // Check for feedback analysis commands
        const feedbackKeywords = ['تحلیل بازخورد', 'بازخورد', 'نظرات مشتری', 'feedback analysis', 'تحلیل نظرات', 'نظرات'];
        const hasFeedbackKeyword = feedbackKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasFeedbackKeyword) {
            const timePeriod = this.extractTimePeriod(text);
            return {
                text,
                type: 'feedback_analysis',
                timePeriod,
                confidence: timePeriod ? 0.9 : 0.7
            };
        }

        // Check for sales analysis commands
        const salesKeywords = ['تحلیل فروش', 'فروش', 'sales analysis', 'آمار فروش', 'گزارش فروش'];
        const hasSalesKeyword = salesKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasSalesKeyword) {
            const timePeriod = this.extractTimePeriod(text);
            return {
                text,
                type: 'sales_analysis',
                timePeriod,
                confidence: timePeriod ? 0.9 : 0.7
            };
        }

        // Check for profitability analysis commands
        const profitabilityKeywords = ['تحلیل سودآوری', 'سودآوری', 'profitability analysis', 'تحلیل سود', 'حاشیه سود', 'سود خالص', 'سود'];
        const hasProfitabilityKeyword = profitabilityKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasProfitabilityKeyword) {
            const timePeriod = this.extractTimePeriod(text);
            return {
                text,
                type: 'profitability_analysis',
                timePeriod,
                confidence: timePeriod ? 0.9 : 0.7
            };
        }



        // Check for general questions
        const questionKeywords = ['چی', 'چه', 'کی', 'کجا', 'چرا', 'چگونه', 'آیا', '؟'];
        const hasQuestionKeyword = questionKeywords.some(keyword =>
            cleanText.includes(keyword)
        );

        if (hasQuestionKeyword) {
            return {
                text,
                type: 'general',
                confidence: 0.8
            };
        }

        // Unknown command
        return {
            text,
            type: 'unknown',
            confidence: 0.3
        };
    }

    // Extract employee name from voice command - بهبود یافته
    private extractEmployeeName(text: string): string | undefined {
        const cleanText = text.toLowerCase().trim();
        console.log('🔍 استخراج نام همکار از متن:', text);

        // بررسی کلمات مربوط به خود کاربر
        const selfKeywords = ['خودم', 'من', 'خود', 'مال من'];
        if (selfKeywords.some(keyword => cleanText.includes(keyword))) {
            console.log('📝 تشخیص درخواست گزارش شخصی');
            return 'current_user';
        }

        // الگوهای بهبود یافته برای استخراج نام
        const patterns = [
            // برای گزارش‌ها
            /گزارش\s+(?:کار\s+)?(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/i,
            /(?:آقای|خانم)\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)\s+(?:را\s+)?(?:رو\s+)?(?:نشان\s+)?(?:بده|بگو)/i,
            /(?:گزارش|کارکرد|report)\s+(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/i,

            // برای ارسال فایل‌ها
            /برای\s+(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)(?:\s+(?:ارسال|بفرست)|$)/i,
            /(?:ارسال|بفرست).*?برای\s+(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/i,
            /(?:فایل|سند).*?برای\s+(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/i,
            /به\s+(?:آقای\s+)?(?:خانم\s+)?([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)\s+(?:ارسال|بفرست)/i,

            // الگوهای عمومی
            /(?:آقای|خانم|استاد|دکتر)\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/i,
            // نام‌های رایج ایرانی
            /(احمد|علی|محمد|حسن|حسین|رضا|مهدی|امیر|سارا|فاطمه|زهرا|مریم|نرگس|الهام|مینا)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let extractedName = match[1].trim();

                // حذف کلمات اضافی
                extractedName = extractedName
                    .replace(/\s*(را|رو|کن|بده|نشان بده|بگو|ارسال|بفرست)\s*/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (extractedName && extractedName.length > 0) {
                    console.log('📝 نام همکار استخراج شده:', extractedName);
                    return extractedName;
                }
            }
        }

        // اگر الگوی خاصی پیدا نشد، سعی کن نام‌های رایج پیدا کنی
        const commonNames = ['احمد', 'علی', 'محمد', 'حسن', 'حسین', 'رضا', 'مهدی', 'امیر', 'سارا', 'فاطمه', 'زهرا', 'مریم', 'نرگس', 'الهام', 'مینا'];
        for (const name of commonNames) {
            if (cleanText.includes(name.toLowerCase())) {
                console.log('📝 نام همکار تخمینی:', name);
                return name;
            }
        }

        console.log('⚠️ نام کارمند استخراج نشد');
        return undefined;
    }

    // Extract time period from voice command
    private extractTimePeriod(text: string): string | undefined {
        const timePatterns = {
            'یک هفته': '1week',
            'هفته گذشته': '1week',
            'هفتگی': '1week',
            'یک ماه': '1month',
            'ماه گذشته': '1month',
            'ماهانه': '1month',
            'سه ماه': '3months',
            'سه ماه گذشته': '3months',
            'فصلی': '3months',
            'یک سال': '1year',
            'سال گذشته': '1year',
            'سالانه': '1year'
        };

        let cleanText = text.toLowerCase();
        // Normalize common variants
        cleanText = cleanText
            .replace(/سه\s*ماهه/g, 'سه ماه')
            .replace(/٣\s*ماه/g, 'سه ماه')
            .replace(/1\s*ماه/g, 'یک ماه')
            .replace(/١\s*ماه/g, 'یک ماه')
            .replace(/1\s*هفته/g, 'یک هفته')
            .replace(/١\s*هفته/g, 'یک هفته')
            .replace(/1\s*سال/g, 'یک سال')
            .replace(/١\s*سال/g, 'یک سال');

        for (const [keyword, period] of Object.entries(timePatterns)) {
            if (cleanText.includes(keyword)) {
                return period;
            }
        }

        // If includes generic month/season keywords, try best guess
        if (/(سه\s*ماه|فصل|سه ماهه)/.test(cleanText)) return '3months';
        if (/(ماه|ماهانه)/.test(cleanText)) return '1month';
        if (/(هفته|هفتگی)/.test(cleanText)) return '1week';
        if (/(سال|سالانه)/.test(cleanText)) return '1year';

        // Default to 1 month if no specific period mentioned
        return '1month';
    }

    // Extract file name from voice command - بهبود یافته
    private extractFileName(text: string): string | undefined {
        const cleanText = text.toLowerCase().trim();
        console.log('🔍 استخراج نام فایل از متن:', text);

        // الگوهای بهبود یافته برای استخراج نام فایل
        const patterns = [
            // فایل [نام] رو برای
            /فایل\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)\s+(?:را|رو)\s+(?:برای|به)/i,
            // سند [نام] برای
            /سند\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)\s+(?:را|رو|برای|به)/i,
            // ارسال فایل [نام]
            /(?:ارسال|بفرست)\s+فایل\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)(?:\s+(?:برای|به|را|رو)|$)/i,
            // ارسال سند [نام]
            /(?:ارسال|بفرست)\s+سند\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)(?:\s+(?:برای|به|را|رو)|$)/i,
            // فایل [نام] برای
            /فایل\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)\s+برای/i,
            // [نام فایل] رو برای [نام شخص] ارسال کن
            /([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+?)\s+(?:را|رو)\s+برای\s+[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s]+\s+(?:ارسال|بفرست)/i,
            // نام فایل با پسوند
            /([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]+\.(?:pdf|doc|docx|txt|jpg|png|xlsx|xls))/i,
            // کلمات کلیدی مشترک
            /(گزارش|نمونه|پروژه|قرارداد|مالی|حسابداری|فروش|مشتری|تحلیل)(?:\s+[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی\w\s\-_.]*)?/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let extractedName = match[1].trim();

                // حذف کلمات اضافی
                extractedName = extractedName
                    .replace(/\s*(را|رو|کن|بده|نشان بده|بگو|ارسال|بفرست|برای|به)\s*/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (extractedName && extractedName.length > 0) {
                    console.log('📁 نام فایل استخراج شده:', extractedName);
                    return extractedName;
                }
            }
        }

        // اگر الگوی خاصی پیدا نشد، سعی کن کلمات کلیدی پیدا کنی
        const commonFileKeywords = ['گزارش', 'نمونه', 'پروژه', 'قرارداد', 'مالی', 'حسابداری', 'فروش', 'مشتری', 'تحلیل', 'سند', 'فایل'];
        for (const keyword of commonFileKeywords) {
            if (cleanText.includes(keyword)) {
                console.log('📁 نام فایل تخمینی بر اساس کلیدواژه:', keyword);
                return keyword;
            }
        }

        console.log('⚠️ نام فایل استخراج نشد، استفاده از پیش‌فرض');
        return 'سند'; // پیش‌فرض
    }

    // Process the analyzed command
    private async processCommand(command: VoiceCommand): Promise<AIResponse> {
        switch (command.type) {
            case 'report':
                return await this.processReportCommand(command);

            case 'feedback_analysis':
                return await this.processFeedbackAnalysisCommand(command);

            case 'sales_analysis':
                return await this.processSalesAnalysisCommand(command);

            case 'profitability_analysis':
                return await this.processProfitabilityAnalysisCommand(command);

            case 'document_email':
                return await this.processDocumentEmailCommand(command);

            case 'general':
                return await this.processGeneralCommand(command);

            default:
                return {
                    text: 'متأسفم، دستور شما را متوجه نشدم. لطفاً دوباره تلاش کنید.\n\nدستورات مجاز:\n• گزارش کار [نام همکار]\n• تحلیل فروش [بازه زمانی]\n• تحلیل بازخورد [بازه زمانی]\n• تحلیل سودآوری [بازه زمانی]\n• ارسال فایل [نام فایل] برای [نام همکار]\n• سوالات عمومی',
                    type: 'info'
                };
        }
    }

    // Process report-related commands - بهبود یافته
    private async processReportCommand(command: VoiceCommand): Promise<AIResponse> {
        if (!command.employeeName) {
            return {
                text: 'لطفاً نام همکار را مشخص کنید. مثال: "گزارش کار احمد" یا "گزارش خودم"',
                type: 'info'
            };
        }

        try {
            console.log('📊 پردازش درخواست گزارش برای:', command.employeeName);

            // بررسی احراز هویت
            console.log('🔍 بررسی احراز هویت...');

            const authCheck = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('🔍 وضعیت احراز هویت:', authCheck.status, authCheck.ok);

            let currentUser = null;
            if (authCheck.ok) {
                const authData = await authCheck.json();
                currentUser = authData;
                console.log('👤 کاربر فعلی:', currentUser);
            }

            // تعیین نام کارمند نهایی
            let finalEmployeeName = command.employeeName;
            if (command.employeeName === 'current_user' && currentUser) {
                finalEmployeeName = currentUser.name || currentUser.email || 'کاربر فعلی';
                console.log('📝 استفاده از نام کاربر فعلی:', finalEmployeeName);
            }

            // فراخوانی API برای دریافت گزارش
            console.log('📞 فراخوانی API تحلیل صوتی...');

            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/voice-analysis/process', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    text: command.text,
                    employeeName: finalEmployeeName,
                    originalCommand: command.employeeName,
                    isCurrentUser: command.employeeName === 'current_user'
                })
            });

            console.log('📞 پاسخ API تحلیل صوتی:', response.status, response.ok);

            const data = await response.json();
            console.log('📞 داده‌های دریافتی:', data);

            if (response.ok && data.success) {
                if (data.data.employee_found) {
                    const reportText = command.employeeName === 'current_user'
                        ? `گزارش شما:\n\n${data.data.analysis}`
                        : `گزارش همکار ${data.data.employee_name}:\n\n${data.data.analysis}`;

                    return {
                        text: reportText,
                        type: 'success',
                        data: data.data
                    };
                } else {
                    const notFoundText = command.employeeName === 'current_user'
                        ? 'گزارشی برای شما یافت نشد.'
                        : `همکار "${finalEmployeeName}" در سیستم یافت نشد. لطفاً نام را بررسی کنید.`;

                    return {
                        text: notFoundText,
                        type: 'info'
                    };
                }
            } else {
                console.error('❌ خطای API:', response.status, data);
                return {
                    text: `خطا در دریافت گزارش: ${data.message || 'خطای نامشخص'} (وضعیت: ${response.status})`,
                    type: 'error'
                };
            }

        } catch (error) {
            console.error('خطا در پردازش گزارش:', error);
            return {
                text: 'خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Process feedback analysis commands
    private async processFeedbackAnalysisCommand(command: VoiceCommand): Promise<AIResponse> {
        try {
            console.log('🔍 Processing feedback analysis command...');

            const timePeriod = command.timePeriod || '1month';
            const endDate = new Date().toISOString().split('T')[0];
            let startDate = '';

            // Calculate start date based on period
            switch (timePeriod) {
                case '1week':
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1month':
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '3months':
                    startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1year':
                    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                default:
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }

            // Try to get token for backup
            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            // Add Authorization header if token found
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/voice-analysis/feedback-analysis', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    startDate,
                    endDate,
                    period: timePeriod
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const periodName = this.getPeriodName(timePeriod);
                let responseText = `📊 تحلیل بازخوردها برای ${periodName}:\n\n`;

                responseText += `📝 خلاصه: ${data.summary}\n\n`;

                if (data.sentiment_analysis) {
                    responseText += `😊 تحلیل احساسات:\n`;
                    responseText += `• مثبت: ${data.sentiment_analysis.positive}%\n`;
                    responseText += `• خنثی: ${data.sentiment_analysis.neutral}%\n`;
                    responseText += `• منفی: ${data.sentiment_analysis.negative}%\n\n`;
                }

                if (data.recommendations && data.recommendations.length > 0) {
                    responseText += `💡 پیشنهادات اصلی:\n`;
                    data.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
                        responseText += `${index + 1}. ${rec}\n`;
                    });
                }

                return {
                    text: responseText,
                    type: 'success',
                    data: data
                };
            } else {
                return {
                    text: `خطا در تحلیل بازخوردها: ${data.message || 'خطای نامشخص'}`,
                    type: 'error'
                };
            }

        } catch (error) {
            console.error('خطا در تحلیل بازخوردها:', error);
            return {
                text: 'خطا در تحلیل بازخوردها. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Process sales analysis commands
    private async processSalesAnalysisCommand(command: VoiceCommand): Promise<AIResponse> {
        try {
            console.log('🔍 Processing sales analysis command...');

            const timePeriod = command.timePeriod || '1month';
            const endDate = new Date().toISOString().split('T')[0];
            let startDate = '';

            // Calculate start date based on period
            switch (timePeriod) {
                case '1week':
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1month':
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '3months':
                    startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1year':
                    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                default:
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }

            // Try to get token for backup
            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            // Add Authorization header if token found
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/voice-analysis/sales-analysis', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    startDate,
                    endDate,
                    period: timePeriod
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const periodName = this.getPeriodName(timePeriod);
                let responseText = `💰 تحلیل فروش برای ${periodName}:\n\n`;

                responseText += `📝 خلاصه: ${data.summary}\n\n`;

                if (data.sales_metrics) {
                    responseText += `📊 آمار کلیدی:\n`;
                    responseText += `• مجموع فروش: ${data.sales_metrics.total_sales.toLocaleString()} تومان\n`;
                    responseText += `• سود خالص: ${data.sales_metrics.total_profit.toLocaleString()} تومان\n`;
                    responseText += `• تعداد سفارشات: ${data.sales_metrics.order_count}\n`;
                    responseText += `• میانگین سفارش: ${data.sales_metrics.avg_order_value.toLocaleString()} تومان\n\n`;
                }

                if (data.top_products && data.top_products.length > 0) {
                    responseText += `🏆 محصولات پرفروش:\n`;
                    data.top_products.slice(0, 3).forEach((product: any, index: number) => {
                        responseText += `${index + 1}. ${product.name}: ${product.sales_count} فروش\n`;
                    });
                    responseText += '\n';
                }

                if (data.recommendations && data.recommendations.length > 0) {
                    responseText += `💡 پیشنهادات اصلی:\n`;
                    data.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
                        responseText += `${index + 1}. ${rec}\n`;
                    });
                }

                return {
                    text: responseText,
                    type: 'success',
                    data: data
                };
            } else {
                return {
                    text: `خطا در تحلیل فروش: ${data.message || 'خطای نامشخص'}`,
                    type: 'error'
                };
            }

        } catch (error) {
            console.error('خطا در تحلیل فروش:', error);
            return {
                text: 'خطا در تحلیل فروش. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Process profitability analysis commands
    private async processProfitabilityAnalysisCommand(command: VoiceCommand): Promise<AIResponse> {
        try {
            console.log('🔍 Processing profitability analysis command...');

            const timePeriod = command.timePeriod || '1month';
            const endDate = new Date().toISOString().split('T')[0];
            let startDate = '';

            // Calculate start date based on period
            switch (timePeriod) {
                case '1week':
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1month':
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '3months':
                    startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case '1year':
                    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                default:
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }

            // Try to get token for backup
            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            // Add Authorization header if token found
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/voice-analysis/profitability-analysis', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    startDate,
                    endDate,
                    period: timePeriod
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const periodName = this.getPeriodName(timePeriod);
                let responseText = `💎 تحلیل سودآوری برای ${periodName}:\n\n`;

                responseText += `📝 خلاصه: ${data.summary}\n\n`;

                if (data.profitability_metrics) {
                    responseText += `📊 شاخص‌های سودآوری:\n`;
                    responseText += `• درآمد کل: ${data.profitability_metrics.total_revenue.toLocaleString()} تومان\n`;
                    responseText += `• هزینه کل: ${data.profitability_metrics.total_costs.toLocaleString()} تومان\n`;
                    responseText += `• سود خالص: ${data.profitability_metrics.net_profit.toLocaleString()} تومان\n`;
                    responseText += `• حاشیه سود: ${data.profitability_metrics.profit_margin}%\n`;
                    responseText += `• بازده سرمایه: ${data.profitability_metrics.roi}%\n\n`;
                }

                if (data.cost_breakdown && data.cost_breakdown.length > 0) {
                    responseText += `💰 تفکیک هزینه‌ها:\n`;
                    data.cost_breakdown.slice(0, 3).forEach((cost: any, index: number) => {
                        responseText += `${index + 1}. ${cost.category}: ${cost.amount.toLocaleString()} تومان\n`;
                    });
                    responseText += '\n';
                }

                if (data.recommendations && data.recommendations.length > 0) {
                    responseText += `💡 پیشنهادات بهبود سودآوری:\n`;
                    data.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
                        responseText += `${index + 1}. ${rec}\n`;
                    });
                }

                return {
                    text: responseText,
                    type: 'success',
                    data: data
                };
            } else {
                return {
                    text: `خطا در تحلیل سودآوری: ${data.message || 'خطای نامشخص'}`,
                    type: 'error'
                };
            }

        } catch (error) {
            console.error('خطا در تحلیل سودآوری:', error);
            return {
                text: 'خطا در تحلیل سودآوری. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Get period name in Persian
    private getPeriodName(period: string): string {
        switch (period) {
            case '1week':
                return 'یک هفته گذشته';
            case '1month':
                return 'یک ماه گذشته';
            case '3months':
                return 'سه ماه گذشته';
            case '1year':
                return 'یک سال گذشته';
            default:
                return 'دوره انتخاب شده';
        }
    }

    // Process general questions
    private async processGeneralCommand(command: VoiceCommand): Promise<AIResponse> {
        try {
            const encodedText = encodeURIComponent(command.text);
            const response = await fetch(`https://mine-gpt-alpha.vercel.app/proxy?text=${encodedText}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();
            const aiText = data.answer || data.response || data.text || data;

            if (aiText && typeof aiText === 'string') {
                return {
                    text: aiText,
                    type: 'success'
                };
            } else {
                return {
                    text: 'متأسفم، نتوانستم پاسخ مناسبی تولید کنم.',
                    type: 'info'
                };
            }

        } catch (error) {
            console.error('خطا در پردازش سوال عمومی:', error);
            return {
                text: 'خطا در دریافت پاسخ از هوش مصنوعی. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Speak the response using Sahab TTS (new API)
    private async speakResponse(text: string): Promise<void> {
        try {
            // Set speaking state
            this.isSpeaking = true;

            console.log('🎵 Using Sahab TTS for response...');

            // Use new Sahab TTS API (speak)
            await sahabTTSV2.speak(text, {
                speaker: '3',
                onLoadingStart: () => {
                    console.log('🔄 شروع بارگذاری صدا...');
                },
                onLoadingEnd: () => {
                    console.log('✅ بارگذاری صدا تکمیل شد');
                },
                onError: (error) => {
                    console.error('❌ خطا در TTS:', error);
                    // Fallback to TalkBot if Sahab fails
                    this.fallbackToTalkBot(text);
                }
            });

        } catch (error) {
            console.error('خطا در خواندن پاسخ با Sahab TTS:', error);

            // Fallback to TalkBot TTS
            await this.fallbackToTalkBot(text);
        } finally {
            // Reset speaking state
            this.isSpeaking = false;
        }
    }

    // Fallback to TalkBot TTS if Sahab fails
    private async fallbackToTalkBot(text: string): Promise<void> {
        try {
            console.log('🔄 Falling back to TalkBot TTS...');
            await talkBotTTS.speak(text, { server: 'farsi', sound: '3' });
        } catch (fallbackError) {
            console.error('خطا در fallback TTS:', fallbackError);
            // Don't throw error for TTS issues - just log them
            // The main interaction should continue even if TTS fails
            console.warn('Both TTS services failed but continuing with interaction');
        }
    }

    // Process voice command directly (for wake word functionality)
    async processVoiceCommand(transcript: string): Promise<{
        transcript: string;
        response: AIResponse;
        success: boolean;
    }> {
        try {
            console.log('🎯 Processing voice command directly:', transcript);

            // Step 1: Analyze the command
            const command = this.analyzeVoiceCommand(transcript);
            console.log('🔍 دستور تحلیل شده:', command);

            // Step 2: Process the command
            const response = await this.processCommand(command);
            console.log('💬 پاسخ تولید شده:', response.text.substring(0, 100) + '...');

            // Step 3: Speak the response
            await this.speakResponse(response.text);

            return {
                transcript,
                response,
                success: response.type !== 'error'
            };

        } catch (error) {
            console.error('❌ خطا در پردازش دستور صوتی:', error);
            const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص در پردازش دستور';

            const errorResponse: AIResponse = {
                text: `متأسفم، خطایی رخ داد: ${errorMessage}`,
                type: 'error'
            };

            return {
                transcript,
                response: errorResponse,
                success: false
            };
        }
    }

    // Stop current recording and process the result
    async stopCurrentRecording(): Promise<void> {
        const currentSession = (this as any).currentRecordingSession;
        if (currentSession) {
            try {
                clearTimeout(currentSession.timeout);
                const result = await currentSession.session.stop();
                currentSession.resolve(result);
                (this as any).currentRecordingSession = null;
                console.log('✅ ضبط متوقف شد و در حال پردازش...');
            } catch (error) {
                currentSession.reject(error);
                (this as any).currentRecordingSession = null;
            }
        }
    }

    // Stop any ongoing audio processing
    stopAudioProcessing(): void {
        // Stop current recording session if exists
        const currentSession = (this as any).currentRecordingSession;
        if (currentSession) {
            clearTimeout(currentSession.timeout);
            currentSession.reject(new Error('عملیات توسط کاربر لغو شد'));
            (this as any).currentRecordingSession = null;
        }

        enhancedPersianSpeechRecognition.stopListening();
        advancedSpeechToText.stop(); // Stop advanced speech-to-text
        talkBotTTS.stop();
        sahabTTSV2.stop();
        this.isProcessing = false;
        this.currentSession = null;
        console.log('⏹️ پردازش صوتی متوقف شد');
    }

    // Get system status
    getSystemStatus(): {
        isProcessing: boolean;
        isSpeaking: boolean;
        speechRecognitionSupported: boolean;
        ttsSupported: boolean;
        currentSession: string | null;
        voiceInfo: any;
        sahabTTSStatus: any;
        advancedSpeechStatus: any;
    } {
        const sahabStatus = sahabTTSV2.getStatus();
        const advancedSpeechStatus = advancedSpeechToText.getStatus();

        return {
            isProcessing: this.isProcessing,
            isSpeaking: this.isSpeaking || sahabStatus.isSpeaking,
            speechRecognitionSupported: enhancedPersianSpeechRecognition.isSupported() || advancedSpeechStatus.isSupported,
            ttsSupported: talkBotTTS.isSupported() || sahabTTSV2.isSupported(),
            currentSession: this.currentSession,
            voiceInfo: {
                total: 3,
                persian: 3,
                arabic: 0,
                female: 1,
                bestVoice: 'Advanced Speech-to-Text + Sahab TTS (Primary) + TalkBot (Fallback)',
                hasGoodVoice: true
            },
            sahabTTSStatus: sahabStatus,
            advancedSpeechStatus: advancedSpeechStatus
        };
    }

    // Process document email commands
    private async processDocumentEmailCommand(command: VoiceCommand): Promise<AIResponse> {
        if (!command.fileName || !command.employeeName) {
            return {
                text: 'لطفاً نام فایل و نام همکار را مشخص کنید. مثال: "فایل گزارش.pdf رو برای احمد ارسال کن"',
                type: 'info'
            };
        }

        try {
            console.log('📧 پردازش درخواست ارسال سند:', command.fileName, 'برای:', command.employeeName);

            // بررسی احراز هویت
            const authCheck = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            let currentUser = null;
            if (authCheck.ok) {
                const authData = await authCheck.json();
                currentUser = authData;
                console.log('👤 کاربر فعلی:', currentUser);
            }

            if (!currentUser) {
                return {
                    text: 'برای ارسال سند باید وارد سیستم شوید.',
                    type: 'error'
                };
            }

            // جستجوی فایل در سیستم
            console.log('🔍 جستجوی فایل:', command.fileName);

            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // جستجوی فایل
            const searchResponse = await fetch(`/api/documents?search=${encodeURIComponent(command.fileName)}&limit=10`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!searchResponse.ok) {
                return {
                    text: 'خطا در جستجوی فایل. لطفاً دوباره تلاش کنید.',
                    type: 'error'
                };
            }

            const searchData = await searchResponse.json();
            console.log('📁 نتایج جستجوی فایل:', searchData.documents?.length || 0);

            if (!searchData.documents || searchData.documents.length === 0) {
                return {
                    text: `فایل "${command.fileName}" یافت نشد. لطفاً نام فایل را بررسی کنید.`,
                    type: 'info'
                };
            }

            // انتخاب بهترین تطبیق
            const document = searchData.documents[0];
            console.log('📄 فایل انتخاب شده:', document.title);

            // جستجوی همکار
            console.log('👥 جستجوی همکار:', command.employeeName);

            const coworkersResponse = await fetch('/api/users/coworkers', {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!coworkersResponse.ok) {
                return {
                    text: 'خطا در دریافت لیست همکاران. لطفاً دوباره تلاش کنید.',
                    type: 'error'
                };
            }

            const coworkersData = await coworkersResponse.json();
            console.log('👥 تعداد همکاران:', coworkersData.data?.length || 0);

            if (!coworkersData.success || !coworkersData.data) {
                return {
                    text: 'خطا در دریافت لیست همکاران.',
                    type: 'error'
                };
            }

            // جستجوی همکار بر اساس نام
            const coworker = coworkersData.data.find((user: any) =>
                user.name.toLowerCase().includes(command.employeeName!.toLowerCase()) ||
                command.employeeName!.toLowerCase().includes(user.name.toLowerCase())
            );

            if (!coworker) {
                const availableNames = coworkersData.data.map((u: any) => u.name).join('، ');
                return {
                    text: `همکار "${command.employeeName}" یافت نشد. همکاران موجود: ${availableNames}`,
                    type: 'info'
                };
            }

            console.log('✅ همکار یافت شد:', coworker.name, coworker.email);

            // ارسال ایمیل با فایل ضمیمه
            console.log('📧 ارسال ایمیل...');

            const emailResponse = await fetch('/api/documents/shared', {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    documentId: document.id,
                    recipientEmail: coworker.email,
                    recipientName: coworker.name,
                    message: `سلام ${coworker.name}،\n\nسند "${document.title}" توسط ${currentUser.name} برای شما ارسال شده است.\n\nبا تشکر`
                })
            });

            if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                return {
                    text: `خطا در ارسال ایمیل: ${errorData.message || 'خطای نامشخص'}`,
                    type: 'error'
                };
            }

            const emailResult = await emailResponse.json();

            if (emailResult.success) {
                return {
                    text: `✅ فایل "${document.title}" با موفقیت برای ${coworker.name} (${coworker.email}) ارسال شد.`,
                    type: 'success',
                    data: {
                        document: document.title,
                        recipient: coworker.name,
                        email: coworker.email
                    }
                };
            } else {
                return {
                    text: `خطا در ارسال ایمیل: ${emailResult.message || 'خطای نامشخص'}`,
                    type: 'error'
                };
            }

        } catch (error) {
            console.error('خطا در ارسال سند:', error);
            return {
                text: 'خطا در ارسال سند. لطفاً دوباره تلاش کنید.',
                type: 'error'
            };
        }
    }

    // Test the complete system
    async testSystem(): Promise<{
        speechRecognition: boolean;
        advancedSpeechToText: boolean;
        textToSpeech: boolean;
        microphone: boolean;
        overall: boolean;
    }> {
        const results = {
            speechRecognition: enhancedPersianSpeechRecognition.isSupported(),
            advancedSpeechToText: advancedSpeechToText.isSupported(),
            textToSpeech: talkBotTTS.isSupported() || sahabTTSV2.isSupported(),
            microphone: false,
            overall: false
        };

        try {
            results.microphone = await enhancedPersianSpeechRecognition.testMicrophone();
        } catch (error) {
            console.error('خطا در تست میکروفون:', error);
        }

        results.overall = (results.speechRecognition || results.advancedSpeechToText) &&
            results.textToSpeech &&
            results.microphone;

        return results;
    }
}

// Export singleton
export const audioIntelligenceService = new AudioIntelligenceService();
