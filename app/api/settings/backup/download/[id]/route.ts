import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { backupService } from '@/lib/backup';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const backupId = parseInt(params.id);

        if (isNaN(backupId)) {
            return NextResponse.json(
                { error: 'Invalid backup ID' },
                { status: 400 }
            );
        }

        // Get backup record
        const backup = await executeQuery(
            'SELECT * FROM backup_history WHERE id = ? AND status = "completed"',
            [backupId]
        );

        if (!backup || backup.length === 0) {
            return NextResponse.json(
                { error: 'Backup not found or not completed' },
                { status: 404 }
            );
        }

        const backupRecord = backup[0];
        const fileName = backupRecord.file_path ? backupRecord.file_path.split('/').pop() : `crm_backup_${backupId}.sql.gz`;

        // Get the actual file path
        const actualFilePath = await backupService.getBackupFile(fileName);

        if (!actualFilePath) {
            return NextResponse.json(
                { error: 'Backup file not found on disk' },
                { status: 404 }
            );
        }

        try {
            // Get file stats
            const fileStats = await stat(actualFilePath);

            // Create file stream
            const fileStream = createReadStream(actualFilePath);

            // Set headers for file download
            const headers = new Headers();
            headers.set('Content-Type', fileName.endsWith('.gz') ? 'application/gzip' : 'application/sql');
            headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
            headers.set('Content-Length', fileStats.size.toString());
            headers.set('Cache-Control', 'no-cache');

            // Log download activity
            await executeSingle(
                'INSERT INTO system_logs (log_type, status, details) VALUES (?, ?, ?)',
                [
                    'backup_downloaded',
                    'success',
                    JSON.stringify({
                        backupId: backupRecord.id,
                        fileName: fileName,
                        fileSize: fileStats.size,
                        downloadedAt: new Date().toISOString()
                    })
                ]
            );

            // Convert Node.js stream to Web Stream
            const readableStream = new ReadableStream({
                start(controller) {
                    fileStream.on('data', (chunk) => {
                        controller.enqueue(new Uint8Array(chunk));
                    });

                    fileStream.on('end', () => {
                        controller.close();
                    });

                    fileStream.on('error', (error) => {
                        controller.error(error);
                    });
                }
            });

            return new NextResponse(readableStream, {
                status: 200,
                headers
            });

        } catch (fileError) {
            console.error('Error reading backup file:', fileError);
            return NextResponse.json(
                { error: 'Failed to read backup file' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error downloading backup:', error);
        return NextResponse.json(
            { error: 'Failed to download backup' },
            { status: 500 }
        );
    }
}