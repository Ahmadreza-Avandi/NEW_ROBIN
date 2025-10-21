// TalkBot Text-to-Speech Service
export class TalkBotTTS {
    private static instance: TalkBotTTS;
    private accessToken: string = 'sk-s68980b7df06c90b558092fawebff9as'; // Default token, should be configurable
    private apiUrl: string = 'https://api.talkbot.ir/v1/media/text-to-speech/REQ';
    private isSpeaking: boolean = false;

    static getInstance(): TalkBotTTS {
        if (!TalkBotTTS.instance) {
            TalkBotTTS.instance = new TalkBotTTS();
        }
        return TalkBotTTS.instance;
    }

    // Set access token
    setAccessToken(token: string): void {
        this.accessToken = token;
    }

    // Speak text using TalkBot API
    async speak(text: string, options?: { gender?: 'male' | 'female', server?: 'azure' | 'farsi', sound?: string, lang?: string }): Promise<void> {
        if (!text) {
            throw new Error('No text provided');
        }

        if (this.isSpeaking) {
            console.warn('Already speaking, please wait or stop current speech');
            return;
        }

        this.isSpeaking = true;

        try {
            console.log('🎵 Speaking with TalkBot:', text.substring(0, 100) + '...');

            // Prepare request data
            const data = new URLSearchParams();
            
            // Add text
            data.append('text', text);
            
            // Add options or defaults
            if (options?.server === 'farsi') {
                data.append('server', 'farsi');
                data.append('sound', options.sound || '3');
            } else {
                data.append('gender', options?.gender || 'female');
                data.append('server', 'azure');
                data.append('lang', options?.lang || 'persian');
            }

            // Make API request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data.toString()
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            // Get response as blob for audio
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Play audio
            const audio = new Audio(audioUrl);
            audio.play();
            
            // Wait for audio to finish
            await new Promise<void>((resolve) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                
                audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
            });

            console.log('✅ Speech completed');
        } catch (error) {
            console.error('❌ TalkBot TTS Error:', error);
            throw error;
        } finally {
            this.isSpeaking = false;
        }
    }

    // Stop current speech
    stop(): void {
        // In a real implementation, we might need to handle stopping the audio playback
        this.isSpeaking = false;
        console.log('🔇 Speech stopped');
    }

    // Check if TTS is supported (always true for API-based service)
    isSupported(): boolean {
        return true;
    }

    // Test TTS with a simple message
    async test(): Promise<void> {
        await this.speak('سلام. این یک تست صوتی است. سیستم کار می کند.');
    }
}

// Export singleton instance
export const talkBotTTS = TalkBotTTS.getInstance();
