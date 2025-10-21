import { NextRequest, NextResponse } from 'next/server';
import { expressEmailService } from '@/lib/express-email-service';

export async function POST(request: NextRequest) {
    try {
        const { emails, template, variables } = await request.json();

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({
                error: 'Missing or invalid emails array'
            }, { status: 400 });
        }

        // Validate each email object
        for (const email of emails) {
            if (!email.to || !email.subject) {
                return NextResponse.json({
                    error: 'Each email must have to and subject fields'
                }, { status: 400 });
            }
        }

        // Test Express email service availability
        const serviceTest = await expressEmailService.testConnection();
        if (!serviceTest) {
            return NextResponse.json({
                success: false,
                error: 'Express email service not available - please start the Express email service on port 3001'
            }, { status: 500 });
        }

        let results;

        if (template) {
            // Send template emails with different variables for each recipient
            const templateEmails = emails.map((email: any) => ({
                to: email.to,
                subject: email.subject,
                html: template,
                variables: { ...variables, ...email.variables }
            }));

            results = [];
            for (const email of templateEmails) {
                const result = await expressEmailService.sendTemplateEmail(
                    email.to,
                    email.subject,
                    email.html,
                    email.variables
                );
                results.push({
                    to: email.to,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error
                });

                // Small delay between emails
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } else {
            // Send bulk simple emails
            results = await expressEmailService.sendBulkEmails(emails);
        }

        const successCount = results.filter((r: any) => r.success).length;
        const failureCount = results.length - successCount;

        return NextResponse.json({
            success: true,
            totalSent: results.length,
            successCount,
            failureCount,
            results
        });

    } catch (error) {
        console.error('Bulk email API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}