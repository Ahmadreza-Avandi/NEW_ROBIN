import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        // Get comprehensive system statistics
        const stats = await getSystemStatistics();

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching system statistics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system statistics' },
            { status: 500 }
        );
    }
}

async function getSystemStatistics() {
    try {
        // Get user statistics
        const userStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users
      FROM users
    `);

        // Get customer statistics
        const customerStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_customers_30d,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_customers_7d
      FROM customers
    `);

        // Get interaction statistics
        const interactionStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_interactions,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as interactions_30d,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as interactions_7d
      FROM interactions
    `);

        // Get sales statistics
        const salesStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(amount) as total_revenue,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as sales_30d,
        SUM(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as revenue_30d
      FROM sales
    `);

        // Get task statistics
        const taskStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks
      FROM tasks
    `);

        // Get feedback statistics
        const feedbackStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as feedback_30d
      FROM feedback
      WHERE rating IS NOT NULL
    `);

        // Get system activity (recent logs)
        const activityStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as logs_24h,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_operations,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_operations
      FROM system_logs
    `);

        // Get database size and table information
        const databaseInfo = await executeQuery(`
      SELECT 
        COUNT(*) as table_count,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb,
        SUM(TABLE_ROWS) as total_rows
      FROM information_schema.tables 
      WHERE table_schema = 'crm_system'
    `);

        // Get backup statistics
        const backupStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_backups,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_backups,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_backups,
        MAX(created_at) as last_backup_date,
        SUM(file_size) as total_backup_size
      FROM backup_history
    `);

        // Format the response
        const response = {
            users: {
                total: userStats[0]?.total_users || 0,
                admin: userStats[0]?.admin_users || 0,
                manager: userStats[0]?.manager_users || 0,
                regular: userStats[0]?.regular_users || 0
            },
            customers: {
                total: customerStats[0]?.total_customers || 0,
                new30Days: customerStats[0]?.new_customers_30d || 0,
                new7Days: customerStats[0]?.new_customers_7d || 0
            },
            interactions: {
                total: interactionStats[0]?.total_interactions || 0,
                last30Days: interactionStats[0]?.interactions_30d || 0,
                last7Days: interactionStats[0]?.interactions_7d || 0
            },
            sales: {
                total: salesStats[0]?.total_sales || 0,
                totalRevenue: salesStats[0]?.total_revenue || 0,
                sales30Days: salesStats[0]?.sales_30d || 0,
                revenue30Days: salesStats[0]?.revenue_30d || 0
            },
            tasks: {
                total: taskStats[0]?.total_tasks || 0,
                completed: taskStats[0]?.completed_tasks || 0,
                pending: taskStats[0]?.pending_tasks || 0,
                inProgress: taskStats[0]?.in_progress_tasks || 0
            },
            feedback: {
                total: feedbackStats[0]?.total_feedback || 0,
                averageRating: parseFloat((feedbackStats[0]?.average_rating || 0).toFixed(2)),
                recent30Days: feedbackStats[0]?.feedback_30d || 0
            },
            system: {
                totalLogs: activityStats[0]?.total_logs || 0,
                logs24Hours: activityStats[0]?.logs_24h || 0,
                successfulOperations: activityStats[0]?.successful_operations || 0,
                failedOperations: activityStats[0]?.failed_operations || 0
            },
            database: {
                tableCount: databaseInfo[0]?.table_count || 0,
                sizeMB: databaseInfo[0]?.size_mb || 0,
                totalRows: databaseInfo[0]?.total_rows || 0,
                sizeFormatted: formatSize(databaseInfo[0]?.size_mb || 0)
            },
            backups: {
                total: backupStats[0]?.total_backups || 0,
                successful: backupStats[0]?.successful_backups || 0,
                failed: backupStats[0]?.failed_backups || 0,
                lastBackupDate: backupStats[0]?.last_backup_date || null,
                totalBackupSize: backupStats[0]?.total_backup_size || 0
            },
            lastUpdated: new Date().toISOString()
        };

        return response;
    } catch (error) {
        throw error;
    }
}

function formatSize(sizeMB: number): string {
    if (sizeMB > 1024) {
        return `${(sizeMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
}