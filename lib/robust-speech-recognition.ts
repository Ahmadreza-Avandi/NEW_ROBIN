// Robust Speech Recognition Service - Never gives up easily!
export class RobustSpeechRecognition {
    private recognition: any = null;
    private isListening = false;
    private retryCount = 0;
    private maxRetries = 5; // More retries
    private onInterimCallback: ((text: string) => void) | null = null;
    private onStartCallback: (() => void) | null = null;
    private onEndCallback: (() => void) | null = null;
    private silenceTimer: any = null;
    private silenceTimeoutMs = 8000; // 8 seconds - very patient
    private hasStartedSpeaking = false;
    private currentResolve: ((value: string) => void) | null = null;
    private currentReject: ((reason?: any) => void) | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.setupRecognition();
    }

    private setupRecognition() {
        if (!this.recognition) return;

        // Robust configuration
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3; // More alternatives for better accuracy
        this.recognition.lang = 'fa-IR';

        // Try to improve accuracy
        if ('webkitSpeechRecognition' in window) {
            try {
                (this.recognition as any).serviceURI = '';
            } catch (e) {
                // Ignore if not supported
            }
        }
    }

    // Main robust listening method
    async startRobustListening(): Promise<string> {
        if (!this.isSupported()) {
            throw new Error('تشخیص گفتار پشتیبانی نمی‌شود');
        }

        if (this.isListening) {
            console.log('⚠️ در حال گوش دادن، متوقف می‌کنم و دوباره شروع می‌کنم...');
            this.forceStop();
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        }

        // Reset state
        this.retryCount = 0;
        this.hasStartedSpeaking = false;

        return new Promise((resolve, reject) => {
            this.currentResolve = resolve;
            this.currentReject = reject;

            this.attemptRecognition();
        });
    }

    private async attemptRecognition(): Promise<void> {
        let finalTranscript = '';
        let interimTranscript = '';

        console.log(`🎤 تلاش ${this.retryCount + 1} برای تشخیص گفتار...`);

        // No global timeout - we're patient!

        const resetSilenceTimer = () => {
            if (this.silenceTimer) clearTimeout(this.silenceTimer);

            // Only start silence timer after we've heard something meaningful
            if (this.hasStartedSpeaking && (finalTranscript.trim().length > 2 || interimTranscript.trim().length > 2)) {
                this.silenceTimer = setTimeout(() => {
                    if (this.isListening) {
                        console.log('🔇 سکوت طولانی تشخیص داده شد، متوقف می‌کنم...');
                        this.completeRecognition(finalTranscript, interimTranscript);
                    }
                }, this.silenceTimeoutMs);
            }
        };

        this.recognition.onstart = () => {
            console.log('🎤 شروع تشخیص گفتار قوی');
            this.isListening = true;
            this.hasStartedSpeaking = false;
            if (this.onStartCallback) this.onStartCallback();
        };

        this.recognition.onresult = (event: any) => {
            interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    this.hasStartedSpeaking = true;
                    console.log(`✅ Final: "${transcript}" (confidence: ${confidence})`);
                } else {
                    interimTranscript += transcript + ' ';
                    if (transcript.trim().length > 1) {
                        this.hasStartedSpeaking = true;
                    }
                    console.log(`⏳ Interim: "${transcript}"`);
                }
            }

            // Update UI with interim results
            const cleanedText = this.cleanupText(interimTranscript || finalTranscript);
            if (this.onInterimCallback && cleanedText) {
                this.onInterimCallback(cleanedText);
            }

            // Reset silence timer when we get new speech
            if (this.hasStartedSpeaking) {
                resetSilenceTimer();
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('🎤 خطا در تشخیص گفتار:', event.error);
            clearTimeout(this.silenceTimer);
            this.isListening = false;

            switch (event.error) {
                case 'no-speech':
                    console.log('⚠️ صدایی تشخیص نداده، دوباره تلاش می‌کنم...');
                    this.retryRecognition();
                    break;

                case 'audio-capture':
                    console.error('❌ مشکل در دسترسی به میکروفون');
                    if (this.currentReject) {
                        this.currentReject(new Error('مشکل در دسترسی به میکروفون. لطفاً مجوز میکروفون را بررسی کنید.'));
                    }
                    break;

                case 'not-allowed':
                    console.error('❌ دسترسی به میکروفون مجاز نیست');
                    if (this.currentReject) {
                        this.currentReject(new Error('دسترسی به میکروفون مجاز نیست. لطفاً مجوز را فعال کنید.'));
                    }
                    break;

                case 'network':
                    console.log('⚠️ مشکل شبکه، دوباره تلاش می‌کنم...');
                    this.retryRecognition();
                    break;

                case 'aborted':
                    console.log('⚠️ تشخیص گفتار لغو شد، دوباره تلاش می‌کنم...');
                    this.retryRecognition();
                    break;

                default:
                    console.log(`⚠️ خطای ${event.error}، دوباره تلاش می‌کنم...`);
                    this.retryRecognition();
                    break;
            }
        };

        this.recognition.onend = () => {
            console.log('🎤 پایان تشخیص گفتار');
            clearTimeout(this.silenceTimer);
            this.isListening = false;

            // If we have some transcript, use it
            if (finalTranscript.trim() || interimTranscript.trim()) {
                this.completeRecognition(finalTranscript, interimTranscript);
            } else if (this.retryCount < this.maxRetries) {
                console.log('⚠️ متنی دریافت نشد، دوباره تلاش می‌کنم...');
                this.retryRecognition();
            } else {
                console.error('❌ بعد از چندین تلاش، متنی دریافت نشد');
                if (this.currentReject) {
                    this.currentReject(new Error('بعد از چندین تلاش، صدایی تشخیص داده نشد. لطفاً دوباره تلاش کنید.'));
                }
            }
        };

        // Start recognition
        try {
            this.recognition.start();
        } catch (error) {
            console.error('❌ خطا در شروع تشخیص گفتار:', error);
            this.isListening = false;
            this.retryRecognition();
        }
    }

    private retryRecognition(): void {
        if (this.retryCount >= this.maxRetries) {
            console.error('❌ تعداد تلاش‌ها به حداکثر رسید');
            if (this.currentReject) {
                this.currentReject(new Error('بعد از چندین تلاش، تشخیص گفتار موفق نشد. لطفاً دوباره تلاش کنید.'));
            }
            return;
        }

        this.retryCount++;
        console.log(`🔄 تلاش مجدد ${this.retryCount}/${this.maxRetries} بعد از 2 ثانیه...`);

        setTimeout(() => {
            if (this.currentResolve && this.currentReject) {
                this.attemptRecognition();
            }
        }, 2000);
    }

    private completeRecognition(finalTranscript: string, interimTranscript: string): void {
        const bestTranscript = finalTranscript.trim() || interimTranscript.trim();

        if (bestTranscript) {
            const cleaned = this.cleanupText(bestTranscript);
            console.log(`✅ تشخیص گفتار تکمیل شد: "${cleaned}"`);

            if (this.onEndCallback) this.onEndCallback();
            if (this.currentResolve) {
                this.currentResolve(cleaned);
                this.currentResolve = null;
                this.currentReject = null;
            }
        } else {
            this.retryRecognition();
        }
    }

    // Clean up text
    private cleanupText(text: string): string {
        if (!text) return '';

        return text
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .replace(/ي/g, 'ی')
            .replace(/ك/g, 'ک')
            .replace(/ء/g, 'ئ')
            .replace(/\bگزارش کار\b/gi, 'گزارش کار')
            .replace(/\bگزارش\b/gi, 'گزارش')
            .replace(/\bکار\b/gi, 'کار')
            .replace(/\bهمکار\b/gi, 'همکار')
            .replace(/\?/g, '؟')
            .replace(/;/g, '؛')
            .trim();
    }

    // Force stop
    forceStop(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }

        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.warn('خطا در متوقف کردن تشخیص گفتار:', e);
            }
        }

        this.isListening = false;
        this.hasStartedSpeaking = false;
        console.log('⏹️ تشخیص گفتار به زور متوقف شد');
    }

    // Callbacks
    onInterim(callback: (text: string) => void) {
        this.onInterimCallback = callback;
    }

    onStart(callback: () => void) {
        this.onStartCallback = callback;
    }

    onEnd(callback: () => void) {
        this.onEndCallback = callback;
    }

    // Check support
    isSupported(): boolean {
        return this.recognition !== null;
    }

    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    // Test microphone
    async testMicrophone(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ میکروفون در دسترس است');
            return true;
        } catch (error) {
            console.error('❌ میکروفون در دسترس نیست:', error);
            return false;
        }
    }

    // Manual input as last resort
    async getManualInput(): Promise<string> {
        return new Promise((resolve, reject) => {
            const userInput = prompt(`تشخیص گفتار بعد از ${this.maxRetries} تلاش موفق نشد.\n\nلطفاً دستور خود را تایپ کنید:\n\nمثال‌ها:\n• گزارش کار احمد\n• تحلیل فروش یک ماه\n• بازخورد مشتریان`);

            if (userInput === null) {
                reject(new Error('کاربر عملیات را لغو کرد'));
                return;
            }

            if (!userInput.trim()) {
                reject(new Error('متن خالی وارد شده است'));
                return;
            }

            const cleaned = this.cleanupText(userInput);
            resolve(cleaned);
        });
    }
}

// Export singleton
export const robustSpeechRecognition = new RobustSpeechRecognition();