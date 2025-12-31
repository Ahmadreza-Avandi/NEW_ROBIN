import { NextRequest, NextResponse } from 'next/server';
import { requireTenantPermission } from '@/lib/api-permissions';
import { getTenantConnection } from '@/lib/tenant-database';
import { Lead, PipelineStage, PipelineStats, LeadFilters, CreateLeadRequest } from '@/lib/sales-pipeline-types';
import { leadTemperatureService } from '@/lib/lead-temperature-service';
import { salesPipelineIntegration } from '@/lib/sales-pipeline-integration';
import { 
  SalesPipelineErrorHandler, 
  SalesPipelineValidator, 
  DatabaseErrorHandler,
  IntegrationErrorHandler 
} from '@/lib/sales-pipeline-error-handler';

/**
 * GET /api/[tenant_key]/sales-pipeline
 * Retrieve pipeline data including stages, leads, and statistics
 * Requirements: 2.5, 6.1, 6.2, 7.1, 7.2
 */
async function handleGetPipeline(request: NextRequest, session: any) {
  const tenantKey = session.tenantKey || session.tenant_key;
  const userId = session.userId || session.id;

  return await SalesPipelineErrorHandler.withErrorHandling(async () => {
    let connection;

    try {
      const { searchParams } = new URL(request.url);

      // Parse filters
      const filters: LeadFilters = {
        stage: searchParams.get('stage') as any || undefined,
        temperature: searchParams.get('temperature') as any || undefined,
        owner: searchParams.get('owner') || undefined,
        search: searchParams.get('search') || undefined,
        date_range: searchParams.get('date_from') && searchParams.get('date_to') ? {
          from: searchParams.get('date_from')!,
          to: searchParams.get('date_to')!
        } : undefined
      };

      // Pagination
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      // Connect to tenant database
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      try {
        // Get pipeline stages
        const [stages] = await connection.query(`
          SELECT id, name, display_name, stage_order, is_active
          FROM pipeline_stages 
          WHERE tenant_key = ? AND is_active = TRUE
          ORDER BY stage_order ASC
        `, [tenantKey]) as any[];

        // Build WHERE conditions for leads
        let whereConditions = ['c.tenant_key = ?', 'c.type = ?'];
        let queryParams = [tenantKey, 'lead'];

        if (filters.stage) {
          whereConditions.push('c.current_pipeline_stage = ?');
          queryParams.push(filters.stage);
        }

        if (filters.temperature) {
          whereConditions.push('c.lead_temperature = ?');
          queryParams.push(filters.temperature);
        }

        if (filters.owner) {
          whereConditions.push('c.sales_owner = ?');
          queryParams.push(filters.owner);
        }

        if (filters.search) {
          whereConditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.company_name LIKE ?)');
          const searchPattern = `%${filters.search}%`;
          queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (filters.date_range) {
          whereConditions.push('c.created_at BETWEEN ? AND ?');
          queryParams.push(filters.date_range.from, filters.date_range.to);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const [countResult] = await connection.query(
          `SELECT COUNT(*) as total FROM customers c WHERE ${whereClause}`,
          queryParams
        ) as any[];

        const totalLeads = countResult[0].total;

        // Get leads with user information
        const [leads] = await connection.query(`
          SELECT c.*, 
                 u.name as sales_owner_name,
                 u.email as sales_owner_email
          FROM customers c 
          LEFT JOIN users u ON c.sales_owner = u.id AND c.tenant_key = u.tenant_key
          WHERE ${whereClause}
          ORDER BY 
            CASE c.lead_temperature 
              WHEN 'hot' THEN 1 
              WHEN 'warm' THEN 2 
              WHEN 'cold' THEN 3 
              ELSE 4 
            END,
            c.updated_at DESC
          LIMIT ? OFFSET ?
        `, [...queryParams, limit, offset]) as any[];

        // Update lead temperatures
        for (const lead of leads) {
          const updatedTemperature = leadTemperatureService.calculateLeadTemperature(lead);
          if (lead.lead_temperature !== updatedTemperature) {
            lead.lead_temperature = updatedTemperature;
            // Update in database
            await connection.query(
              'UPDATE customers SET lead_temperature = ? WHERE id = ? AND tenant_key = ?',
              [updatedTemperature, lead.id, tenantKey]
            );
          }
        }

        // Calculate pipeline statistics
        const [statsResult] = await connection.query(`
          SELECT 
            COUNT(*) as total_leads,
            SUM(CASE WHEN current_pipeline_stage = 'new_lead' THEN 1 ELSE 0 END) as new_lead,
            SUM(CASE WHEN current_pipeline_stage = 'contacted' THEN 1 ELSE 0 END) as contacted,
            SUM(CASE WHEN current_pipeline_stage = 'needs_analysis' THEN 1 ELSE 0 END) as needs_analysis,
            SUM(CASE WHEN current_pipeline_stage = 'proposal_sent' THEN 1 ELSE 0 END) as proposal_sent,
            SUM(CASE WHEN current_pipeline_stage = 'negotiation' THEN 1 ELSE 0 END) as negotiation,
            SUM(CASE WHEN current_pipeline_stage = 'closed_won' THEN 1 ELSE 0 END) as closed_won,
            SUM(CASE WHEN current_pipeline_stage = 'closed_lost' THEN 1 ELSE 0 END) as closed_lost,
            SUM(CASE WHEN lead_temperature = 'hot' THEN 1 ELSE 0 END) as hot_leads_count,
            SUM(CASE WHEN lead_temperature = 'warm' THEN 1 ELSE 0 END) as warm_leads_count,
            SUM(CASE WHEN lead_temperature = 'cold' THEN 1 ELSE 0 END) as cold_leads_count,
            SUM(COALESCE(deal_value, 0)) as total_deal_value,
            AVG(COALESCE(deal_value, 0)) as average_deal_value,
            (SUM(CASE WHEN current_pipeline_stage = 'closed_won' THEN 1 ELSE 0 END) * 100.0 / 
             NULLIF(SUM(CASE WHEN current_pipeline_stage IN ('closed_won', 'closed_lost') THEN 1 ELSE 0 END), 0)) as conversion_rate
          FROM customers 
          WHERE tenant_key = ? AND type = 'lead'
        `, [tenantKey]) as any[];

        const stats: PipelineStats = {
          total_leads: statsResult[0].total_leads || 0,
          leads_by_stage: {
            new_lead: statsResult[0].new_lead || 0,
            contacted: statsResult[0].contacted || 0,
            needs_analysis: statsResult[0].needs_analysis || 0,
            proposal_sent: statsResult[0].proposal_sent || 0,
            negotiation: statsResult[0].negotiation || 0,
            closed_won: statsResult[0].closed_won || 0,
            closed_lost: statsResult[0].closed_lost || 0
          },
          total_deal_value: parseFloat(statsResult[0].total_deal_value) || 0,
          average_deal_value: parseFloat(statsResult[0].average_deal_value) || 0,
          conversion_rate: parseFloat(statsResult[0].conversion_rate) || 0,
          hot_leads_count: statsResult[0].hot_leads_count || 0,
          warm_leads_count: statsResult[0].warm_leads_count || 0,
          cold_leads_count: statsResult[0].cold_leads_count || 0
        };

        // Group leads by stage for Kanban view
        const stagesWithLeads: PipelineStage[] = stages.map((stage: any) => ({
          ...stage,
          leads: leads.filter((lead: any) => lead.current_pipeline_stage === stage.name)
        }));

        return NextResponse.json({
          success: true,
          data: {
            stages: stagesWithLeads,
            leads: leads,
            stats: stats,
            pagination: {
              page,
              limit,
              total: totalLeads,
              totalPages: Math.ceil(totalLeads / limit),
              hasNext: page < Math.ceil(totalLeads / limit),
              hasPrev: page > 1
            }
          }
        });

      } catch (error) {
        DatabaseErrorHandler.handleQueryError(error, 'GET pipeline data');
      } finally {
        if (connection) connection.release();
      }

    } catch (error) {
      if (error.code && error.code.includes('ECONNREFUSED')) {
        DatabaseErrorHandler.handleConnectionError(error);
      }
      throw error;
    }
  }, {
    tenantKey,
    userId,
    operation: 'get_pipeline_data'
  });
}

export const GET = requireTenantPermission('sales_pipeline')(handleGetPipeline);

/**
 * POST /api/[tenant_key]/sales-pipeline/lead
 * Create new lead with module integrations
 * Requirements: 1.2, 8.1, 8.2, 8.3, 8.5
 */
async function handleCreateLead(request: NextRequest, session: any) {
  const tenantKey = session.tenantKey || session.tenant_key;
  const userId = session.userId || session.id || 'unknown';

  return await SalesPipelineErrorHandler.withErrorHandling(async () => {
    let connection;

    try {
      const body: CreateLeadRequest = await request.json();

      // Validate input data
      SalesPipelineValidator.validateCreateLeadRequest(body);

      // Connect to tenant database
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      try {
        // Start transaction
        await connection.beginTransaction();

        const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Calculate initial temperature
        const initialLead = {
          success_probability: body.success_probability || 50,
          last_followup_date: null,
          next_action_date: body.next_action_date || null
        };
        const initialTemperature = leadTemperatureService.calculateLeadTemperature(initialLead);

        // Create lead in customers table (Requirement 1.2: default type to 'lead')
        await connection.query(`
          INSERT INTO customers (
            id, tenant_key, name, email, phone, company_name, 
            type, current_pipeline_stage, deal_value, success_probability,
            sales_owner, next_action_date, lead_temperature,
            source, notes, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'lead', 'new_lead', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          leadId, tenantKey, body.name, body.email || null, body.phone || null,
          body.company_name || null, body.deal_value || null, body.success_probability || 50,
          body.sales_owner || null, body.next_action_date || null, initialTemperature,
          body.source || null, body.notes || null, userId
        ]);

        // Commit transaction
        await connection.commit();

        // Initialize module integrations (Requirements 8.2, 8.3, 8.5)
        try {
          await salesPipelineIntegration.initializeLeadIntegrations(leadId, tenantKey, userId);
        } catch (integrationError) {
          IntegrationErrorHandler.handleModuleError('initialization', 'initializeLeadIntegrations', integrationError);
        }

        return NextResponse.json({
          success: true,
          message: 'سرنخ جدید با موفقیت ایجاد شد',
          data: {
            lead_id: leadId,
            name: body.name,
            stage: 'new_lead',
            temperature: initialTemperature
          }
        });

      } catch (error) {
        await connection.rollback();
        DatabaseErrorHandler.handleTransactionError(error);
      } finally {
        if (connection) connection.release();
      }

    } catch (error) {
      if (error.code && error.code.includes('ECONNREFUSED')) {
        DatabaseErrorHandler.handleConnectionError(error);
      }
      throw error;
    }
  }, {
    tenantKey,
    userId,
    operation: 'create_lead'
  });
}

export const POST = requireTenantPermission('sales_pipeline')(handleCreateLead);