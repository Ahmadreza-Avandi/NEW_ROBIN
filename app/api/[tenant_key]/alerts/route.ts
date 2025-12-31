import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { alertService } from '@/lib/alert-service';

/**
 * GET /api/[tenant_key]/alerts
 * Get alerts for the tenant
 */
async function handleGetAlerts(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const priority = searchParams.get('priority') as 'high' | 'medium' | 'low' | undefined;
    const action = searchParams.get('action');

    switch (action) {
      case 'count':
        // Get unread count
        const unreadCount = await alertService.getUnreadCount(tenantKey);
        return NextResponse.json({
          success: true,
          data: { unread_count: unreadCount }
        });

      case 'dashboard':
        // Get alerts for dashboard
        const dashboardAlerts = await alertService.getDashboardAlerts(tenantKey);
        return NextResponse.json({
          success: true,
          data: dashboardAlerts
        });

      case 'high_priority':
        // Get high priority alerts
        const highPriorityAlerts = await alertService.getHighPriorityAlerts(tenantKey);
        return NextResponse.json({
          success: true,
          data: highPriorityAlerts
        });

      default:
        // Get all alerts with filters
        const alerts = await alertService.getAlerts(tenantKey, {
          limit,
          offset,
          unreadOnly,
          priority
        });

        return NextResponse.json({
          success: true,
          data: alerts
        });
    }

  } catch (error) {
    console.error('❌ خطا در دریافت هشدارها:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در دریافت هشدارها' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[tenant_key]/alerts
 * Create a new alert
 */
async function handleCreateAlert(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const body = await request.json();

    const {
      type = 'info',
      title,
      message,
      lead_id,
      lead_name,
      priority = 'medium',
      days_overdue
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'عنوان و پیام هشدار الزامی است' },
        { status: 400 }
      );
    }

    const alertId = await alertService.createAlert(tenantKey, {
      type,
      title,
      message,
      lead_id,
      lead_name,
      priority,
      days_overdue,
      created_by: session.userId
    });

    return NextResponse.json({
      success: true,
      data: { alert_id: alertId },
      message: 'هشدار با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('❌ خطا در ایجاد هشدار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در ایجاد هشدار' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/[tenant_key]/alerts
 * Update alert status (mark as read, dismiss, etc.)
 */
async function handleUpdateAlerts(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const body = await request.json();
    const { action, alert_id, alert_ids } = body;

    switch (action) {
      case 'mark_read':
        if (alert_id) {
          await alertService.markAsRead(tenantKey, alert_id);
        } else {
          return NextResponse.json(
            { success: false, message: 'شناسه هشدار الزامی است' },
            { status: 400 }
          );
        }
        break;

      case 'mark_all_read':
        await alertService.markAllAsRead(tenantKey);
        break;

      case 'dismiss':
        if (alert_id) {
          await alertService.dismissAlert(tenantKey, alert_id);
        } else {
          return NextResponse.json(
            { success: false, message: 'شناسه هشدار الزامی است' },
            { status: 400 }
          );
        }
        break;

      case 'cleanup':
        const daysOld = body.days_old || 30;
        const deletedCount = await alertService.cleanupOldAlerts(tenantKey, daysOld);
        return NextResponse.json({
          success: true,
          data: { deleted_count: deletedCount },
          message: `${deletedCount} هشدار قدیمی پاک شد`
        });

      default:
        return NextResponse.json(
          { success: false, message: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'عملیات با موفقیت انجام شد'
    });

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی هشدار:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در به‌روزرسانی هشدار' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantPermission('sales_pipeline')(handleGetAlerts);
export const POST = requireTenantPermission('sales_pipeline')(handleCreateAlert);
export const PUT = requireTenantPermission('sales_pipeline')(handleUpdateAlerts);