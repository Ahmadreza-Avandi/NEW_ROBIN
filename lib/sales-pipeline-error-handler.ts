/**
 * Sales Pipeline Error Handling System
 * 
 * Comprehensive error handling for all sales pipeline operations including:
 * - Database error handling
 * - Input validation
 * - User-friendly error messages
 * - Error logging and monitoring
 * 
 * Requirements: All requirements (error handling)
 */

import { getTenantConnection } from './tenant-database';
import { Lead, PipelineStageType, CreateLeadRequest } from './sales-pipeline-types';

/**
 * Error Types for Sales Pipeline
 */
export enum SalesPipelineErrorType {
  // Database Errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_VIOLATION = 'DATABASE_CONSTRAINT_VIOLATION',
  DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_STAGE = 'INVALID_STAGE',
  INVALID_LEAD_DATA = 'INVALID_LEAD_DATA',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_VALUE = 'INVALID_FIELD_VALUE',
  
  // Business Logic Errors
  LEAD_NOT_FOUND = 'LEAD_NOT_FOUND',
  INVALID_STAGE_TRANSITION = 'INVALID_STAGE_TRANSITION',
  LOSS_REASON_REQUIRED = 'LOSS_REASON_REQUIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Integration Errors
  MODULE_INTEGRATION_ERROR = 'MODULE_INTEGRATION_ERROR',
  ACTIVITY_LOGGING_ERROR = 'ACTIVITY_LOGGING_ERROR',
  TASK_CREATION_ERROR = 'TASK_CREATION_ERROR',
  
  // System Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * Custom Error Classes
 */
export class SalesPipelineError extends Error {
  public readonly type: SalesPipelineErrorType;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly details?: any;
  public readonly statusCode: number;

  constructor(
    type: SalesPipelineErrorType,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'SalesPipelineError';
    this.type = type;
    this.code = type;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class DatabaseError extends SalesPipelineError {
  constructor(message: string, details?: any) {
    super(
      SalesPipelineErrorType.DATABASE_QUERY_ERROR,
      message,
      'خطا در دسترسی به پایگاه داده. لطفاً دوباره تلاش کنید.',
      500,
      details
    );
  }
}

export class ValidationError extends SalesPipelineError {
  constructor(message: string, field?: string, value?: any) {
    super(
      SalesPipelineErrorType.VALIDATION_ERROR,
      message,
      message, // Validation errors are user-friendly by default
      400,
      { field, value }
    );
  }
}

export class BusinessLogicError extends SalesPipelineError {
  constructor(type: SalesPipelineErrorType, message: string, userMessage: string) {
    super(type, message, userMessage, 400);
  }
}

/**
 * Error Logger
 */
export class ErrorLogger {
  private static instance: ErrorLogger;

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log error with context information
   */
  async logError(
    error: Error | SalesPipelineError,
    context: {
      tenantKey?: string;
      userId?: string;
      operation?: string;
      leadId?: string;
      additionalData?: any;
    }
  ): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: error instanceof SalesPipelineError ? error.type : 'UNKNOWN_ERROR',
        code: error instanceof SalesPipelineError ? error.code : 'UNKNOWN'
      },
      context,
      severity: this.determineSeverity(error)
    };

    // Log to console (in production, this would go to a proper logging service)
    console.error('🚨 Sales Pipeline Error:', JSON.stringify(errorLog, null, 2));

