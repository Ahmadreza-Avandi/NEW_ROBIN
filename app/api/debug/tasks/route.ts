import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(req: NextRequest) {
    try {
        // Check if tasks table exists
        const tables = await executeQuery("SHOW TABLES LIKE 'tasks'");
        console.log('Tasks table check result:', tables);

        if (tables.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Tasks table does not exist',
                data: { tableExists: false }
            });
        }

        // Get table structure
        const structure = await executeQuery("DESCRIBE tasks");
        console.log('Tasks table structure:', structure);

        // Count records
        const countResult = await executeQuery("SELECT COUNT(*) as count FROM tasks");
        const count = countResult[0]?.count || 0;
        console.log('Tasks count:', count);

        // Get sample records
        const records = await executeQuery("SELECT * FROM tasks LIMIT 3");
        console.log('Sample tasks:', records);

        return NextResponse.json({
            success: true,
            data: {
                tableExists: true,
                structure,
                count,
                sampleRecords: records
            }
        });

    } catch (error) {
        console.error('Debug tasks error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            error: error
        }, { status: 500 });
    }
}