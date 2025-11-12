import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Initialize backup scheduler from database configuration
        const { backupScheduler } = await import('@/lib/backup-scheduler');

        await backupScheduler.initializeFromDatabase();

        return NextResponse.json({
            success: true,
            message: 'Backup scheduler initialized successfully'
        });
    } catch (error) {
        console.error('Error initializing backup scheduler:', error);
        return NextResponse.json(
            { error: 'Failed to initialize backup scheduler' },
            { status: 500 }
        );
    }
}