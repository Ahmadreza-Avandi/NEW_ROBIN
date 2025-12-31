import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { getTenantConnection } from '@/lib/tenant-database';
import { PipelineStageType } from '@/lib/sales-pipeline-types';
import { leadTemperatureService } from '@/lib/lead-temperature-service';
import { leadAutomationService } from '@/lib/lead-automation-service';
import { salesPipelineIntegration } from '@/lib/sales-pipeline-integration';

/**
 * PUT /api/[tenant_key]/sales-pipeline/lead/[id]/stage
 * Update lead stage and handle automation
 * Requirements: 6.3, 9.2, 9.3, 9.4, 9.5
 */
async function handleUpdateLeadStage(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.indexOf('lead') + 1];
    const body = await request.json();

    const { new_stage, reason } = body;

    if (!new_stage) {
      return NextResponse.json(
        { success: false, message: 'مرحله جدید الزامی است' },
        { status: 400 }
      );
    }

    // Validate stage
    const validStages: PipelineStageType[] = [
      'new_lead', 'contacted', 'needs_analysis', 
      'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'
    ];

    if (!validStages.includes(new_stage)) {
      return NextResponse.json(
        { success: false, message: 'مرحله انتخابی معتبر نیست' },
        { status: 400 }
      );
    }

    // Requirement 9.4: Loss reason required for closed_lost
    if (new_stage === 'closed_lost' && !reason) {
      return NextResponse.json(
        { success: false, message: 'دلیل عدم موفقیت برای مرحله "از دست رفته" الزامی است' },
        { status: 400 }
      );
    }

    // Connect to tenant database
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Get current lead information
      const [currentLeads] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND tenant_key = ? AND type = "lead"',
        [leadId, tenantKey]
      ) as any[];

      if (currentLeads.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'سرنخ یافت نشد' },
          { status: 404 }
        );
      }

      const currentLead = currentLeads[0];
      const oldStage = currentLead.current_pipeline_stage;

      // Update lead stage
      const updateFields = ['current_pipeline_stage = ?', 'updated_at = NOW()'];
      const updateParams = [new_stage];

      // Add loss reason if provided
      if (reason && new_stage === 'closed_lost') {
        updateFields.push('loss_reason = ?');
        updateParams.push(reason);
      }

      // Requirement 9.3: Convert lead to customer when closed_won
      if (new_stage === 'closed_won') {
        updateFields.push('type = ?');
        updateParams.push('customer');
      }

      // Update lead temperature
      const updatedLead = { ...currentLead, current_pipeline_stage: new_stage };
      const newTemperature = leadTemperatureService.calculateLeadTemperature(updatedLead);
      updateFields.push('lead_temperature = ?');
      updateParams.push(newTemperature);

      // Execute update
      await connection.query(
        `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ? AND tenant_key = ?`,
        [...updateParams, leadId, tenantKey]
      );

      // Record stage change in history
      await connection.query(`
        INSERT INTO lead_pipeline_history (
          tenant_key, customer_id, from_stage, to_stage, 
          changed_by, change_reason, changed_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [tenantKey, leadId, oldStage, new_stage, session.userId, reason || null]);

      // Requirement 9.5: Log stage change as activity
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await leadAutomationService.logStageChangeActivity(
        tenantKey, leadId, currentLead.name, oldStage, new_stage, userId, userName, reason
      );

      // Requirement 9.2: Create follow-up task for stage change
      if (new_stage !== 'closed_won' && new_stage !== 'closed_lost') {
        await leadAutomationService.createStageChangeTask(tenantKey, leadId, new_stage, userId);
      }

      // Requirement 9.3: Convert lead to customer when closed_won
      if (new_stage === 'closed_won') {
        await leadAutomationService.convertLeadToCustomer(tenantKey, leadId, userId);
      }

      // Commit transaction
      await connection.commit();

      // Handle module integrations (Requirements 8.1-8.5)
      await salesPipelineIntegration.handleStageChange(
        leadId, tenantKey, oldStage, new_stage, userId, reason
      );

      return NextResponse.json({
        success: true,
        message: 'مرحله سرنخ با موفقیت به‌روزرسانی شد',
        data: {
          old_stage: oldStage,
          new_stage: new_stage,
          lead_temperature: newTemperature,
          converted_to_customer: new_stage === 'closed_won'
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی مرحله سرنخ:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در به‌روزرسانی مرحله' },
      { status: 500 }
    );
  }
}

export const PUT = requireTenantPermission('sales_pipeline')(handleUpdateLeadStage);