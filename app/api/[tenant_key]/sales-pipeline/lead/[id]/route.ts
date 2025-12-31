import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { getTenantConnection } from '@/lib/tenant-database';
import { leadTemperatureService } from '@/lib/lead-temperature-service';
import { salesPipelineIntegration } from '@/lib/sales-pipeline-integration';

/**
 * PUT /api/[tenant_key]/sales-pipeline/lead/[id]
 * Update lead information with module integration
 * Requirements: 8.1, 8.5
 */
async function handleUpdateLead(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.indexOf('lead') + 1];
    const body = await request.json();

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

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      // Allowed fields for update
      const allowedFields = [
        'name', 'email', 'phone', 'company_name', 'deal_value', 
        'success_probability', 'sales_owner', 'next_action_date'
      ];

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateParams.push(body[field]);
        }
      });

      if (updateFields.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' },
          { status: 400 }
        );
      }

      // Always update the updated_at field
      updateFields.push('updated_at = NOW()');

      // Recalculate temperature if relevant fields changed
      if (body.success_probability !== undefined || body.next_action_date !== undefined) {
        const updatedLead = { ...currentLead, ...body };
        const newTemperature = leadTemperatureService.calculateLeadTemperature(updatedLead);
        updateFields.push('lead_temperature = ?');
        updateParams.push(newTemperature);
      }

      // Execute update
      await connection.query(
        `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ? AND tenant_key = ?`,
        [...updateParams, leadId, tenantKey]
      );

      // Log the update as an activity (Requirement 8.2)
      const userId = session.userId || session.id || 'unknown';
      const changedFields = allowedFields.filter(field => body[field] !== undefined);
      
      if (changedFields.length > 0) {
        await salesPipelineIntegration.activities.logLeadInteraction(
          leadId,
          tenantKey,
          'note',
          'به‌روزرسانی اطلاعات سرنخ',
          `فیلدهای به‌روزرسانی شده: ${changedFields.join(', ')}`,
          userId
        );
      }

      // Commit transaction
      await connection.commit();

      // Validate data consistency after update (Requirement 8.5)
      const consistency = await salesPipelineIntegration.consistency.validateLeadConsistency(leadId, tenantKey);
      if (!consistency.isConsistent) {
        console.warn('Data consistency issues detected after lead update:', consistency.issues);
        // Attempt to sync data
        await salesPipelineIntegration.consistency.syncLeadData(leadId, tenantKey);
      }

      return NextResponse.json({
        success: true,
        message: 'اطلاعات سرنخ با موفقیت به‌روزرسانی شد',
        data: {
          updated_fields: changedFields,
          consistency_check: consistency.isConsistent
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی اطلاعات سرنخ:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در به‌روزرسانی اطلاعات' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/[tenant_key]/sales-pipeline/lead/[id]
 * Get lead information with integrated module data
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
async function handleGetLead(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.indexOf('lead') + 1];

    // Connect to tenant database
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // Get lead information (Requirement 8.1)
      const [leads] = await connection.query(`
        SELECT c.*, 
               u.name as sales_owner_name,
               u.email as sales_owner_email
        FROM customers c 
        LEFT JOIN users u ON c.sales_owner = u.id AND c.tenant_key = u.tenant_key
        WHERE c.id = ? AND c.tenant_key = ? AND c.type = 'lead'
      `, [leadId, tenantKey]) as any[];

      if (leads.length === 0) {
        return NextResponse.json(
          { success: false, message: 'سرنخ یافت نشد' },
          { status: 404 }
        );
      }

      const lead = leads[0];

      // Update and get current temperature
      const currentTemperature = leadTemperatureService.calculateLeadTemperature(lead);
      if (lead.lead_temperature !== currentTemperature) {
        lead.lead_temperature = currentTemperature;
        await connection.query(
          'UPDATE customers SET lead_temperature = ? WHERE id = ? AND tenant_key = ?',
          [currentTemperature, leadId, tenantKey]
        );
      }

      // Get integrated module data
      const [activities, tasks, documents] = await Promise.all([
        // Activities (Requirement 8.2)
        connection.query(`
          SELECT a.*, u.name as performed_by_name
          FROM activities a
          LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key = u.tenant_key
          WHERE a.customer_id = ? AND a.tenant_key = ?
          ORDER BY a.created_at DESC
          LIMIT 10
        `, [leadId, tenantKey]),

        // Tasks (Requirement 8.3)
        connection.query(`
          SELECT t.*, 
                 assigned_user.name as assigned_to_name,
                 creator.name as created_by_name
          FROM tasks t
          LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id AND t.tenant_key = assigned_user.tenant_key
          LEFT JOIN users creator ON t.created_by = creator.id AND t.tenant_key = creator.tenant_key
          WHERE t.customer_id = ? AND t.tenant_key = ?
          ORDER BY t.created_at DESC
          LIMIT 10
        `, [leadId, tenantKey]),

        // Documents (Requirement 8.4)
        connection.query(`
          SELECT d.*, 
                 u.name as uploaded_by_name,
                 dc.name as category_name
          FROM documents d
          LEFT JOIN users u ON d.uploaded_by = u.id AND d.tenant_key = u.tenant_key
          LEFT JOIN document_categories dc ON d.category_id = dc.id AND d.tenant_key = dc.tenant_key
          WHERE d.customer_id = ? AND d.tenant_key = ?
          ORDER BY d.created_at DESC
          LIMIT 10
        `, [leadId, tenantKey])
      ]);

      return NextResponse.json({
        success: true,
        data: {
          lead: {
            ...lead,
            activities: activities[0],
            tasks: tasks[0],
            documents: documents[0]
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت اطلاعات سرنخ:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در دریافت اطلاعات سرنخ' },
      { status: 500 }
    );
  }
}

export const PUT = requireTenantPermission('sales_pipeline')(handleUpdateLead);
export const GET = requireTenantPermission('sales_pipeline')(handleGetLead);