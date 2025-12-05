import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { toPersianDate } from '@/lib/utils/date';

// Import notification services
import notificationService from '@/lib/notification-service.js';
import internalNotificationSystem from '@/lib/notification-system.js';

// GET /api/reports - Get daily reports
export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const start_date = searchParams.get('start_date') || '';
        const end_date = searchParams.get('end_date') || '';
        const user_id = searchParams.get('user_id') || '';

        // Managers can view all reports
        const managerRoles = [
            'ceo', 'مدیر', 'مدیر عامل', 'مدیرعامل',
            'sales_manager', 'مدیر فروش', 
            'admin', 'ادمین',
            'manager', 'مدیر کل',
            'supervisor', 'سرپرست',
            'team_lead', 'سرگروه'
        ];
        
        const isManager = managerRoles.some(role => 
            currentUser.role?.toLowerCase().includes(role.toLowerCase())
        );

        console.log('📊 Reports API - User role:', currentUser.role);
        console.log('✅ Reports API - Is Manager:', isManager);

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        // If not manager, only show own reports
        if (!isManager) {
            whereClause += ' AND dr.user_id = ?';
            params.push(currentUser.id);
        } else if (user_id) {
            // Manager can filter by specific user
            whereClause += ' AND dr.user_id = ?';
            params.push(user_id);
        }

        // Date range filter
        if (start_date) {
            whereClause += ' AND dr.report_date >= ?';
            params.push(start_date);
        }
        
        if (end_date) {
            whereClause += ' AND dr.report_date <= ?';
            params.push(end_date);
        }

        console.log('📅 Date range filter:', { start_date, end_date });

        const reports = await executeQuery(`
      SELECT 
        dr.*,
        u.name as user_name,
        u.role as user_role
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      ${whereClause}
      ORDER BY dr.report_date DESC, dr.created_at DESC
      LIMIT 100
    `, params);

        // Get tasks for each report if completed_tasks exists
        for (let report of reports) {
            if (report.completed_tasks) {
                try {
                    const taskIds = JSON.parse(report.completed_tasks);
                    if (taskIds && taskIds.length > 0) {
                        const tasks = await executeQuery(`
              SELECT id, title, status
              FROM tasks
              WHERE id IN (${taskIds.map(() => '?').join(',')})
            `, taskIds);
                        report.tasks = tasks;
                    }
                } catch (e) {
                    report.tasks = [];
                }
            } else {
                report.tasks = [];
            }
        }

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error('Get reports API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت گزارش‌ها' },
            { status: 500 }
        );
    }
}

// POST /api/reports - Create or update daily report
export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        // Check if user is CEO (CEOs don't need to submit daily reports)
        if (currentUser.role === 'ceo' || currentUser.role === 'مدیر') {
            return NextResponse.json(
                { success: false, message: 'مدیران عامل نیازی به ثبت گزارش روزانه ندارند' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            work_description,
            completed_tasks,
            working_hours,
            challenges,
            achievements,
            report_date
        } = body;

        if (!work_description || !work_description.trim()) {
            return NextResponse.json(
                { success: false, message: 'توضیحات کار انجام شده الزامی است' },
                { status: 400 }
            );
        }

        // Use today's date if not provided, ensure proper date format
        let targetDate = report_date;
        if (!targetDate) {
            targetDate = new Date().toISOString().split('T')[0];
        } else {
            // Validate and normalize the date format
            const dateObj = new Date(targetDate);
            if (isNaN(dateObj.getTime())) {
                return NextResponse.json(
                    { success: false, message: 'فرمت تاریخ نامعتبر است' },
                    { status: 400 }
                );
            }
            targetDate = dateObj.toISOString().split('T')[0];
        }

        const persianDate = toPersianDate(new Date(targetDate));

        // Check if report already exists for this date
        const existingReport = await executeQuery(`
      SELECT id FROM daily_reports 
      WHERE user_id = ? AND report_date = ?
    `, [currentUser.id, targetDate]);

        let reportId;

        if (existingReport.length > 0) {
            // Update existing report
            reportId = existingReport[0].id;

            // Check if it's the same day (allow editing only on the same day)
            const today = new Date().toISOString().split('T')[0];
            if (targetDate !== today) {
                return NextResponse.json(
                    { success: false, message: 'فقط می‌توانید گزارش امروز را ویرایش کنید' },
                    { status: 403 }
                );
            }

            await executeSingle(`
        UPDATE daily_reports 
        SET 
          work_description = ?,
          completed_tasks = ?,
          working_hours = ?,
          challenges = ?,
          achievements = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [
                work_description,
                completed_tasks ? JSON.stringify(completed_tasks) : null,
                working_hours || null,
                challenges || null,
                achievements || null,
                reportId
            ]);

            return NextResponse.json({
                success: true,
                message: 'گزارش روزانه با موفقیت به‌روزرسانی شد',
                data: { id: reportId }
            });
        } else {
            // Create new report
            reportId = uuidv4();

            await executeSingle(`
        INSERT INTO daily_reports (
          id, user_id, report_date, persian_date, work_description,
          completed_tasks, working_hours, challenges, achievements, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
                reportId,
                currentUser.id,
                targetDate,
                persianDate,
                work_description,
                completed_tasks ? JSON.stringify(completed_tasks) : null,
                working_hours || null,
                challenges || null,
                achievements || null
            ]);

            // Send notification to managers when a report is submitted
            try {
                // Get managers who should receive report notifications
                const managers = await executeQuery(`
                    SELECT id, name, email, role
                    FROM users
                    WHERE role IN ('ceo', 'manager', 'sales_manager')
                    AND status = 'active'
                `);

                if (managers.length > 0) {
                    const reportData = {
                        id: reportId,
                        title: `گزارش روزانه ${persianDate}`,
                        submitted_by_name: currentUser.name,
                        date: persianDate,
                        work_description: work_description.substring(0, 100) + (work_description.length > 100 ? '...' : '')
                    };

                    // Send notifications to each manager
                    for (const manager of managers) {
                        // Send internal notification
                        internalNotificationSystem.notifyReportSubmitted(reportData, manager.id)
                            .then((notifResult: any) => {
                                if (notifResult.success) {
                                    console.log(`✅ Report notification sent to manager: ${manager.name}`);
                                } else {
                                    console.log(`⚠️ Report notification failed for manager ${manager.name}:`, notifResult.error);
                                }
                            })
                            .catch((error: any) => {
                                console.error(`❌ Report notification error for manager ${manager.name}:`, error);
                            });
                    }
                }
            } catch (error) {
                console.error('❌ Error sending report notifications:', error);
                // Don't fail the report creation if notification fails
            }

            return NextResponse.json({
                success: true,
                message: 'گزارش روزانه با موفقیت ثبت شد',
                data: { id: reportId }
            });
        }
    } catch (error) {
        console.error('Create/Update report API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ثبت گزارش' },
            { status: 500 }
        );
    }
}

// GET /api/reports/today - Get today's report for current user
export async function PUT(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
                { status: 401 }
            );
        }

        const today = new Date().toISOString().split('T')[0];

        const todayReport = await executeQuery(`
      SELECT * FROM daily_reports 
      WHERE user_id = ? AND report_date = ?
    `, [currentUser.id, today]);

        return NextResponse.json({
            success: true,
            data: todayReport.length > 0 ? todayReport[0] : null
        });
    } catch (error) {
        console.error('Get today report API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت گزارش امروز' },
            { status: 500 }
        );
    }
}