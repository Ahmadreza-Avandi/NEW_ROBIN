// Sahab Text-to-Speech Service - New API Implementation
export class SahabTTS {
    private static instance: SahabTTS;
    private gatewayToken: string = 'eyJhbGciOiJIUzI1NiJ9.eyJzeXN0ZW0iOiJzYWhhYiIsImNyZWF0ZVRpbWUiOiIxNDA0MDYwNDIxMTQ1NDgyNCIsInVuaXF1ZUZpZWxkcyI6eyJ1c2VybmFtZSI6ImU2ZTE2ZWVkLTkzNzEtNGJlOC1hZTBiLTAwNGNkYjBmMTdiOSJ9LCJncm91cE5hbWUiOiJkZjk4NTY2MTZiZGVhNDE2NGQ4ODMzZmRkYTUyOGUwNCIsImRhdGEiOnsic2VydmljZUlEIjoiZGY1M2E3ODAtMjE1OC00NTI0LTkyNDctYzZmMGJhZDNlNzcwIiwicmFuZG9tVGV4dCI6InJtWFJSIn19.6wao3Mps4YOOFh-Si9oS5JW-XZ9RHR58A1CWgM0DUCg';
    private apiUrl: string = (process.env.SPEECH_UPSTREAM_HOST || 'https://api.ahmadreza-avandi.ir').replace(/\/$/, '') + '/text-to-speech';
    private isSpeaking: boolean = false;
    private currentAudio: HTMLAudioElement | null = null;
    private isLoading: boolean = false;

    static getInstance(): SahabTTS {
        if (!SahabTTS.instance) {
            SahabTTS.instance = new SahabTTS();
        }
        return SahabTTS.instance;
    }

    // Set gateway token
    setGatewayToken(token: string): void {
        this.gatewayToken = token;
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

    // Main speak method using Sahab API
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
            console.log('🎵 شروع تبدیل متن به صدا با Sahab API:', text.substring(0, 50) + '...');

            // Prepare headers
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("gateway-token", this.gatewayToken);

            // Prepare request body
            const requestBody = {
                "data": text,
                "filePath": "true",
                "base64": "0",
                "checksum": "1",
                "speaker": options?.speaker || "3"
            };

            // Make API request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                redirect: 'follow'
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            // Parse response
            const result = await response.text();
            console.log('📥 Sahab API Response:', result.substring(0, 200) + '...');

            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            } catch (parseError) {
                console.error('❌ Failed to parse API response:', parseError);
                throw new Error('پاسخ API قابل تجزیه نیست');
            }

            // Check response status
            if (parsedResult.status !== 'success') {
                const errorMessage = parsedResult.error || 'خطای نامشخص در API';
                console.error('❌ API Error:', errorMessage);
                options?.onError?.(errorMessage);
                throw new Error(`خطای API: ${errorMessage}`);
            }

            // Check if we have audio data
            if (!parsedResult.data || !parsedResult.data.base64) {
                console.error('❌ No audio data in response:', parsedResult);
                throw new Error('داده صوتی در پاسخ یافت نشد');
            }

            // Convert base64 to audio and play
            await this.playBase64Audio(parsedResult.data.base64);

            console.log('✅ Sahab TTS completed successfully');

        } catch (error) {
            console.error('❌ Sahab TTS Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
            options?.onError?.(errorMessage);
            throw error;
        } finally {
            this.isLoading = false;
            options?.onLoadingEnd?.();
        }
    }

    // Play base64 audio data
    private async playBase64Audio(base64Data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Stop any current audio
                this.stop();

                // Create audio blob from base64
                const audioBlob = this.base64ToBlob(base64Data, 'audio/wav');
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
            return new Blob([byteArray], { type: mimeType });
        } catch (error) {
            console.error('❌ Error converting base64 to blob:', error);
            throw new Error('خطا در تبدیل داده صوتی');
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

    // Get available speakers (based on API documentation)
    getAvailableSpeakers(): Array<{ id: string; name: string; description: string }> {
        return [
            { id: '1', name: 'صدای 1', description: 'صدای مردانه' },
            { id: '2', name: 'صدای 2', description: 'صدای زنانه' },
            { id: '3', name: 'صدای 3', description: 'صدای زنانه (پیشفرض)' },
            { id: '4', name: 'صدای 4', description: 'صدای مردانه' },
            { id: '5', name: 'صدای 5', description: 'صدای زنانه' }
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
export const sahabTTS = SahabTTS.getInstance();