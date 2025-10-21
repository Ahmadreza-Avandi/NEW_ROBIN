import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check database connection
        const mysql = require('mysql2/promise');

        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'mysql',
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || '1234',
            database: process.env.DATABASE_NAME || 'crm_system',
        });

        await connection.execute('SELECT 1');
        await connection.end();

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: process.env.NODE_ENV || 'development'
        }, { status: 500 });
    }
}