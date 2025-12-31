-- Create error_logs table for sales pipeline error monitoring
-- This table stores all errors that occur in the sales pipeline system

CREATE TABLE IF NOT EXISTS error_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_key VARCHAR(50) NOT NULL DEFAULT 'rabin',
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context_data JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by VARCHAR(36) NULL,
    resolution_notes TEXT NULL,
    
    INDEX idx_tenant_key (tenant_key),
    INDEX idx_error_type (error_type),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at),
    INDEX idx_resolved (resolved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;