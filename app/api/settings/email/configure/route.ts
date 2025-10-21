import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/settings-service';
import { emailService } from '@/lib/email-service';

export async function GET(request: NextRequest) {
    try {
        const config = await settingsService.getEmailConfig();

        // Don't return sensitive password in response
        const safeConfig = {
            ...config,
            smtp_password: config.smtp_password ? '••••••••' : ''
        };

        return NextResponse.json({
            config: safeConfig
        });
    } catch (error) {
        console.error('Error fetching email configuration:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const configData = await request.json();

        // Validate configuration
        const validation = await settingsService.validateEmailConfig(configData);
        if (!validation.valid) {
            return NextResponse.json(
                { error: 'Invalid configuration', details: validation.errors },
                { status: 400 }
            );
        }

        // Save configuration
        const success = await settingsService.setEmailConfig(configData);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to save email configuration' },
                { status: 500 }
            );
        }

        // Test the email configuration if enabled
        let testResult = null;
        if (configData.enabled) {
            try {
                // Reinitialize email service with new config
                await emailService.initialize();
                testResult = { success: true, message: 'Email service initialized successfully' };
            } catch (error) {
                testResult = {
                    success: false,
                    message: error instanceof Error ? error.message : 'Email service test failed'
                };
            }
        }

        return NextResponse.json({
            success: true,
            message: 'تنظیمات ایمیل با موفقیت ذخیره شد',
            testResult
        });
    } catch (error) {
        console.error('Error saving email configuration:', error);
        return NextResponse.json(
            { error: 'Failed to save email configuration' },
            { status: 500 }
        );
    }
}