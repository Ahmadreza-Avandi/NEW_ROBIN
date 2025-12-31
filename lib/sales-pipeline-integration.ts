/**
 * Sales Pipeline Integration Service
 * 
 * This service handles integration with existing modules (Activities, Tasks, Documents)
 * to ensure data consistency across all modules as required by Requirements 8.1-8.5
 */

import { Lead } from './sales-pipeline-types';

export interface ModuleIntegrationService {
  // Activities Module Integration (Requirement 8.2)
  getLeadActivities(leadId: string, tenantKey: string): Promise<any[]>;
  createLeadActivity(leadId: string, tenantKey: string, activity: any): Promise<any>;
  
  // Tasks Module Integration (Requirement 8.3)
  getLeadTasks(leadId: string, tenantKey: string): Promise<any[]>;
  createLeadTask(leadId: string, tenantKey: string, task: any): Promise<any>;
  
  // Documents Module Integration (Requirement 8.4)
  getLeadDocuments(leadId: string, tenantKey: string): Promise<any[]>;
  uploadLeadDocument(leadId: string, tenantKey: string, document: any): Promise<any>;
  
  // Data Consistency (Requirement 8.5)
  validateDataConsistency(leadId: string, tenantKey: string): Promise<boolean>;
  syncLeadData(leadId: string, tenantKey: string): Promise<void>;
}

/**
 * Activity Integration Functions
 * Requirement 8.2: Integrate with Activities module for timeline display
 */
export const activityIntegration = {
  /**
   * Create activity when lead stage changes
   */
  async logStageChange(
    leadId: string, 
    tenantKey: string, 
    fromStage: string, 
    toStage: string, 
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      const activity = {
        customer_id: leadId,
        tenant_key: tenantKey,
        title: `تغییر مرحله از ${fromStage} به ${toStage}`,
        description: reason ? `دلیل: ${reason}` : undefined,
        activity_type: 'stage_change',
        performed_by: userId,
        created_at: new Date().toISOString()
      };

      // This would integrate with the existing activities API
      const response = await fetch(`/api/${tenantKey}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) {
        throw new Error('Failed to log stage change activity');
      }
    } catch (error) {
      console.error('Error logging stage change activity:', error);
      // Don't throw - activity logging shouldn't break the main flow
    }
  },

  /**
   * Create activity for lead interactions
   */
  async logLeadInteraction(
    leadId: string,
    tenantKey: string,
    interactionType: 'call' | 'email' | 'meeting' | 'note',
    title: string,
    description?: string,
    userId?: string
  ): Promise<void> {
    try {
      const activity = {
        customer_id: leadId,
        tenant_key: tenantKey,
        title,
        description,
        activity_type: interactionType,
        performed_by: userId,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`/api/${tenantKey}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) {
        throw new Error('Failed to log lead interaction');
      }
    } catch (error) {
      console.error('Error logging lead interaction:', error);
    }
  }
};

/**
 * Task Integration Functions
 * Requirement 8.3: Integrate with Tasks module for lead task management
 */
export const taskIntegration = {
  /**
   * Create follow-up task when stage changes
   */
  async createFollowUpTask(
    leadId: string,
    tenantKey: string,
    newStage: string,
    userId: string
  ): Promise<void> {
    try {
      const stageTaskTemplates = {
        'contacted': {
          title: 'پیگیری تماس اولیه',
          description: 'پیگیری نتیجه تماس اولیه و برنامه‌ریزی برای مرحله بعد',
          priority: 'medium',
          due_days: 2
        },
        'needs_analysis': {
          title: 'تحلیل نیازهای مشتری',
          description: 'بررسی دقیق نیازهای مشتری و تهیه پیشنهاد مناسب',
          priority: 'high',
          due_days: 3
        },
        'proposal_sent': {
          title: 'پیگیری پیشنهاد ارسالی',
          description: 'پیگیری وضعیت بررسی پیشنهاد توسط مشتری',
          priority: 'high',
          due_days: 5
        },
        'negotiation': {
          title: 'مذاکره نهایی',
          description: 'انجام مذاکرات نهایی و تکمیل شرایط قرارداد',
          priority: 'high',
          due_days: 7
        }
      };

      const template = stageTaskTemplates[newStage as keyof typeof stageTaskTemplates];
      if (!template) return;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + template.due_days);

      const task = {
        customer_id: leadId,
        tenant_key: tenantKey,
        title: template.title,
        description: template.description,
        priority: template.priority,
        status: 'pending',
        assigned_to: userId,
        created_by: userId,
        due_date: dueDate.toISOString(),
        created_at: new Date().toISOString()
      };

      const response = await fetch(`/api/${tenantKey}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        throw new Error('Failed to create follow-up task');
      }
    } catch (error) {
      console.error('Error creating follow-up task:', error);
    }
  },

  /**
   * Create custom task for lead
   */
  async createLeadTask(
    leadId: string,
    tenantKey: string,
    taskData: {
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      due_date?: string;
      assigned_to?: string;
    },
    userId: string
  ): Promise<any> {
    try {
      const task = {
        customer_id: leadId,
        tenant_key: tenantKey,
        ...taskData,
        status: 'pending',
        created_by: userId,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`/api/${tenantKey}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        throw new Error('Failed to create lead task');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating lead task:', error);
      throw error;
    }
  }
};

/**
 * Document Integration Functions
 * Requirement 8.4: Link with Documents module for file management
 */
