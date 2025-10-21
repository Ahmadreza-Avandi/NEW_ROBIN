const { google } = require('googleapis');
const nodemailer = require('nodemailer');

class GmailOAuthService {
    constructor() {
        this.oauth2Client = null;
        this.transporter = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🔧 Initializing Gmail OAuth service...');

            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
            const userEmail = process.env.EMAIL_USER;

            if (!clientId || !clientSecret || !refreshToken || !userEmail) {
                console.log('❌ Missing OAuth credentials');
                return false;
            }

            // Create OAuth2 client
            this.oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'https://developers.google.com/oauthplayground'
            );

            this.oauth2Client.setCredentials({
                refresh_token: refreshToken
            });

            // Get fresh access token
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            const accessToken = credentials.access_token;

            console.log('✅ Fresh access token obtained');

            // Create transporter with OAuth2
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: userEmail,
                    clientId: clientId,
                    clientSecret: clientSecret,
                    refreshToken: refreshToken,
                    accessToken: accessToken
                }
            });

            this.initialized = true;
            console.log('✅ Gmail OAuth service initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Gmail OAuth initialization failed:', error);
            return false;
        }
    }

    async sendEmail(to, subject, html) {
        try {
            if (!this.initialized) {
                const initResult = await this.initialize();
                if (!initResult) {
                    return { success: false, error: 'Service not initialized' };
                }
            }

            // Get fresh access token for each email
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            const accessToken = credentials.access_token;

            // Update transporter with fresh token
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken: accessToken
                }
            });

            const mailOptions = {
                from: `"CRM System" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', result.messageId);

            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Email sending failed:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        try {
            if (!this.initialized) {
                const initResult = await this.initialize();
                if (!initResult) {
                    return false;
                }
            }

            // Get fresh access token
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            console.log('✅ Access token refreshed for connection test');

            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }
}

module.exports = new GmailOAuthService();