import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { backupService } from '@/lib/backup';

export async function POST(request: NextRequest) {
    try {
        const { emailRecipient, includeEmail = false } = await request.json();

        // Validate email if provided
        if (includeEmail && emailRecipient) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailRecipient)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        // Test if mysqldump is available
        const mysqldumpTest = await backupService.testMysqldump();
        if (!mysqldumpTest.available) {
            return NextResponse.json(
                {
                    error: 'Backup service not available',
                    details: mysqldumpTest.error
                },
                { status: 500 }
            );
        }

        // Create backup record
        const result = await executeSingle(
            `INSERT INTO backup_history (type, status, email_recipient, created_at) 
       VALUES (?, ?, ?, ?)`,
            [
                'manual',
                'in_progress',
                emailRecipient || null,
                new Date()
            ]
        );

        const backupId = result.insertId;

        try {
            // Start backup process
            console.log(`Starting backup process for backup ID: ${backupId}`);

            const backupResult = await backupService.createBackup({
                compress: true, // Enable compression
                includeData: true, // Include data
                excludeTables: ['system_logs'] // Exclude logs table to reduce size
            });

            if (backupResult.success) {
                // Update backup record with success
                await executeSingle(
                    `UPDATE backup_history 
           SET status = ?, file_path = ?, file_size = ?, completed_at = ?
           WHERE id = ?`,
                    [
                        'completed',
                        backupResult.filePath,
                        backupResult.fileSize,
                        new Date(),
                        backupId
                    ]
                );

                // Log successful backup
                await executeSingle(
                    'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                    [
                        'backup_created',
                        'success',
                        JSON.stringify({
                            backupId,
                            fileName: backupResult.fileName,
                            fileSize: backupResult.fileSize,
                            duration: backupResult.duration,
                            compressed: true
                        })
                    ]
                );

                // Send email if requested
                if (includeEmail && emailRecipient) {
                    await sendBackupEmail(emailRecipient, backupResult);
                }

                return NextResponse.json({
                    success: true,
                    message: 'بک‌آپ با موفقیت ایجاد شد',
                    backup: {
                        id: backupId,
                        filePath: backupResult.filePath,
                        fileName: backupResult.fileName,
                        fileSize: backupResult.fileSize,
                        downloadUrl: `/api/settings/backup/download/${backupId}`,
                        createdAt: new Date().toISOString(),
                        duration: backupResult.duration
                    }
                });
            } else {
                // Update backup record with failure
                await executeSingle(
                    `UPDATE backup_history 
           SET status = ?, error_message = ?, completed_at = ?
           WHERE id = ?`,
                    [
                        'failed',
                        backupResult.error,
                        new Date(),
                        backupId
                    ]
                );

                // Log failed backup
                await executeSingle(
                    'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                    [
                        'backup_created',
                        'failed',
                        JSON.stringify({
                            backupId,
                            error: backupResult.error,
                            duration: backupResult.duration
                        })
                    ]
                );

                return NextResponse.json(
                    {
                        success: false,
                        message: 'خطا در ایجاد بک‌آپ',
                        error: backupResult.error
                    },
                    { status: 500 }
                );
            }
        } catch (backupError) {
            // Update backup record with failure
            await executeSingle(
                `UPDATE backup_history 
         SET status = ?, error_message = ?, completed_at = ?
         WHERE id = ?`,
                [
                    'failed',
                    backupError instanceof Error ? backupError.message : 'Unknown error',
                    new Date(),
                    backupId
                ]
            );

            throw backupError;
        }
    } catch (error) {
        console.error('Error creating manual backup:', error);
        return NextResponse.json(
            { error: 'Failed to create backup' },
            { status: 500 }
        );
    }
}

async function sendBackupEmail(recipient: string, backupResult: any) {
    try {
        // Use the email service to send backup notification
        const { emailService } = await import('@/lib/email-service');

        const result = await emailService.sendBackupEmail(backupResult, recipient);

        if (result.success) {
            console.log('✅ Backup email sent successfully to:', recipient);
        } else {
            console.error('❌ Failed to send backup email:', result.error);
        }

        return result;
    } catch (error) {
        console.error('Error sending backup email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}