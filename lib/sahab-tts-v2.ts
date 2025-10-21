// Sahab Text-to-Speech Service V2 - Backend API Implementation
export class SahabTTSV2 {
    private static instance: SahabTTSV2;
    private isSpeaking: boolean = false;
    private currentAudio: HTMLAudioElement | null = null;
    private isLoading: boolean = false;

    static getInstance(): SahabTTSV2 {
        if (!SahabTTSV2.instance) {
            SahabTTSV2.instance = new SahabTTSV2();
        }
        return SahabTTSV2.instance;
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

    // Main speak method using backend API
    async speak(text: string, options?: {
        speaker?: string;
        onLoadingStart?: () => void;
        onLoadingEnd?: () => void;
        onError?: (error: string) => void;
    }): Promise<void> {
        if (!text || text.trim() === '') {
            throw new Error('متن برای تبدیل به صدا ارائه نشده است');
        }

        if (this.isSpeaking) {
            console.warn('در حال حاضر صدایی پخش می‌شود، لطفاً صبر کنید');
            this.stop(); // Stop current audio before starting new one
        }

        this.isLoading = true;
        options?.onLoadingStart?.();

        try {
            console.log('🎵 شروع تبدیل متن به صدا با Sahab API جدید:', text.substring(0, 50) + '...');

            // Call our backend API with new endpoint
            const response = await fetch('/api/voice-analysis/sahab-tts-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: text,
                    speaker: options?.speaker || "3"
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
                console.error('❌ Backend API Error:', errorMessage);
                options?.onError?.(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('📥 Backend API Response:', {
                success: result.success,
                hasAudioData: !!result.data?.audioBase64,
                audioDataLength: result.data?.audioBase64?.length || 0
            });

            if (!result.success) {
                // If backend indicates upstream unreachable, let fallback logic handle it
                if (result.fallback) {
                    console.warn('⚠️ Backend requested fallback:', result.message);
                    throw new Error('UPSTREAM_FALLBACK');
                }

                const errorMessage = result.message || 'خطای نامشخص در API';
                console.error('❌ API Error:', errorMessage);
                options?.onError?.(errorMessage);
                throw new Error(errorMessage);
            }

            // Check if we have audio data or URL
            if (!result.data || (!result.data.audioBase64 && !result.data.audioUrl)) {
                console.error('❌ No audio data or URL in response:', result);
                throw new Error('داده صوتی در پاسخ یافت نشد');
            }

            // Play audio - either from base64 or direct URL
            if (result.data.audioBase64) {
                await this.playBase64Audio(result.data.audioBase64);
            } else if (result.data.audioUrl) {
                console.log('🔄 Using direct URL method for audio playback...');
                await this.playDirectUrl(result.data.audioUrl);
            }

            console.log('✅ Sahab TTS V2 completed successfully');

        } catch (error) {
            console.error('❌ Sahab TTS V2 Error:', error);
            console.log('🔄 Attempting fallback to old Sahab TTS...');

            try {
                // Fallback to old Sahab TTS API
                const fallbackResponse = await fetch('/api/voice-analysis/sahab-tts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        text: text,
                        speaker: options?.speaker || "3"
                    })
                });

                if (fallbackResponse.ok) {
                    const fallbackResult = await fallbackResponse.json();
                    if (fallbackResult.success && fallbackResult.data) {
                        if (fallbackResult.data.audioBase64) {
                            await this.playBase64Audio(fallbackResult.data.audioBase64);
                        } else if (fallbackResult.data.audioUrl) {
                            await this.playDirectUrl(fallbackResult.data.audioUrl);
                        }
                        console.log('✅ Fallback to old Sahab TTS successful');
                        return;
                    }
                }

                // Final fallback to TalkBot TTS
                console.log('🔄 Attempting final fallback to TalkBot TTS...');
                const { talkBotTTS } = await import('./talkbot-tts');
                await talkBotTTS.speak(text, { server: 'farsi', sound: '3' });
                console.log('✅ Final fallback TTS completed successfully');
            } catch (fallbackError) {
                console.error('❌ All TTS methods failed:', fallbackError);
                const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
                options?.onError?.(errorMessage);
                throw error;
            }
        } finally {
            this.isLoading = false;
            options?.onLoadingEnd?.();
        }
    }

