// SMS Service for sending text messages
// این سرویس از API های مختلف پیامک ایران پشتیبانی می‌کند

class SMSService {
    constructor() {
        this.initialized = false;
        this.provider = null;
        this.config = null;
    }

    async initialize() {
        if (!this.initialized) {
            console.log('🔧 Initializing SMS Service...');

            // Try different SMS providers
            const providers = [
                this.initializeKaveNegar,
                this.initializeMelliPayamak,
                this.initializeGhasedak,
                this.initializeFarapayamak
            ];

            for (const initProvider of providers) {
                try {
                    const result = await initProvider.call(this);
                    if (result) {
                        this.initialized = true;
                        console.log(`✅ SMS Service initialized with ${this.provider}`);
                        return true;
                    }
                } catch (error) {
                    console.log(`⚠️ ${initProvider.name} failed:`, error.message);
                }
            }

            console.error('❌ Failed to initialize SMS Service - no provider available');
        }
        return this.initialized;
    }

    // کاوه نگار
    async initializeKaveNegar() {
        const apiKey = process.env.KAVENEGAR_API_KEY;
        if (!apiKey) return false;

        this.provider = 'KaveNegar';
        this.config = {
            apiKey,
            baseUrl: 'https://api.kavenegar.com/v1',
            sender: process.env.KAVENEGAR_SENDER || '10008663'
        };
        return true;
    }

    // ملی پیامک
    async initializeMelliPayamak() {
        const username = process.env.MELLIPAYAMAK_USERNAME;
        const password = process.env.MELLIPAYAMAK_PASSWORD;
        if (!username || !password) return false;

        this.provider = 'MelliPayamak';
        this.config = {
            username,
            password,
            baseUrl: 'https://rest.payamak-panel.com/api/SendSMS',
            sender: process.env.MELLIPAYAMAK_SENDER || '50004001'
        };
        return true;
    }

    // قاصدک
    async initializeGhasedak() {
        const apiKey = process.env.GHASEDAK_API_KEY;
        if (!apiKey) return false;

        this.provider = 'Ghasedak';
        this.config = {
            apiKey,
            baseUrl: 'https://api.ghasedak.me/v2',
            sender: process.env.GHASEDAK_SENDER || '10008566'
        };
        return true;
    }

    // فراپیامک
    async initializeFarapayamak() {
        const username = process.env.FARAPAYAMAK_USERNAME;
        const password = process.env.FARAPAYAMAK_PASSWORD;
        if (!username || !password) return false;

        this.provider = 'Farapayamak';
        this.config = {
            username,
            password,
            baseUrl: 'https://rest.ippanel.com/v1',
            sender: process.env.FARAPAYAMAK_SENDER || '983000505'
        };
        return true;
    }

    async testConnection() {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.initialized) {
            return false;
        }

        try {
            // Test with a dummy number (won't actually send)
            const testResult = await this.validateNumber('09123456789');
            return testResult;
        } catch (error) {
            console.error('SMS connection test failed:', error);
            return false;
        }
    }

    validateNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');

        // Check Iranian mobile number format
        const iranMobileRegex = /^(\+98|0098|98|0)?9\d{9}$/;

        if (iranMobileRegex.test(cleaned)) {
            // Normalize to 09xxxxxxxxx format
            const normalized = cleaned.replace(/^(\+98|0098|98)/, '0');
            return normalized.startsWith('0') ? normalized : '0' + normalized;
        }

        return null;
    }

    async sendSMS(options) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.initialized) {
            return {
                success: false,
                error: 'SMS service not configured'
            };
        }

        const { to, message, sender } = options;

        // Validate phone number
        const validNumber = this.validateNumber(to);
        if (!validNumber) {
            return {
                success: false,
                error: 'شماره تلفن نامعتبر است'
            };
        }

        try {
            let result;

            switch (this.provider) {
                case 'KaveNegar':
                    result = await this.sendKaveNegar(validNumber, message, sender);
                    break;
                case 'MelliPayamak':
                    result = await this.sendMelliPayamak(validNumber, message, sender);
                    break;
                case 'Ghasedak':
                    result = await this.sendGhasedak(validNumber, message, sender);
                    break;
                case 'Farapayamak':
                    result = await this.sendFarapayamak(validNumber, message, sender);
                    break;
                default:
                    throw new Error('No SMS provider configured');
            }

            return result;
        } catch (error) {
            console.error('SMS sending failed:', error);
            return {
                success: false,
                error: error.message || 'خطا در ارسال پیامک'
            };
        }
    }

    async sendKaveNegar(to, message, sender) {
        const url = `${this.config.baseUrl}/${this.config.apiKey}/sms/send.json`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                receptor: to,
                message: message,
                sender: sender || this.config.sender
            })
        });

        const data = await response.json();

        if (data.return && data.return.status === 200) {
            return {
                success: true,
                messageId: data.entries[0].messageid,
                provider: 'KaveNegar'
            };
        } else {
            throw new Error(data.return?.message || 'خطا در ارسال پیامک');
        }
    }

    async sendMelliPayamak(to, message, sender) {
        const response = await fetch(this.config.baseUrl + '/SendSMS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.config.username,
                password: this.config.password,
                to: [to],
                from: sender || this.config.sender,
                text: message,
                isflash: false
            })
        });

        const data = await response.json();

        if (data.RetStatus === 1) {
            return {
                success: true,
                messageId: data.Value,
                provider: 'MelliPayamak'
            };
        } else {
            throw new Error(data.StrRetStatus || 'خطا در ارسال پیامک');
        }
    }

    async sendGhasedak(to, message, sender) {
        const response = await fetch(`${this.config.baseUrl}/sms/send/simple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.config.apiKey
            },
            body: JSON.stringify({
                message: message,
                receptor: to,
                linenumber: sender || this.config.sender
            })
        });

        const data = await response.json();

        if (data.result && data.result.code === 200) {
            return {
                success: true,
                messageId: data.result.items[0].messageid,
                provider: 'Ghasedak'
            };
        } else {
            throw new Error(data.result?.message || 'خطا در ارسال پیامک');
        }
    }

    async sendFarapayamak(to, message, sender) {
        const response = await fetch(`${this.config.baseUrl}/messages/patterns/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `AccessKey ${this.config.username}:${this.config.password}`
            },
            body: JSON.stringify({
                pattern_code: 'simple',
                originator: sender || this.config.sender,
                recipient: to,
                values: {
                    message: message
                }
            })
        });

        const data = await response.json();

        if (data.status === 'OK') {
            return {
                success: true,
                messageId: data.bulk_id,
                provider: 'Farapayamak'
            };
        } else {
            throw new Error(data.message || 'خطا در ارسال پیامک');
        }
    }

    async sendBulkSMS(messages) {
        const results = [];

        for (const sms of messages) {
            const result = await this.sendSMS(sms);
            results.push(result);

            // Add delay between messages to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return results;
    }

    // Template-based SMS sending
    async sendTemplateSMS(to, template, variables = {}) {
        let processedTemplate = template;

        // Replace variables in template
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processedTemplate = processedTemplate.replace(regex, value);
        });

        return this.sendSMS({
            to,
            message: processedTemplate
        });
    }

    // Get service status
    getStatus() {
        return {
            initialized: this.initialized,
            provider: this.provider,
            config: this.config ? {
                provider: this.provider,
                sender: this.config.sender
            } : null
        };
    }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;