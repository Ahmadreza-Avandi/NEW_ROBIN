// Audio Intelligence Service - Complete voice interaction system
import { enhancedPersianSpeechRecognition } from './enhanced-persian-speech-recognition';
import { advancedSpeechToText } from './advanced-speech-to-text';
import { talkBotTTS } from './talkbot-tts';
import { sahabTTSV2 } from './sahab-tts-v2';

export interface VoiceCommand {
    text: string;
    type: 'report' | 'feedback_analysis' | 'sales_analysis' | 'profitability_analysis' | 'general' | 'unknown';
    employeeName?: string;
    timePeriod?: string;
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
        const cleanText = text.toLowerCase().trim();

        // Check for report commands
        const reportKeywords = ['گزارش', 'report', 'گزارش کار', 'کارکرد'];
        const hasReportKeyword = reportKeywords.some(keyword =>
            cleanText.includes(keyword.toLowerCase())
        );

        if (hasReportKeyword) {
            // Extract employee name
            const employeeName = this.extractEmployeeName(text);

            return {
                text,
                type: 'report',
                employeeName,
                confidence: employeeName ? 0.9 : 0.6
            };
        }

        // Check for feedback analysis commands
        const feedbackKeywords = ['تحلیل بازخورد', 'بازخورد', 'نظرات مشتری', 'feedback analysis', 'تحلیل نظرات'];
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
        const profitabilityKeywords = ['تحلیل سودآوری', 'سودآوری', 'profitability analysis', 'تحلیل سود', 'حاشیه سود', 'سود خالص'];
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

    // Extract employee name from voice command
    private extractEmployeeName(text: string): string | undefined {
        const patterns = [
            /گزارش\s*کار\s*(.+)/i,
            /گزارش\s*(.+)/i,
            /report\s*(.+)/i,
            /کارکرد\s*(.+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

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

        const cleanText = text.toLowerCase();

        for (const [keyword, period] of Object.entries(timePatterns)) {
            if (cleanText.includes(keyword)) {
                return period;
            }
        }

        // Default to 1 month if no specific period mentioned
        return '1month';
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

            case 'general':
                return await this.processGeneralCommand(command);

            default:
                return {
                    text: 'متأسفم، دستور شما را متوجه نشدم. لطفاً دوباره تلاش کنید.\n\nدستورات مجاز:\n• گزارش کار [نام همکار]\n• تحلیل فروش [بازه زمانی]\n• تحلیل بازخورد [بازه زمانی]\n• تحلیل سودآوری [بازه زمانی]\n• سوالات عمومی',
                    type: 'info'
                };
        }
    }

    // Process report-related commands
    private async processReportCommand(command: VoiceCommand): Promise<AIResponse> {
        if (!command.employeeName) {
            return {
                text: 'لطفاً نام همکار را مشخص کنید. مثال: "گزارش کار احمد"',
                type: 'info'
            };
        }

        try {
            // Check authentication first
            console.log('🔍 Checking authentication...');

            // Debug: Check available cookies
            console.log('🍪 Available cookies:', document.cookie);

            const authCheck = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('🔍 Auth check response:', authCheck.status, authCheck.ok);

            if (!authCheck.ok) {
                const errorData = await authCheck.json().catch(() => ({}));
                console.log('🔍 Auth error details:', errorData);
                console.log('⚠️ Auth check failed, but continuing with API call...');

                // Don't return error here, let the API handle authentication
                // return {
                //     text: `برای دسترسی به گزارشات، لطفاً وارد سیستم شوید. خطا: ${errorData.message || 'نامشخص'}`,
                //     type: 'error'
                // };
            }

            const authData = await authCheck.json();
            console.log('🔍 Auth data:', authData);

            // Call API to get report
            console.log('📞 Calling voice-analysis API...');

            // Try to get token for backup
            const token = this.findAuthToken();
            const headers: any = {
                'Content-Type': 'application/json',
            };

            // Add Authorization header if token found
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/voice-analysis/process', {
                method: 'POST',
                headers,
                credentials: 'include', // Include cookies
                body: JSON.stringify({
                    text: command.text,
                    employeeName: command.employeeName
                })
            });

            console.log('📞 Voice-analysis response:', response.status, response.ok);

            const data = await response.json();
            console.log('📞 Voice-analysis data:', data);

            if (response.ok && data.success) {
                if (data.data.employee_found) {
                    return {
                        text: `گزارش همکار ${data.data.employee_name}:\n\n${data.data.analysis}`,
                        type: 'success',
                        data: data.data
                    };
                } else {
                    return {
                        text: `همکار "${command.employeeName}" در سیستم یافت نشد. لطفاً نام را بررسی کنید.`,
                        type: 'info'
                    };
                }
            } else {
                console.error('❌ API Error:', response.status, data);
                return {
                    text: `خطا در دریافت گزارش: ${data.message || 'خطای نامشخص'} (Status: ${response.status})`,
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

            // Use new Sahab TTS API
            await sahabTTSV2.speakClean(text, {
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

    // Stop any ongoing audio processing
    stopAudioProcessing(): void {
        enhancedPersianSpeechRecognition.stopListening();
        advancedSpeechToText.stop(); // Stop advanced speech-to-text
        talkBotTTS.stop();
        sahabTTSV2.stop(); // Stop new Sahab TTS as well
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
                total: 2,
                persian: 2,
                arabic: 0,
                female: 1,
                bestVoice: 'Advanced Speech-to-Text + Sahab TTS (Primary) + TalkBot (Fallback)',
                hasGoodVoice: true
            },
            sahabTTSStatus: sahabStatus,
            advancedSpeechStatus: advancedSpeechStatus
        };
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
