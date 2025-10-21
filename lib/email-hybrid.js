// سرویس ایمیل هیبرید - ابتدا Gmail API، سپس SMTP
let gmailService;
try {
    // Try different import paths for different environments
    try {
        gmailService = require('./gmail-api.js');
    } catch (e) {
        try {
            gmailService = require('../lib/gmail-api.js');
        } catch (e2) {
            gmailService = require(require('path').resolve(process.cwd(), 'lib/gmail-api.js'));
        }
    }
} catch (error) {
    console.warn('Gmail service not available:', error.message);
    gmailService = null;
}
const emailFallbackService = require('./email-fallback.js');

class EmailHybridService {
    constructor() {
        this.primaryService = gmailService;
        this.fallbackService = emailFallbackService;
    }

    async sendEmail(options) {
        console.log('📧 Attempting to send email...');

        try {
            // Try Gmail API first
            console.log('🔄 Trying Gmail API...');

            if (!this.primaryService.gmail) {
                await this.primaryService.initializeFromEnv();
            }

            if (this.primaryService.initialized) {
                const result = await this.primaryService.sendEmail(options);

                if (result.success) {
                    console.log('✅ Email sent via Gmail API');
                    return {
                        ...result,
                        service: 'Gmail API'
                    };
                } else {
                    console.log('⚠️ Gmail API failed, trying fallback...');
                }
            }
        } catch (error) {
            console.log('⚠️ Gmail API error, trying fallback:', error.message);
        }

        try {
            // Try SMTP fallback
            console.log('🔄 Trying SMTP fallback...');
            const fallbackResult = await this.fallbackService.sendEmail(options);

            if (fallbackResult.success) {
                console.log('✅ Email sent via SMTP fallback');
                return {
                    ...fallbackResult,
                    service: 'SMTP Fallback'
                };
            } else {
                console.log('❌ SMTP fallback also failed');
            }
        } catch (error) {
            console.log('❌ SMTP fallback error:', error.message);
        }

        // Both services failed
        return {
            success: false,
            error: 'All email services failed',
            service: 'None'
        };
    }

    async sendBulkEmails(emails) {
        const results = [];

        for (const email of emails) {
            const result = await this.sendEmail(email);
            results.push(result);

            // Add delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return results;
    }

    async testConnection() {
        console.log('🔍 Testing email services...');

        const gmailTest = await this.primaryService.testConnection();
        const smtpTest = await this.fallbackService.initialize();

        return {
            gmail: gmailTest,
            smtp: smtpTest,
            available: gmailTest || smtpTest
        };
    }

    getStatus() {
        return {
            gmail: this.primaryService.getStatus(),
            smtp: this.fallbackService.getStatus(),
            service: 'Hybrid Email Service'
        };
    }
}

// Create singleton instance
const emailHybridService = new EmailHybridService();

module.exports = emailHybridService;