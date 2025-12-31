import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { getTenantConnection } from '@/lib/tenant-database';
import { Lead, PipelineHistoryEntry } from '@/lib/sales-pipeline-types';
import { leadTemperatureService } from '@/lib/lead-temperature-service';

/**
 * GET /api/[tenant_key]/sales-pipeline/lead/[id]/details
 * Get comprehensive lead details with integrated module data
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
async function handleGetLeadDetails(request: NextRequest, session: any) {
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
      // Requirement 8.1: Get lead details with customer profile integration
      const [leads] = await connection.query(`
        SELECT c.*, 
               u.name as sales_owner_name,
               u.email as sales_owner_email,
               creator.name as created_by_name
        FROM customers c 
        LEFT JOIN users u ON c.sales_owner = u.id AND c.tenant_key = u.tenant_key
        LEFT JOIN users creator ON c.created_by = creator.id AND c.tenant_key = creator.tenant_key
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

      // Requirement 8.2: Get activities timeline from Activities_Module
      const [activities] = await connection.query(`
        SELECT a.*, u.name as performed_by_name
        FROM activities a
        LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key = u.tenant_key
        WHERE a.customer_id = ? AND a.tenant_key = ?
        ORDER BY a.created_at DESC
        LIMIT 20
      `, [leadId, tenantKey]) as any[];

      // Requirement 8.3: Get tasks from Tasks_Module
      const [tasks] = await connection.query(`
        SELECT t.*, 
               assigned_user.name as assigned_to_name,
               creator.name as created_by_name
        FROM tasks t
        LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id AND t.tenant_key = assigned_user.tenant_key
        LEFT JOIN users creator ON t.created_by = creator.id AND t.tenant_key = creator.tenant_key
        WHERE t.customer_id = ? AND t.tenant_key = ?
        ORDER BY t.created_at DESC
        LIMIT 10
      `, [leadId, tenantKey]) as any[];

      // Requirement 8.4: Get documents from Documents_Module
      const [documents] = await connection.query(`
        SELECT d.*, 
               u.name as uploaded_by_name,
               dc.name as category_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id AND d.tenant_key = u.tenant_key
        LEFT JOIN document_categories dc ON d.category_id = dc.id AND d.tenant_key = dc.tenant_key
        WHERE d.customer_id = ? AND d.tenant_key = ?
        ORDER BY d.created_at DESC
        LIMIT 10
      `, [leadId, tenantKey]) as any[];

      // Get pipeline history
      const [pipelineHistory] = await connection.query(`
        SELECT lph.*, 
               u.name as changed_by_name
        FROM lead_pipeline_history lph
        LEFT JOIN users u ON lph.changed_by = u.id AND lph.tenant_key = u.tenant_key
        WHERE lph.customer_id = ? AND lph.tenant_key = ?
        ORDER BY lph.changed_at DESC
      `, [leadId, tenantKey]) as any[];

      // Get lead statistics
      const [leadStats] = await connection.query(`
        SELECT 
          (SELECT COUNT(*) FROM activities WHERE customer_id = ? AND tenant_key = ?) as total_activities,
          (SELECT COUNT(*) FROM tasks WHERE customer_id = ? AND tenant_key = ?) as total_tasks,
          (SELECT COUNT(*) FROM tasks WHERE customer_id = ? AND tenant_key = ? AND status = 'completed') as completed_tasks,
          (SELECT COUNT(*) FROM documents WHERE customer_id = ? AND tenant_key = ?) as total_documents,
          (SELECT COUNT(*) FROM lead_pipeline_history WHERE customer_id = ? AND tenant_key = ?) as stage_changes,
          (SELECT DATEDIFF(NOW(), MIN(changed_at)) FROM lead_pipeline_history WHERE customer_id = ? AND tenant_key = ?) as days_in_pipeline
      `, [
        leadId, tenantKey, // activities
        leadId, tenantKey, // tasks
        leadId, tenantKey, // completed tasks
        leadId, tenantKey, // documents
        leadId, tenantKey, // stage changes
        leadId, tenantKey  // days in pipeline
      ]) as any[];

      // Get interested products
      const [interestedProducts] = await connection.query(`
        SELECT cpi.id, p.id as product_id, p.name as product_name, p.description, p.price, p.category,
               cpi.interest_level, cpi.notes, cpi.created_at
        FROM customer_product_interests cpi
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.customer_id = ? AND p.tenant_key = ?
        ORDER BY cpi.created_at DESC
      `, [leadId, tenantKey]) as any[];

      // Get related contacts (if company-based lead)
      const [contacts] = await connection.query(`
        SELECT id, first_name, last_name, email, phone, job_title, is_primary, created_at
        FROM contacts 
        WHERE company_id = ? AND tenant_key = ?
        ORDER BY is_primary DESC, created_at DESC
      `, [leadId, tenantKey]) as any[];

      // Requirement 8.5: Ensure data consistency across all modules
      const leadDetails: Lead = {
        ...lead,
        activities: activities,
        tasks: tasks,
        documents: documents,
        pipeline_history: pipelineHistory.map((entry: any) => ({
          id: entry.id,
          tenant_key: entry.tenant_key,
          customer_id: entry.customer_id,
          from_stage: entry.from_stage,
          to_stage: entry.to_stage,
          changed_by: entry.changed_by,
          change_reason: entry.change_reason,
          changed_at: entry.changed_at,
          changed_by_name: entry.changed_by_name
        }))
      };

      return NextResponse.json({
        success: true,
        data: {
          lead: leadDetails,
          stats: {
            ...leadStats[0],
            days_in_pipeline: leadStats[0].days_in_pipeline || 0
          },
          interested_products: interestedProducts,
          contacts: contacts,
          recent_activities: activities.slice(0, 5),
          pending_tasks: tasks.filter((task: any) => task.status === 'pending'),
          recent_documents: documents.slice(0, 3)
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت جزئیات سرنخ:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در دریافت جزئیات سرنخ' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantPermission('sales_pipeline')(handleGetLeadDetails);