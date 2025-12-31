/**
 * Sales Pipeline System Types
 * 
 * This file contains TypeScript interfaces for the Sales Pipeline system
 * that extends the existing Customer interface with pipeline-specific fields.
 */

import { Customer, Activity, Task, Note } from './types';

/**
 * Lead interface extending Customer with pipeline fields
 * Represents a potential customer in the sales pipeline
 */
export interface Lead extends Customer {
  // Pipeline-specific fields
  type: 'lead' | 'customer';
  current_pipeline_stage: PipelineStageType;
  deal_value?: number;
  success_probability: number;
  sales_owner?: string;
  last_followup_date?: string;
  next_action_date?: string;
  lead_temperature: 'hot' | 'warm' | 'cold';
  loss_reason?: string;
  
  // Relations with other modules
  activities?: Activity[];
  tasks?: Task[];
  documents?: Document[];
  pipeline_history?: PipelineHistoryEntry[];
}

/**
 * Pipeline stage types
 */
export type PipelineStageType = 
  | 'new_lead' 
  | 'contacted' 
  | 'needs_analysis' 
  | 'proposal_sent' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost';

/**
 * Pipeline Stage interface with stage configuration
 * Represents a configurable stage in the sales pipeline
 */
export interface PipelineStage {
  id: string;
  tenant_key: string;
  name: PipelineStageType;
  display_name: string;
  stage_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Leads in this stage (populated when needed)
  leads?: Lead[];
}

/**
 * Pipeline History Entry interface for stage tracking
 * Tracks all stage transitions for a lead
 */
export interface PipelineHistoryEntry {
  id: string;
  tenant_key: string;
  customer_id: string;
  from_stage?: PipelineStageType;
  to_stage: PipelineStageType;
  changed_by: string;
  change_reason?: string;
  changed_at: string;
}

/**
 * Lead Temperature calculation result
 */
export type LeadTemperature = 'hot' | 'warm' | 'cold';

/**
 * Stage change request interface
 */
export interface StageChangeRequest {
  lead_id: string;
  new_stage: PipelineStageType;
  reason?: string;
  changed_by: string;
}

/**
 * Pipeline statistics interface
 */
export interface PipelineStats {
  total_leads: number;
  leads_by_stage: Record<PipelineStageType, number>;
  total_deal_value: number;
  average_deal_value: number;
  conversion_rate: number;
  hot_leads_count: number;
  warm_leads_count: number;
  cold_leads_count: number;
}

/**
 * Lead filters interface for list view
 */
export interface LeadFilters {
  stage?: PipelineStageType;
  temperature?: LeadTemperature;
  owner?: string;
  date_range?: {
    from: string;
    to: string;
  };
  search?: string;
}

/**
 * Bulk action interface for lead operations
 */
export interface BulkLeadAction {
  action: 'change_stage' | 'assign_owner' | 'update_temperature' | 'delete';
  lead_ids: string[];
  parameters?: Record<string, any>;
}

/**
 * Lead creation interface
 */
export interface CreateLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  deal_value?: number;
  success_probability?: number;
  sales_owner?: string;
  next_action_date?: string;
  source?: string;
  notes?: string;
}

/**
 * Lead update interface
 */
export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  deal_value?: number;
  success_probability?: number;
  sales_owner?: string;
  next_action_date?: string;
  lead_temperature?: LeadTemperature;
  loss_reason?: string;
}

/**
 * Alert interface for follow-up notifications
 */
export interface FollowUpAlert {
  id: string;
  type: 'warning' | 'info' | 'urgent';
  title: string;
  message: string;
  lead_id: string;
  lead_name: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  is_read: boolean;
  days_overdue: number;
}

/**
 * Automation rule interface
 */
export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'stage_change' | 'time_based' | 'interaction';
  condition: string;
  action: 'create_task' | 'send_alert' | 'update_field' | 'convert_lead';
  parameters: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Lead conversion result interface
 */
export interface LeadConversionResult {
  success: boolean;
  customer_id: string;
  conversion_date: string;
  sale_amount?: number;
  notes?: string;
}