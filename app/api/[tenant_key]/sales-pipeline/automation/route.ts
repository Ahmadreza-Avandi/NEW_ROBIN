import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { leadAutomationService, AutomationUtils } from '@/lib/lead-automation-service';

/**
 * GET /api/[tenant_key]/sales-pipeline/automation
 * Get automation status and alerts
 */
async function handleGetAutomation(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'alerts':
        // Get follow-up alerts
        const alerts = await leadAutomationService.generateFollowUpAlerts(tenantKey);
        return NextResponse.json({
          success: true,
          data: { alerts }
        });

      case 'overdue':
        // Get overdue leads
        const daysThreshold = parseInt(searchParams.get('days') || '3');
        const overdueLeads = await AutomationUtils.getOverdueLeads(tenantKey, daysThreshold);
        return NextResponse.json({
          success: true,
          data: { overdue_leads: overdueLeads }
        });

      case 'temperature':
        // Get leads by temperature
        const temperature = searchParams.get('temp') as 'hot' | 'warm' | 'cold';
        if (!temperature || !['hot', 'warm', 'cold'].includes(temperature)) {
          return NextResponse.json(
            { success: false, message: 'دمای معتبر (hot, warm, cold) الزامی است' },
            { status: 400 }
          );
        }
        const temperatureLeads = await AutomationUtils.getLeadsByTemperature(tenantKey, temperature);
        return NextResponse.json({
          success: true,
          data: { leads: temperatureLeads }
        });

      default:
        // Process all automation rules
        await leadAutomationService.processAutomationRules(tenantKey);
        return NextResponse.json({
          success: true,
          message: 'قوانین اتوماسیون پردازش شدند'
        });
    }

  } catch (error) {
    console.error('❌ خطا در پردازش اتوماسیون:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در پردازش اتوماسیون' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[tenant_key]/sales-pipeline/automation
 * Trigger automation actions
 */
async function handleTriggerAutomation(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const body = await request.json();
    const { action, lead_id, stage, sale_amount } = body;

    const userId = session.userId || session.id;
    const userName = session.user?.name || session.name || 'کاربر';

    switch (action) {
      case 'create_task':
        if (!lead_id || !stage) {
          return NextResponse.json(
            { success: false, message: 'شناسه سرنخ و مرحله الزامی است' },
            { status: 400 }
          );
        }
        await leadAutomationService.createStageChangeTask(tenantKey, lead_id, stage, userId);
        return NextResponse.json({
          success: true,
          message: 'وظیفه پیگیری ایجاد شد'
        });

      case 'convert_lead':
        if (!lead_id) {
          return NextResponse.json(
            { success: false, message: 'شناسه سرنخ الزامی است' },
            { status: 400 }
          );
        }
        await leadAutomationService.convertLeadToCustomer(tenantKey, lead_id, userId, sale_amount);
        return NextResponse.json({
          success: true,
          message: 'سرنخ به مشتری تبدیل شد'
        });

      case 'log_activity':
        const { lead_name, from_stage, to_stage, reason } = body;
        if (!lead_id || !lead_name || !to_stage) {
          return NextResponse.json(
            { success: false, message: 'اطلاعات کامل سرنخ الزامی است' },
            { status: 400 }
          );
        }
        await leadAutomationService.logStageChangeActivity(
          tenantKey, lead_id, lead_name, from_stage, to_stage, userId, userName, reason
        );
        return NextResponse.json({
          success: true,
          message: 'فعالیت ثبت شد'
        });

      default:
        return NextResponse.json(
          { success: false, message: 'عمل نامعتبر' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ خطا در اجرای اتوماسیون:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در اجرای اتوماسیون' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantPermission('sales_pipeline')(handleGetAutomation);
export const POST = requireTenantPermission('sales_pipeline')(handleTriggerAutomation);