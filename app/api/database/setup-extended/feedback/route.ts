import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        console.log('🚀 Setting up feedback system database schema...');

        // Read the SQL file
        const sqlFilePath = path.join(process.cwd(), 'app/api/database/setup-extended/feedback-system.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Split the SQL content into individual statements
        const statements = sqlContent
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0 && !statement.startsWith('--'));

        const results = [];

        // Execute each statement
        for (const statement of statements) {
            try {
                if (statement.toLowerCase().startsWith('insert') ||
                    statement.toLowerCase().startsWith('update') ||
                    statement.toLowerCase().startsWith('set')) {
                    const result = await executeSingle(statement);
                    results.push({ type: 'insert/update', success: true, affected: result.affectedRows });
                } else if (statement.toLowerCase().startsWith('create')) {
                    await executeSingle(statement);
                    results.push({ type: 'create', success: true });
                } else {
                    await executeSingle(statement);
                    results.push({ type: 'other', success: true });
                }
            } catch (error) {
                console.error('Error executing statement:', statement.substring(0, 100), error);
                results.push({
                    type: 'error',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    statement: statement.substring(0, 100) + '...'
                });
            }
        }

        // Verify the setup by checking tables
        const tables = await executeQuery(`
            SELECT TABLE_NAME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME IN ('feedback_forms', 'feedback_form_questions', 'feedback_form_submissions', 'feedback_form_responses')
        `);

        // Check sample data
        const formsCount = await executeQuery('SELECT COUNT(*) as count FROM feedback_forms');
        const questionsCount = await executeQuery('SELECT COUNT(*) as count FROM feedback_form_questions');
        const submissionsCount = await executeQuery('SELECT COUNT(*) as count FROM feedback_form_submissions');
        const responsesCount = await executeQuery('SELECT COUNT(*) as count FROM feedback_form_responses');

        console.log('✅ Feedback system database setup completed!');

        return NextResponse.json({
            success: true,
            message: 'Feedback system database schema setup completed successfully',
            data: {
                tablesCreated: tables.map(t => t.TABLE_NAME),
                sampleData: {
                    forms: formsCount[0].count,
                    questions: questionsCount[0].count,
                    submissions: submissionsCount[0].count,
                    responses: responsesCount[0].count
                },
                executionResults: results
            }
        });

    } catch (error) {
        console.error('❌ Feedback system database setup error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Feedback system database setup failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}