export const documentIntegration = {
  /**
   * Upload document for lead
   */
  async uploadLeadDocument(
    leadId: string,
    tenantKey: string,
    file: File,
    metadata: {
      title?: string;
      description?: string;
      category?: string;
    },
    userId: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('customer_id', leadId);
      formData.append('tenant_key', tenantKey);
      formData.append('uploaded_by', userId);
      
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);

      const response = await fetch(`/api/${tenantKey}/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading lead document:', error);
      throw error;
    }
  },

  /**
   * Get documents for lead
   */
  async getLeadDocuments(leadId: string, tenantKey: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/${tenantKey}/documents?customer_id=${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead documents');
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error fetching lead documents:', error);
      return [];
    }
  }
};

/**
 * Data Consistency Functions
 * Requirement 8.5: Ensure data consistency across all modules
 */
export const dataConsistency = {
  /**
   * Validate that lead data is consistent across all modules
   */
  async validateLeadConsistency(leadId: string, tenantKey: string): Promise<{
    isConsistent: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if lead exists in customers table
      const leadResponse = await fetch(`/api/${tenantKey}/customers/${leadId}`);
      if (!leadResponse.ok) {
        issues.push('Lead not found in customers table');
        return { isConsistent: false, issues };
      }

      const lead = await leadResponse.json();

      // Check activities consistency
      const activitiesResponse = await fetch(`/api/${tenantKey}/activities?customer_id=${leadId}`);
      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json();
        // Validate that all activities reference the correct customer_id
        const invalidActivities = activities.filter((activity: any) => activity.customer_id !== leadId);
        if (invalidActivities.length > 0) {
          issues.push(`${invalidActivities.length} activities have incorrect customer_id`);
        }
      }

      // Check tasks consistency
      const tasksResponse = await fetch(`/api/${tenantKey}/tasks?customer_id=${leadId}`);
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        const invalidTasks = tasks.filter((task: any) => task.customer_id !== leadId);
        if (invalidTasks.length > 0) {
          issues.push(`${invalidTasks.length} tasks have incorrect customer_id`);
        }
      }

      // Check documents consistency
      const documentsResponse = await fetch(`/api/${tenantKey}/documents?customer_id=${leadId}`);
      if (documentsResponse.ok) {
        const documents = await documentsResponse.json();
        const invalidDocuments = documents.filter((doc: any) => doc.customer_id !== leadId);
        if (invalidDocuments.length > 0) {
          issues.push(`${invalidDocuments.length} documents have incorrect customer_id`);
        }
      }

      return {
        isConsistent: issues.length === 0,
        issues
      };

    } catch (error) {
      console.error('Error validating lead consistency:', error);
      issues.push('Error during consistency validation');
      return { isConsistent: false, issues };
    }
  },

  /**
   * Sync lead data across all modules
   */
  async syncLeadData(leadId: string, tenantKey: string): Promise<void> {
    try {
      // Get the latest lead data
      const leadResponse = await fetch(`/api/${tenantKey}/customers/${leadId}`);
      if (!leadResponse.ok) {
        throw new Error('Lead not found');
      }

      const lead = await leadResponse.json();

      // Update activities to ensure they have correct customer reference
      await fetch(`/api/${tenantKey}/activities/sync-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: leadId,
          customer_name: lead.name,
          tenant_key: tenantKey
        })
      });

      // Update tasks to ensure they have correct customer reference
      await fetch(`/api/${tenantKey}/tasks/sync-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: leadId,
          customer_name: lead.name,
          tenant_key: tenantKey
        })
      });

      // Update documents to ensure they have correct customer reference
      await fetch(`/api/${tenantKey}/documents/sync-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: leadId,
          customer_name: lead.name,
          tenant_key: tenantKey
        })
      });

    } catch (error) {
      console.error('Error syncing lead data:', error);
      throw error;
    }
  }
};

/**
 * Main Integration Service
 * Combines all integration functions into a single service
 */
export const salesPipelineIntegration = {
  activities: activityIntegration,
  tasks: taskIntegration,
  documents: documentIntegration,
  consistency: dataConsistency,

  /**
   * Handle complete lead stage change with all integrations
   */
  async handleStageChange(
    leadId: string,
    tenantKey: string,
    fromStage: string,
    toStage: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Log the stage change as an activity (Requirement 8.2)
      await activityIntegration.logStageChange(leadId, tenantKey, fromStage, toStage, userId, reason);

      // Create follow-up task for the new stage (Requirement 8.3)
      await taskIntegration.createFollowUpTask(leadId, tenantKey, toStage, userId);

      // Validate data consistency after changes (Requirement 8.5)
      const consistency = await dataConsistency.validateLeadConsistency(leadId, tenantKey);
      if (!consistency.isConsistent) {
        console.warn('Data consistency issues detected:', consistency.issues);
        // Attempt to sync data
        await dataConsistency.syncLeadData(leadId, tenantKey);
      }

    } catch (error) {
      console.error('Error handling stage change integration:', error);
      // Don't throw - integration issues shouldn't break the main flow
    }
  },

  /**
   * Initialize lead with all module integrations
   */
  async initializeLeadIntegrations(
    leadId: string,
    tenantKey: string,
    userId: string
  ): Promise<void> {
    try {
      // Create initial activity
      await activityIntegration.logLeadInteraction(
        leadId,
        tenantKey,
        'note',
        'سرنخ جدید ایجاد شد',
        'سرنخ جدید در سیستم ثبت شد و آماده پیگیری است',
        userId
      );

      // Create initial follow-up task
      await taskIntegration.createFollowUpTask(leadId, tenantKey, 'new_lead', userId);

    } catch (error) {
      console.error('Error initializing lead integrations:', error);
    }
  }
};