    // Play audio from direct URL
    private async playDirectUrl(audioUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Stop any current audio
                this.stop();

                // Create and configure audio element
                const audio = new Audio(audioUrl);
                this.currentAudio = audio;
                this.isSpeaking = true;

                // Set up event listeners
                audio.onended = () => {
                    console.log('✅ Sahab TTS playback completed (direct URL)');
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    resolve();
                };

                audio.onerror = (error) => {
                    console.error('❌ Audio playback error (direct URL):', error);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    reject(new Error('خطا در پخش صدا از URL مستقیم'));
                };

                audio.onloadstart = () => {
                    console.log('🔄 شروع بارگذاری صدا از URL مستقیم...');
                };

                audio.oncanplay = () => {
                    console.log('✅ صدا آماده پخش است (URL مستقیم)');
                };

                // Start playing
                audio.play().catch((playError) => {
                    console.error('❌ Play error (direct URL):', playError);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    reject(new Error('خطا در شروع پخش صدا از URL مستقیم'));
                });

            } catch (error) {
                console.error('❌ Error in playDirectUrl:', error);
                this.isSpeaking = false;
                reject(error);
            }
        });
    }

    // Play base64 audio data
    private async playBase64Audio(base64Data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Stop any current audio
                this.stop();

                // Create audio blob from base64 (auto-detect format)
                const audioBlob = this.base64ToBlob(base64Data, 'audio/mp3');
                const audioUrl = URL.createObjectURL(audioBlob);

                // Create and configure audio element
                const audio = new Audio(audioUrl);
                this.currentAudio = audio;
                this.isSpeaking = true;

                // Set up event listeners
                audio.onended = () => {
                    console.log('✅ Sahab TTS playback completed');
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    resolve();
                };

                audio.onerror = (error) => {
                    console.error('❌ Audio playback error:', error);
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
                    console.error('❌ Play error:', playError);
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    this.isSpeaking = false;
                    reject(new Error('خطا در شروع پخش صدا'));
                });

            } catch (error) {
                console.error('❌ Error in playBase64Audio:', error);
                this.isSpeaking = false;
                reject(error);
            }
        });
    }

    // Convert base64 to blob
    private base64ToBlob(base64: string, mimeType: string): Blob {
        try {
            // Remove data URL prefix if present
            const base64Data = base64.replace(/^data:audio\/[^;]+;base64,/, '');

            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            // Auto-detect audio type from base64 data or use MP3 as default
            const detectedMimeType = this.detectAudioType(base64Data) || 'audio/mp3';

            return new Blob([byteArray], { type: detectedMimeType });
        } catch (error) {
            console.error('❌ Error converting base64 to blob:', error);
            throw new Error('خطا در تبدیل داده صوتی');
        }
    }

    // Detect audio type from base64 data
    private detectAudioType(base64Data: string): string | null {
        try {
            // Decode first few bytes to check file signature
            const firstBytes = atob(base64Data.substring(0, 20));

            // MP3 signature
            if (firstBytes.startsWith('ID3') || (firstBytes.charCodeAt(0) === 0xFF && (firstBytes.charCodeAt(1) & 0xE0) === 0xE0)) {
                return 'audio/mp3';
            }

            // WAV signature
            if (firstBytes.startsWith('RIFF') && firstBytes.includes('WAVE')) {
                return 'audio/wav';
            }

            // OGG signature
            if (firstBytes.startsWith('OggS')) {
                return 'audio/ogg';
            }

            // Default to MP3 for Sahab API
            return 'audio/mp3';
        } catch (error) {
            console.warn('Could not detect audio type, using MP3 as default');
            return 'audio/mp3';
        }
    }

    // Stop current audio playback
    stop(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            console.log('🔇 Sahab TTS stopped');
        }
        this.isSpeaking = false;
        this.isLoading = false;
    }

    // Check if TTS is supported
    isSupported(): boolean {
        return typeof window !== 'undefined' && 'Audio' in window;
    }

    // Test TTS with a simple message
    async test(): Promise<void> {
        await this.speak('سلام. این یک تست سیستم صوتی جدید ساهاب است. کیفیت صدا بسیار عالی است.', {
            speaker: '3',
            onLoadingStart: () => console.log('🔄 شروع تست...'),
            onLoadingEnd: () => console.log('✅ تست تکمیل شد'),
            onError: (error) => console.error('❌ خطا در تست:', error)
        });
    }

    // Get available speakers
    async getAvailableSpeakers(): Promise<Array<{ id: string; name: string; description: string; gender: string; default?: boolean }>> {
        try {
            // Try new API first
            const response = await fetch('/api/voice-analysis/sahab-tts-v2', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.speakers && result.speakers.length > 0) {
                    console.log('✅ Got speakers from new Sahab API V2');
                    return result.speakers;
                }
            }

            // Fallback to old API
            console.log('🔄 Falling back to old Sahab API for speakers');
            const fallbackResponse = await fetch('/api/voice-analysis/sahab-tts', {
                method: 'GET',
                credentials: 'include'
            });

            if (fallbackResponse.ok) {
                const fallbackResult = await fallbackResponse.json();
                if (fallbackResult.speakers && fallbackResult.speakers.length > 0) {
                    return fallbackResult.speakers;
                }
            }
        } catch (error) {
            console.error('Error fetching speakers:', error);
        }

        // Final fallback speakers
        return [
            { id: '1', name: 'صدای 1', description: 'صدای مردانه', gender: 'male' },
            { id: '2', name: 'صدای 2', description: 'صدای زنانه', gender: 'female' },
            { id: '3', name: 'صدای 3', description: 'صدای زنانه (پیشفرض)', gender: 'female', default: true },
            { id: '4', name: 'صدای 4', description: 'صدای مردانه', gender: 'male' },
            { id: '5', name: 'صدای 5', description: 'صدای زنانه', gender: 'female' }
        ];
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
        speaker?: string;
        onLoadingStart?: () => void;
        onLoadingEnd?: () => void;
        onError?: (error: string) => void;
    }): Promise<void> {
        const cleanedText = this.cleanText(text);
        return this.speak(cleanedText, options);
    }
}

// Export singleton instance
export const sahabTTSV2 = SahabTTSV2.getInstance();