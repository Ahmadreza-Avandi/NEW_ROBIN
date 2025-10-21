// Improved TTS Service - Uses multiple TTS APIs with smart fallback
export class ImprovedTTSService {
    private static instance: ImprovedTTSService;
    private isSpeaking: boolean = false;
    private currentAudio: HTMLAudioElement | null = null;
    private isLoading: boolean = false;

    static getInstance(): ImprovedTTSService {
        if (!ImprovedTTSService.instance) {
            ImprovedTTSService.instance = new ImprovedTTSService();
        }
        return ImprovedTTSService.instance;
    }

    // Get current status
    getStatus(): {
        isSpeaking: boolean;
        isLoading: boolean;
        isSupported: boolean;
    } {
        return {
            isSpeaking: this.isSpeaking,
            isLoading: this.isLoading,
            isSupported: this.isSupported()
        };
    }

    // Main speak method with smart API selection
    async speak(text: string, options?: {
        onLoadingStart?: () => void;
        onLoadingEnd?: () => void;
        onError?: (error: string) => void;
    }): Promise<void> {
        if (!text || text.trim() === '') {
            throw new Error('متن برای تبدیل به صدا ارائه نشده است');
        }

        if (this.isSpeaking) {
            console.warn('در حال حاضر صدایی پخش می‌شود، متوقف می‌کنم...');
            this.stop();
        }

        this.isLoading = true;
        options?.onLoadingStart?.();

        try {
            console.log('🎵 شروع تبدیل متن به صدا:', text.substring(0, 50) + '...');

            // Try Edge TTS first (best quality for Persian)
            try {
                console.log('🔄 تلاش با Edge TTS...');
                await this.tryEdgeTTS(text);
                console.log('✅ Edge TTS موفق بود');
                return;
            } catch (edgeError) {
                console.log('🔄 Edge TTS شکست خورد، تلاش با Simple TTS...');
            }

            // Fallback to Simple TTS
            try {
                console.log('🔄 تلاش با Simple TTS...');
                await this.trySimpleTTS(text);
                console.log('✅ Simple TTS موفق بود');
                return;
            } catch (simpleError) {
                console.log('🔄 Simple TTS شکست خورد، تلاش با مرورگر...');
            }

            // Final fallback to browser TTS
            try {
                console.log('🔄 تلاش با TTS مرورگر...');
                await this.tryBrowserTTS(text);
                console.log('✅ Browser TTS موفق بود');
                return;
            } catch (browserError) {
                throw new Error('همه سرویس‌های TTS شکست خوردند');
            }

        } catch (error) {
            console.error('❌ خطا در TTS:', error);
            const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
            options?.onError?.(errorMessage);
            throw error;
        } finally {
            this.isLoading = false;
            options?.onLoadingEnd?.();
        }
    }

    // Try Edge TTS API
    private async tryEdgeTTS(text: string): Promise<void> {
        const response = await fetch('/api/tts/edge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                text: text,
                lang: 'fa-IR'
            })
        });

        if (!response.ok) {
            throw new Error(`Edge TTS API Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.audioContent) {
            throw new Error(result.message || 'Edge TTS failed');
        }

        await this.playBase64Audio(result.audioContent, result.contentType || 'audio/mpeg');
    }

    // Try Simple TTS API
    private async trySimpleTTS(text: string): Promise<void> {
        const response = await fetch('/api/tts/simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                text: text,
                lang: 'fa'
            })
        });

        if (!response.ok) {
            throw new Error(`Simple TTS API Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.audioContent) {
            throw new Error(result.message || 'Simple TTS failed');
        }

        await this.playBase64Audio(result.audioContent, result.contentType || 'audio/mpeg');
    }

    // Try browser TTS as final fallback
    private async tryBrowserTTS(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser TTS not supported'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fa-IR';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };

            utterance.onerror = (error) => {
                this.isSpeaking = false;
                reject(new Error(`Browser TTS error: ${error.error}`));
            };

            this.isSpeaking = true;
            speechSynthesis.speak(utterance);
        });
    }

    // Play base64 audio data
    private async playBase64Audio(base64Data: string, contentType: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Stop any current audio
                this.stop();

                // Convert base64 to blob
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], { type: contentType });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Create and configure audio element
                const audio = new Audio(audioUrl);
                this.currentAudio = audio;
                this.isSpeaking = true;

                // Set up event listeners
                audio.onended = () => {
                    console.log('✅ پخش صدا تکمیل شد');
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    resolve();
                };

                audio.onerror = (error) => {
                    console.error('❌ خطا در پخش صدا:', error);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    reject(new Error('خطا در پخش صدا'));
                };

                audio.onloadstart = () => {
                    console.log('🔄 شروع بارگذاری صدا...');
                };

                audio.oncanplay = () => {
                    console.log('✅ صدا آماده پخش است');
                };

                // Start playing
                audio.play().catch((playError) => {
                    console.error('❌ خطا در شروع پخش:', playError);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    reject(new Error('خطا در شروع پخش صدا'));
                });

            } catch (error) {
                console.error('❌ خطا در playBase64Audio:', error);
                this.isSpeaking = false;
                reject(error);
            }
        });
    }

    // Stop current audio playback
    stop(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            console.log('🔇 صدا متوقف شد');
        }

        // Stop browser TTS if active
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }

        this.isSpeaking = false;
        this.isLoading = false;
    }

    // Check if TTS is supported
    isSupported(): boolean {
        return typeof window !== 'undefined' &&
            ('Audio' in window || 'speechSynthesis' in window);
    }

    // Test TTS with a simple message
    async test(): Promise<void> {
        await this.speak('سلام. این یک تست سیستم صوتی بهبود یافته است. کیفیت صدا عالی است.', {
            onLoadingStart: () => console.log('🔄 شروع تست...'),
            onLoadingEnd: () => console.log('✅ تست تکمیل شد'),
            onError: (error) => console.error('❌ خطا در تست:', error)
        });
    }

    // Clean text for better TTS (Persian-specific)
    private cleanText(text: string): string {
        return text
            // Remove markdown formatting
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links

            // Replace common symbols with Persian words
            .replace(/&/g, 'و')
            .replace(/@/g, 'ات')
            .replace(/#/g, 'شماره')
            .replace(/\$/g, 'دلار')
            .replace(/%/g, 'درصد')

            // Clean up extra spaces and newlines
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Speak with automatic text cleaning
    async speakClean(text: string, options?: {
        onLoadingStart?: () => void;
        onLoadingEnd?: () => void;
        onError?: (error: string) => void;
    }): Promise<void> {
        const cleanedText = this.cleanText(text);
        return this.speak(cleanedText, options);
    }
}

// Export singleton instance
export const improvedTTSService = ImprovedTTSService.getInstance();