import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup';

export async function GET(request: NextRequest) {
    try {
        // Test mysqldump availability
        const mysqldumpTest = await backupService.testMysqldump();

        // List existing backups
        const existingBackups = await backupService.listBackups();

        return NextResponse.json({
            mysqldump: mysqldumpTest,
            existingBackups: existingBackups.slice(0, 5), // Show only last 5 backups
            backupDirectory: '/backups',
            status: mysqldumpTest.available ? 'ready' : 'not_available'
        });
    } catch (error) {
        console.error('Error testing backup system:', error);
        return NextResponse.json(
            { error: 'Failed to test backup system' },
            { status: 500 }
        );
    }
}