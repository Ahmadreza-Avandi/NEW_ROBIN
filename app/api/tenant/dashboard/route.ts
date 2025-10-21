import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    console.log('📊 درخواست داشبورد برای tenant:', tenantKey);

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      console.log('❌ Session یافت نشد');
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    console.log('✅ Session معتبر:', { userId: session.userId, role: session.role });

    // اتصال به دیتابیس tenant
    const pool = await getTenantConnection(tenantKey);
    const connection = await pool.getConnection();

    try {
      // دریافت آمار کلی
      const [customersCount] = await connection.query(
        'SELECT COUNT(*) as count FROM customers WHERE status = ?',
        ['active']
      ) as any[];

      const [tasksCount] = await connection.query(
        'SELECT COUNT(*) as count FROM tasks WHERE status IN (?, ?)',
        ['pending', 'in_progress']
      ) as any[];

      const [dealsCount] = await connection.query(
        'SELECT COUNT(*) as count FROM deals WHERE actual_close_date IS NULL',
        []
      ) as any[];

      const [ticketsCount] = await connection.query(
        'SELECT COUNT(*) as count FROM tickets WHERE status = ?',
        ['open']
      ) as any[];

      // دریافت فعالیت‌های امروز
      const [todayActivities] = await connection.query(`
        SELECT 
          a.*,
          c.name as customer_name,
          u.name as performed_by_name
        FROM activities a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN users u ON a.performed_by = u.id
        WHERE DATE(a.start_time) = CURDATE()
        ORDER BY a.start_time DESC
        LIMIT 10
      `) as any[];

      // دریافت مشتریان اخیر
      const [recentCustomers] = await connection.query(`
        SELECT id, name, email, phone, status, created_at
        FROM customers
        ORDER BY created_at DESC
        LIMIT 5
      `) as any[];

      // دریافت برنامه امروز
      const [todaySchedule] = await connection.query(`
        SELECT 
          e.*,
          c.name as customer_name
        FROM calendar_events e
        LEFT JOIN customers c ON e.customer_id = c.id
        WHERE DATE(e.start_date) = CURDATE()
        ORDER BY e.start_date ASC
        LIMIT 10
      `) as any[];

      // دریافت گزارش کاربران (فقط برای مدیران)
      let userActivityReport = [];
      if (session.role === 'ceo' || session.role === 'sales_manager') {
        const [users] = await connection.query(`
          SELECT 
            u.id,
            u.name,
            u.role,
            COUNT(DISTINCT a.id) as activities_today,
            COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
            COUNT(DISTINCT t.id) as tasks_assigned
          FROM users u
          LEFT JOIN activities a ON a.performed_by = u.id AND DATE(a.start_time) = CURDATE()
          LEFT JOIN tasks t ON t.assigned_to = u.id
          WHERE u.status = 'active'
          GROUP BY u.id, u.name, u.role
          ORDER BY activities_today DESC
        `) as any[];

        userActivityReport = users;
      }

      console.log('✅ داده‌های داشبورد دریافت شد');

      return NextResponse.json({
        success: true,
        data: {
          currentUser: {
            id: session.userId,
            name: session.name,
            role: session.role,
            isAdmin: session.role === 'ceo' || session.role === 'sales_manager'
          },
          quickStats: {
            active_customers: customersCount[0]?.count || 0,
            pending_tasks: tasksCount[0]?.count || 0,
            active_deals: dealsCount[0]?.count || 0,
            open_tickets: ticketsCount[0]?.count || 0
          },
          teamActivities: todayActivities,
          recentCustomers: recentCustomers,
          todaySchedule: todaySchedule,
          userActivityReport: userActivityReport,
          alerts: []
        }
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت داده‌های داشبورد:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
