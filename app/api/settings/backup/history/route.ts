import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        const offset = (page - 1) * limit;

        // Build query conditions
        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('status = ?');
            queryParams.push(status);
        }
        if (type) {
            whereConditions.push('type = ?');
            queryParams.push(type);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get backup history with pagination
        const backups = await executeQuery(`
      SELECT 
        id,
        type,
        status,
        file_path,
        file_size,
        error_message,
        email_recipient,
        initiated_by,
        created_at,
        completed_at
      FROM backup_history 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

        // Get total count for pagination
        const countResult = await executeQuery(`
      SELECT COUNT(*) as total 
      FROM backup_history 
      ${whereClause}
    `, queryParams);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Format backup data
        const formattedBackups = backups.map(backup => ({
            id: backup.id,
            type: backup.type,
            status: backup.status,
            fileName: backup.file_path ? backup.file_path.split('/').pop() : null,
            fileSize: backup.file_size,
            fileSizeFormatted: backup.file_size ? formatFileSize(backup.file_size) : null,
            createdAt: backup.created_at,
            completedAt: backup.completed_at,
            errorMessage: backup.error_message,
            emailRecipient: backup.email_recipient,
            initiatedBy: {
                email: 'admin@system.com', // In real implementation, join with users table
                name: 'مدیر سیستم'
            },
            downloadUrl: backup.status === 'completed' ? `/api/settings/backup/download/${backup.id}` : null
        }));

        return NextResponse.json({
            backups: formattedBackups,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                status,
                type
            }
        });
    } catch (error) {
        console.error('Error fetching backup history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch backup history' },
            { status: 500 }
        );
    }
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}