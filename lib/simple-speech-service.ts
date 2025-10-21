// Simple Speech Recognition Service
export class SimpleSpeechService {
    private recognition: any = null;
    private isListening = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
        }
    }

    private setupRecognition() {
        if (!this.recognition) return;

        this.recognition.lang = 'fa-IR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
    }

    async startListening(): Promise<string> {
        if (!this.isSupported()) {
            throw new Error('تشخیص گفتار پشتیبانی نمی‌شود');
        }

        if (this.isListening) {
            throw new Error('در حال حاضر در حال گوش دادن است');
        }

        return new Promise((resolve, reject) => {
            let finalTranscript = '';

            this.recognition.onstart = () => {
                console.log('شروع تشخیص گفتار');
                this.isListening = true;
            };

            this.recognition.onresult = (event: any) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                console.log('Interim:', interimTranscript);
                console.log('Final:', finalTranscript);
            };

            this.recognition.onend = () => {
                console.log('پایان تشخیص گفتار');
                this.isListening = false;

                if (finalTranscript.trim()) {
                    resolve(finalTranscript.trim());
                } else {
                    reject(new Error('متنی تشخیص داده نشد'));
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('خطا در تشخیص گفتار:', event.error);
                this.isListening = false;
                reject(new Error(`خطا در تشخیص گفتار: ${event.error}`));
            };

            try {
                this.recognition.start();
            } catch (error) {
                this.isListening = false;
                reject(new Error('خطا در شروع تشخیص گفتار'));
            }
        });
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    isSupported(): boolean {
        return this.recognition !== null;
    }

    isCurrentlyListening(): boolean {
        return this.isListening;
    }
}

// Simple TTS Service
export class SimpleTTSService {
    async speak(text: string): Promise<void> {
        try {
            // Try API first
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

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.audioContent) {
                    await this.playAudio(result.audioContent);
                    return;
                }
            }

            // Fallback to browser TTS
            this.speakWithBrowser(text);
        } catch (error) {
            console.error('خطا در TTS API:', error);
            this.speakWithBrowser(text);
        }
    }

    private async playAudio(base64Audio: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const byteCharacters = atob(base64Audio);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);

                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };

                audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl);
                    reject(new Error('خطا در پخش صدا'));
                };

                audio.play().catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    private speakWithBrowser(text: string) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fa-IR';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    stop() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
}

// Export singletons
export const simpleSpeechService = new SimpleSpeechService();
export const simpleTTSService = new SimpleTTSService();