// Mock email service for development when SMTP is not available
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
    try {
        // Log email details instead of actually sending
        console.log('📧 Mock Email Service - Email would be sent:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('HTML length:', html.length);
        if (attachments) {
            console.log('Attachments:', attachments.length);
        }

        // Simulate successful sending
        const mockMessageId = `mock-${Date.now()}@localhost`;
        console.log('✅ Mock email sent successfully with ID:', mockMessageId);

        return { success: true, messageId: mockMessageId };
    } catch (error) {
        console.error('❌ Mock email error:', error);
        throw error;
    }
}

export async function testEmailConnection() {
    console.log('🔧 Mock email connection test - always returns true');
    return true;
}