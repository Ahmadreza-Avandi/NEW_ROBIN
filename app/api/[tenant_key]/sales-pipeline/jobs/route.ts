import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { salesPipelineJobService, JobUtils } from '@/lib/sales-pipeline-jobs';

/**
 * GET /api/[tenant_key]/sales-pipeline/jobs
 * Get job status and run manual jobs
 */
async function handleGetJobs(request: NextRequest, session: any) {
  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        // Get job status
        const status = salesPipelineJobService.getStatus();
        return NextResponse.json({
          success: true,
          data: status
        });

      case 'run':
        // Manually run jobs for this tenant
        await JobUtils.runForTenant(tenantKey);
        return NextResponse.json({
          success: true,
          message: 'وظایف پس‌زمینه برای این tenant اجرا شدند'
        });

      case 'alerts':
        // Generate alerts for this tenant
        await JobUtils.generateAlertsForTenant(tenantKey);
        return NextResponse.json({
          success: true,
          message: 'هشدارهای پیگیری تولید شدند'
        });

      case 'temperatures':
        // Update temperatures for this tenant
        await JobUtils.updateTemperaturesForTenant(tenantKey);
        return NextResponse.json({
          success: true,
          message: 'دمای سرنخ‌ها به‌روزرسانی شدند'
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            available_actions: ['status', 'run', 'alerts', 'temperatures'],
            description: 'استفاده از پارامتر action برای انتخاب عمل'
          }
        });
    }

  } catch (error) {
    console.error('❌ خطا در مدیریت وظایف:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در مدیریت وظایف' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[tenant_key]/sales-pipeline/jobs
 * Control background jobs
 */
async function handleControlJobs(request: NextRequest, session: any) {
  try {
    const body = await request.json();
    const { action, interval_minutes } = body;

    switch (action) {
      case 'start':
        const interval = interval_minutes || 60;
        salesPipelineJobService.start(interval);
        return NextResponse.json({
          success: true,
          message: `وظایف پس‌زمینه شروع شدند (هر ${interval} دقیقه)`
        });

      case 'stop':
        salesPipelineJobService.stop();
        return NextResponse.json({
          success: true,
          message: 'وظایف پس‌زمینه متوقف شدند'
        });

      default:
        return NextResponse.json(
          { success: false, message: 'عمل نامعتبر. از start یا stop استفاده کنید' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ خطا در کنترل وظایف:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در کنترل وظایف' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantPermission('sales_pipeline')(handleGetJobs);
export const POST = requireTenantPermission('sales_pipeline')(handleControlJobs);