// Sahab Speech Recognition Service
export class SahabSpeechRecognition {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording = false;
    private stream: MediaStream | null = null;
    private readonly gatewayToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzeXN0ZW0iOiJzYWhhYiIsImNyZWF0ZVRpbWUiOiIxNDA0MDYwNjIzMjM1MDA3MCIsInVuaXF1ZUZpZWxkcyI6eyJ1c2VybmFtZSI6ImU2ZTE2ZWVkLTkzNzEtNGJlOC1hZTBiLTAwNGNkYjBmMTdiOSJ9LCJncm91cE5hbWUiOiIxMmRhZWM4OWE4M2EzZWU2NWYxZjMzNTFlMTE4MGViYiIsImRhdGEiOnsic2VydmljZUlEIjoiOWYyMTU2NWMtNzFmYS00NWIzLWFkNDAtMzhmZjZhNmM1YzY4IiwicmFuZG9tVGV4dCI6Ik9WVVZyIn19.sEUI-qkb9bT9eidyrj1IWB5Kwzd8A2niYrBwe1QYfpY';

    constructor() {
        console.log('🎤 Sahab Speech Recognition Service initialized');
    }

    // Check if browser supports audio recording
    isSupported(): boolean {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            window.MediaRecorder);
    }

    // Start recording audio
    async startRecording(): Promise<void> {
        console.log('🎤 درخواست شروع ضبط...');

        if (this.isRecording) {
            console.warn('⚠️ ضبط در حال حاضر در جریان است');
            throw new Error('در حال حاضر ضبط در جریان است');
        }

        if (!this.isSupported()) {
            console.error('❌ مرورگر از ضبط پشتیبانی نمی‌کند');
            throw new Error('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند');
        }

        try {
            console.log('🎤 درخواست دسترسی به میکروفون...');

            // Get microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });

            console.log('✅ دسترسی به میکروفون موفق');

            // Clear previous chunks
            this.audioChunks = [];

            // Create MediaRecorder with appropriate format
            const options = {
                mimeType: 'audio/webm;codecs=opus'
            };

            console.log('🔧 بررسی پشتیبانی از فرمت‌های صوتی...');

            // Fallback mime types
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log('⚠️ webm/opus پشتیبانی نمی‌شود، تلاش برای فرمت‌های دیگر...');
                if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    options.mimeType = 'audio/mp4';
                    console.log('✅ استفاده از فرمت mp4');
                } else if (MediaRecorder.isTypeSupported('audio/wav')) {
                    options.mimeType = 'audio/wav';
                    console.log('✅ استفاده از فرمت wav');
                } else {
                    delete (options as any).mimeType;
                    console.log('⚠️ استفاده از فرمت پیش‌فرض مرورگر');
                }
            } else {
                console.log('✅ استفاده از فرمت webm/opus');
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            console.log('✅ MediaRecorder ایجاد شد با فرمت:', this.mediaRecorder.mimeType);

            // Handle data available
            this.mediaRecorder.ondataavailable = (event) => {
                console.log('📊 داده صوتی دریافت شد:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstart = () => {
                console.log('🎤 ضبط شروع شد');
            };

            this.mediaRecorder.onstop = () => {
                console.log('⏹️ ضبط متوقف شد');
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('❌ خطا در MediaRecorder:', event);
            };

            // Start recording
            this.mediaRecorder.start(1000);
            this.isRecording = true;

            console.log('🎤 شروع ضبط صدا برای ساهاب...');

        } catch (error) {
            console.error('❌ خطا در شروع ضبط:', {
                error: error,
                message: error instanceof Error ? error.message : 'خطای نامشخص',
                name: error instanceof Error ? error.name : undefined
            });
            throw new Error('خطا در دسترسی به میکروفون: ' + (error instanceof Error ? error.message : 'خطای نامشخص'));
        }
    }

    // Stop recording and return audio blob
    async stopRecording(): Promise<Blob> {
        console.log('⏹️ درخواست توقف ضبط...');

        if (!this.isRecording || !this.mediaRecorder) {
            console.error('❌ ضبط در جریان نیست');
            throw new Error('ضبط در جریان نیست');
        }

        console.log('📊 تعداد chunks ضبط شده:', this.audioChunks.length);

        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('MediaRecorder not available'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                console.log('⏹️ MediaRecorder متوقف شد');
                console.log('📊 تعداد نهایی chunks:', this.audioChunks.length);

                const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
                console.log('📊 حجم کل داده‌های صوتی:', totalSize, 'bytes');

                const audioBlob = new Blob(this.audioChunks, {
                    type: this.mediaRecorder?.mimeType || 'audio/webm'
                });

                console.log('📁 فایل صوتی نهایی:', {
                    size: audioBlob.size,
                    type: audioBlob.type
                });

                // Clean up
                this.cleanup();

                console.log('✅ ضبط متوقف شد، حجم فایل:', audioBlob.size, 'bytes');
                resolve(audioBlob);
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('❌ خطا در ضبط:', event);
                this.cleanup();
                reject(new Error('خطا در ضبط صدا'));
            };

            console.log('⏹️ ارسال دستور توقف به MediaRecorder...');
            this.mediaRecorder.stop();
            this.isRecording = false;
        });
    }

    // Convert audio blob to base64
    private async audioToBase64(audioBlob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (data:audio/webm;base64,)
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('خطا در تبدیل فایل به base64'));
            reader.readAsDataURL(audioBlob);
        });
    }

    // Send audio to Sahab API and get text (using backend endpoint)
    async convertToText(audioBlob: Blob): Promise<string> {
        try {
            console.log('🔄 شروع تبدیل صدا به متن با backend API...');
            console.log('📁 اطلاعات فایل صوتی:', {
                size: audioBlob.size,
                type: audioBlob.type
            });

            if (audioBlob.size === 0) {
                throw new Error('فایل صوتی خالی است');
            }

            console.log('🔄 تبدیل صدا به base64...');
            const base64Audio = await this.audioToBase64(audioBlob);
            console.log('✅ تبدیل به base64 انجام شد، طول:', base64Audio.length);

            console.log('📤 ارسال درخواست به backend API...');

            // Use our backend API instead of direct Sahab call
            const response = await fetch('/api/voice-analysis/sahab-speech-recognition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    data: base64Audio,
                    language: 'fa'
                })
            });

            console.log('📥 پاسخ backend API دریافت شد:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
                console.error('❌ Backend API Error:', errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('📥 پاسخ JSON از backend:', result);

            if (!result.success) {
                const errorMessage = result.message || 'خطای نامشخص در API';
                console.error('❌ Backend API Error:', errorMessage);
                throw new Error(errorMessage);
            }

            if (!result.data || !result.data.text) {
                console.error('❌ No text in backend response:', result);
                throw new Error('متن تشخیص داده شده یافت نشد');
            }

            const transcript = result.data.text.trim();
            console.log('✅ متن تشخیص داده شده:', transcript);
            console.log('📊 اعتماد:', result.data.confidence);

            // بررسی اینکه متن معنادار باشد
            if (transcript.length < 2) {
                throw new Error('متن تشخیص داده شده خیلی کوتاه است');
            }

            return transcript;

        } catch (error) {
            console.error('❌ خطای کامل در تبدیل صدا به متن:', {
                error: error,
                message: error instanceof Error ? error.message : 'خطای نامشخص',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    // Start recording and return a promise that resolves when manually stopped
    async startRecordingSession(): Promise<{
        stop: () => Promise<string>;
        isRecording: () => boolean;
    }> {
        console.log('🎤 شروع جلسه ضبط با ساهاب...');

        // Start recording
        await this.startRecording();

        return {
            stop: async () => {
                if (this.isRecording) {
                    const audioBlob = await this.stopRecording();
                    const text = await this.convertToText(audioBlob);
                    return text;
                } else {
                    throw new Error('ضبط در جریان نیست');
                }
            },
            isRecording: () => this.isRecording
        };
    }

    // Complete record and convert process (for backward compatibility)
    async recordAndConvert(maxDuration: number = 30000): Promise<string> {
        console.log('🎤 شروع فرآیند کامل ضبط و تبدیل با ساهاب...');

        // Start recording
        await this.startRecording();

        return new Promise((resolve, reject) => {
            // Set timeout for maximum recording duration
            const timeout = setTimeout(async () => {
                try {
                    if (this.isRecording) {
                        const audioBlob = await this.stopRecording();
                        const text = await this.convertToText(audioBlob);
                        resolve(text);
                    }
                } catch (error) {
                    reject(error);
                }
            }, maxDuration);

            // For manual stop (in real implementation, you'd have a UI button)
            // For now, we'll auto-stop after the timeout
        });
    }

    // Manual stop method for UI integration
    async stopAndConvert(): Promise<string> {
        if (!this.isRecording) {
            throw new Error('ضبط در جریان نیست');
        }

        try {
            const audioBlob = await this.stopRecording();
            const text = await this.convertToText(audioBlob);
            return text;
        } catch (error) {
            this.cleanup();
            throw error;
        }
    }

    // Clean up resources
    private cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    // Get recording status
    getStatus(): {
        isRecording: boolean;
        isSupported: boolean;
        duration: number;
    } {
        return {
            isRecording: this.isRecording,
            isSupported: this.isSupported(),
            duration: this.audioChunks.length * 1000 // Approximate duration
        };
    }

    // Stop current recording (public method)
    async stop(): Promise<void> {
        if (this.isRecording && this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        this.cleanup();
    }

    // Test microphone access
    async testMicrophone(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ دسترسی به میکروفون تأیید شد');
            return true;
        } catch (error) {
            console.error('❌ خطا در دسترسی به میکروفون:', error);
            return false;
        }
    }
}

// Export singleton
export const sahabSpeechRecognition = new SahabSpeechRecognition();