    // Store in database for monitoring
    try {
      await this.storeErrorInDatabase(errorLog, context.tenantKey);
    } catch (dbError) {
      console.error('❌ Failed to store error in database:', dbError);
    }
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof SalesPipelineError) {
      switch (error.type) {
        case SalesPipelineErrorType.DATABASE_CONNECTION_ERROR:
        case SalesPipelineErrorType.DATABASE_TRANSACTION_ERROR:
          return 'critical';
        case SalesPipelineErrorType.DATABASE_QUERY_ERROR:
        case SalesPipelineErrorType.MODULE_INTEGRATION_ERROR:
          return 'high';
        case SalesPipelineErrorType.VALIDATION_ERROR:
        case SalesPipelineErrorType.PERMISSION_DENIED:
          return 'medium';
        default:
          return 'low';
      }
    }
    return 'medium';
  }

  private async storeErrorInDatabase(errorLog: any, tenantKey?: string): Promise<void> {
    if (!tenantKey) return;

    let connection;
    try {
      const pool = await getTenantConnection(tenantKey);
      connection = await pool.getConnection();

      await connection.query(`
        INSERT INTO error_logs (
          tenant_key, error_type, error_message, error_stack,
          context_data, severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        tenantKey,
        errorLog.error.type,
        errorLog.error.message,
        errorLog.error.stack,
        JSON.stringify(errorLog.context),
        errorLog.severity
      ]);
    } catch (error) {
      // Don't throw - error logging shouldn't break the main flow
      console.error('Failed to store error log:', error);
    } finally {
      if (connection) connection.release();
    }
  }
}

/**
 * Input Validation Functions
 */
export class SalesPipelineValidator {
  /**
   * Validate lead creation data
   */
  static validateCreateLeadRequest(data: CreateLeadRequest): void {
    const errors: string[] = [];

    // Required fields
    if (!data.name || !data.name.trim()) {
      errors.push('نام سرنخ الزامی است');
    }

    // Name length validation
    if (data.name && data.name.length > 100) {
      errors.push('نام سرنخ نمی‌تواند بیش از 100 کاراکتر باشد');
    }

    // Email validation
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('فرمت ایمیل معتبر نیست');
    }

    // Phone validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('فرمت شماره تلفن معتبر نیست');
    }

    // Deal value validation
    if (data.deal_value !== undefined && data.deal_value !== null) {
      if (data.deal_value < 0) {
        errors.push('مبلغ معامله نمی‌تواند منفی باشد');
      }
      if (data.deal_value > 999999999999) {
        errors.push('مبلغ معامله بیش از حد مجاز است');
      }
    }

    // Success probability validation
    if (data.success_probability !== undefined && data.success_probability !== null) {
      if (data.success_probability < 0 || data.success_probability > 100) {
        errors.push('احتمال موفقیت باید بین 0 تا 100 باشد');
      }
    }

    // Next action date validation
    if (data.next_action_date && new Date(data.next_action_date) < new Date()) {
      errors.push('تاریخ اقدام بعدی نمی‌تواند در گذشته باشد');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  /**
   * Validate stage change request
   */
  static validateStageChange(
    currentStage: PipelineStageType,
    newStage: PipelineStageType,
    reason?: string
  ): void {
    const validStages: PipelineStageType[] = [
      'new_lead', 'contacted', 'needs_analysis', 
      'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'
    ];

    if (!validStages.includes(newStage)) {
      throw new ValidationError('مرحله انتخابی معتبر نیست');
    }

    // Validate stage transitions
    if (!this.isValidStageTransition(currentStage, newStage)) {
      throw new BusinessLogicError(
        SalesPipelineErrorType.INVALID_STAGE_TRANSITION,
        `Invalid transition from ${currentStage} to ${newStage}`,
        `تغییر از مرحله "${this.getStageDisplayName(currentStage)}" به "${this.getStageDisplayName(newStage)}" مجاز نیست`
      );
    }

    // Loss reason required for closed_lost
    if (newStage === 'closed_lost' && (!reason || !reason.trim())) {
      throw new BusinessLogicError(
        SalesPipelineErrorType.LOSS_REASON_REQUIRED,
        'Loss reason required for closed_lost stage',
        'دلیل عدم موفقیت برای مرحله "از دست رفته" الزامی است'
      );
    }
  }

  /**
   * Validate lead update data
   */
  static validateLeadUpdate(data: Partial<Lead>): void {
    const errors: string[] = [];

    // Name validation
    if (data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        errors.push('نام سرنخ نمی‌تواند خالی باشد');
      } else if (data.name.length > 100) {
        errors.push('نام سرنخ نمی‌تواند بیش از 100 کاراکتر باشد');
      }
    }

    // Email validation
    if (data.email !== undefined && data.email && !this.isValidEmail(data.email)) {
      errors.push('فرمت ایمیل معتبر نیست');
    }

    // Phone validation
    if (data.phone !== undefined && data.phone && !this.isValidPhone(data.phone)) {
      errors.push('فرمت شماره تلفن معتبر نیست');
    }

    // Deal value validation
    if (data.deal_value !== undefined && data.deal_value !== null) {
      if (data.deal_value < 0) {
        errors.push('مبلغ معامله نمی‌تواند منفی باشد');
      }
      if (data.deal_value > 999999999999) {
        errors.push('مبلغ معامله بیش از حد مجاز است');
      }
    }

    // Success probability validation
    if (data.success_probability !== undefined && data.success_probability !== null) {
      if (data.success_probability < 0 || data.success_probability > 100) {
        errors.push('احتمال موفقیت باید بین 0 تا 100 باشد');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  /**
   * Helper validation methods
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    // Persian/Iranian phone number patterns
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  private static isValidStageTransition(from: PipelineStageType, to: PipelineStageType): boolean {
    // Define valid transitions
    const validTransitions: Record<PipelineStageType, PipelineStageType[]> = {
      'new_lead': ['contacted', 'closed_lost'],
      'contacted': ['needs_analysis', 'closed_lost'],
      'needs_analysis': ['proposal_sent', 'contacted', 'closed_lost'],
      'proposal_sent': ['negotiation', 'needs_analysis', 'closed_lost'],
      'negotiation': ['closed_won', 'closed_lost', 'proposal_sent'],
      'closed_won': [], // Final state
      'closed_lost': ['new_lead'] // Can be reopened
    };

    return validTransitions[from]?.includes(to) || false;
  }

  private static getStageDisplayName(stage: PipelineStageType): string {
    const stageNames = {
      'new_lead': 'سرنخ جدید',
      'contacted': 'تماس اولیه',
      'needs_analysis': 'نیازسنجی',
      'proposal_sent': 'ارسال پیشنهاد',
      'negotiation': 'مذاکره',
      'closed_won': 'برنده شده',
      'closed_lost': 'از دست رفته'
    };
    return stageNames[stage] || stage;
  }
}

/**
 * Database Error Handler
 */
export class DatabaseErrorHandler {
  /**
   * Handle database connection errors
   */
  static handleConnectionError(error: any): never {
    const logger = ErrorLogger.getInstance();
    
    const dbError = new SalesPipelineError(
      SalesPipelineErrorType.DATABASE_CONNECTION_ERROR,
      `Database connection failed: ${error.message}`,
      'خطا در اتصال به پایگاه داده. لطفاً دوباره تلاش کنید.',
      503,
      { originalError: error.message, code: error.code }
    );

    logger.logError(dbError, { operation: 'database_connection' });
    throw dbError;
  }

  /**
   * Handle database query errors
   */
  static handleQueryError(error: any, query?: string): never {
    const logger = ErrorLogger.getInstance();
    
    // Check for specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      throw new SalesPipelineError(
        SalesPipelineErrorType.DATABASE_CONSTRAINT_VIOLATION,
        `Duplicate entry: ${error.message}`,
        'این اطلاعات قبلاً ثبت شده است',
        409,
        { sqlMessage: error.sqlMessage, query }
      );
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new SalesPipelineError(
        SalesPipelineErrorType.DATABASE_CONSTRAINT_VIOLATION,
        `Foreign key constraint failed: ${error.message}`,
        'ارجاع به اطلاعات نامعتبر',
        400,
        { sqlMessage: error.sqlMessage, query }
      );
    }

    if (error.code === 'ER_DATA_TOO_LONG') {
      throw new ValidationError('داده‌های ورودی بیش از حد مجاز طولانی است');
    }

    // Generic database error
    const dbError = new DatabaseError(
      `Database query failed: ${error.message}`,
      { sqlMessage: error.sqlMessage, code: error.code, query }
    );

    logger.logError(dbError, { operation: 'database_query' });
    throw dbError;
  }

  /**
   * Handle transaction errors
   */
  static handleTransactionError(error: any): never {
    const logger = ErrorLogger.getInstance();
    
    const transactionError = new SalesPipelineError(
      SalesPipelineErrorType.DATABASE_TRANSACTION_ERROR,
      `Transaction failed: ${error.message}`,
      'خطا در انجام عملیات. تغییرات لغو شد.',
      500,
      { originalError: error.message }
    );

    logger.logError(transactionError, { operation: 'database_transaction' });
    throw transactionError;
  }
}

/**
 * Integration Error Handler
 */
export class IntegrationErrorHandler {
  /**
   * Handle module integration errors
   */
  static handleModuleError(moduleName: string, operation: string, error: any): void {
    const logger = ErrorLogger.getInstance();
    
    const integrationError = new SalesPipelineError(
      SalesPipelineErrorType.MODULE_INTEGRATION_ERROR,
      `${moduleName} integration failed: ${error.message}`,
      `خطا در ادغام با ماژول ${moduleName}`,
      500,
      { module: moduleName, operation, originalError: error.message }
    );

    // Log but don't throw - integration errors shouldn't break main flow
    logger.logError(integrationError, { operation: `${moduleName}_integration` });
  }

  /**
   * Handle activity logging errors
   */
  static handleActivityError(error: any): void {
    const logger = ErrorLogger.getInstance();
    
    const activityError = new SalesPipelineError(
      SalesPipelineErrorType.ACTIVITY_LOGGING_ERROR,
      `Activity logging failed: ${error.message}`,
      'خطا در ثبت فعالیت',
      500,
      { originalError: error.message }
    );

    logger.logError(activityError, { operation: 'activity_logging' });
  }

  /**
   * Handle task creation errors
   */
  static handleTaskError(error: any): void {
    const logger = ErrorLogger.getInstance();
    
    const taskError = new SalesPipelineError(
      SalesPipelineErrorType.TASK_CREATION_ERROR,
      `Task creation failed: ${error.message}`,
      'خطا در ایجاد وظیفه',
      500,
      { originalError: error.message }
    );

    logger.logError(taskError, { operation: 'task_creation' });
  }
}

/**
 * Main Error Handler
 */
export class SalesPipelineErrorHandler {
  private static logger = ErrorLogger.getInstance();

  /**
   * Handle and format errors for API responses
   */
  static async handleError(
    error: any,
    context: {
      tenantKey?: string;
      userId?: string;
      operation?: string;
      leadId?: string;
    }
  ): Promise<{
    success: false;
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  }> {
    // Log the error
    await this.logger.logError(error, context);

    // Handle known error types
    if (error instanceof SalesPipelineError) {
      return {
        success: false,
        message: error.userMessage,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      };
    }

    // Handle MySQL errors
    if (error.code && error.code.startsWith('ER_')) {
      try {
        DatabaseErrorHandler.handleQueryError(error);
      } catch (dbError) {
        if (dbError instanceof SalesPipelineError) {
          return {
            success: false,
            message: dbError.userMessage,
            code: dbError.code,
            statusCode: dbError.statusCode
          };
        }
      }
    }

    // Handle unknown errors
    return {
      success: false,
      message: 'خطای غیرمنتظره رخ داده است. لطفاً دوباره تلاش کنید.',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Wrap async operations with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: {
      tenantKey?: string;
      userId?: string;
      operation?: string;
      leadId?: string;
    }
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorResponse = await this.handleError(error, context);
      throw new SalesPipelineError(
        errorResponse.code as SalesPipelineErrorType,
        error.message || 'Unknown error',
        errorResponse.message,
        errorResponse.statusCode
      );
    }
  }
}

/**
 * Utility functions for error handling
 */
export const ErrorUtils = {
  /**
   * Check if error is a validation error
   */
  isValidationError(error: any): error is ValidationError {
    return error instanceof ValidationError;
  },

  /**
   * Check if error is a database error
   */
  isDatabaseError(error: any): error is DatabaseError {
    return error instanceof DatabaseError || (error.code && error.code.startsWith('ER_'));
  },

  /**
   * Check if error is a permission error
   */
  isPermissionError(error: any): boolean {
    return error instanceof SalesPipelineError && 
           error.type === SalesPipelineErrorType.PERMISSION_DENIED;
  },

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any): string {
    if (error instanceof SalesPipelineError) {
      return error.userMessage;
    }
    return 'خطای غیرمنتظره رخ داده است';
  },

  /**
   * Get error status code
   */
  getStatusCode(error: any): number {
    if (error instanceof SalesPipelineError) {
      return error.statusCode;
    }
    return 500;
  }
};