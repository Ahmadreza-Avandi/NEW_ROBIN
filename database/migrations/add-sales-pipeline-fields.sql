-- Sales Pipeline Database Migration
-- Add fields and tables needed for sales pipeline functionality
-- Requirements: 1.1, 2.1, 2.4

-- ========================================
-- 1. Add pipeline fields to customers table
-- ========================================

-- Add type field to distinguish between leads and customers
ALTER TABLE `customers` 
ADD COLUMN `type` ENUM('lead', 'customer') DEFAULT 'lead' 
COMMENT 'Customer type: lead (prospect) or customer (converted)' 
AFTER `lifecycle_stage`;

-- Add current pipeline stage field
ALTER TABLE `customers` 
ADD COLUMN `current_pipeline_stage` VARCHAR(50) DEFAULT 'new_lead' 
COMMENT 'Current stage in the sales pipeline' 
AFTER `type`;

-- Add deal value field
ALTER TABLE `customers` 
ADD COLUMN `deal_value` DECIMAL(15,2) DEFAULT NULL 
COMMENT 'Potential deal value for this lead' 
AFTER `potential_value`;

-- Add success probability field
ALTER TABLE `customers` 
ADD COLUMN `success_probability` INT DEFAULT 50 
COMMENT 'Success probability percentage (0-100)' 
AFTER `deal_value`;

-- Add sales owner field
ALTER TABLE `customers` 
ADD COLUMN `sales_owner` VARCHAR(36) DEFAULT NULL 
COMMENT 'Assigned sales person for this lead' 
AFTER `assigned_to`;

-- Add last followup date field
ALTER TABLE `customers` 
ADD COLUMN `last_followup_date` TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Date of last follow-up contact' 
AFTER `last_interaction`;

-- Add next action date field
ALTER TABLE `customers` 
ADD COLUMN `next_action_date` TIMESTAMP NULL DEFAULT NULL 
COMMENT 'Scheduled date for next action' 
AFTER `last_followup_date`;

-- Add lead temperature field
ALTER TABLE `customers` 
ADD COLUMN `lead_temperature` ENUM('hot', 'warm', 'cold') DEFAULT 'warm' 
COMMENT 'Lead temperature based on interaction and probability' 
AFTER `lead_score`;

-- Add loss reason field
ALTER TABLE `customers` 
ADD COLUMN `loss_reason` TEXT NULL 
COMMENT 'Reason for losing the lead (required for closed_lost)' 
AFTER `lead_temperature`;

-- ========================================
-- 2. Create pipeline_stages table
-- ========================================

CREATE TABLE IF NOT EXISTS `pipeline_stages` (
  `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `tenant_key` VARCHAR(50) DEFAULT 'rabin',
  `name` VARCHAR(100) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `stage_order` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_stage_tenant` (`name`, `tenant_key`),
  KEY `idx_pipeline_stages_tenant` (`tenant_key`),
  KEY `idx_pipeline_stages_order` (`stage_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default pipeline stages
INSERT INTO `pipeline_stages` (`name`, `display_name`, `stage_order`, `tenant_key`) VALUES
('new_lead', 'سرنخ جدید', 1, 'rabin'),
('contacted', 'تماس اولیه', 2, 'rabin'),
('needs_analysis', 'نیازسنجی', 3, 'rabin'),
('proposal_sent', 'ارسال پیشنهاد', 4, 'rabin'),
('negotiation', 'مذاکره', 5, 'rabin'),
('closed_won', 'برنده شده', 6, 'rabin'),
('closed_lost', 'از دست رفته', 7, 'rabin');

-- ========================================
-- 3. Create lead_pipeline_history table
-- ========================================

CREATE TABLE IF NOT EXISTS `lead_pipeline_history` (
  `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `tenant_key` VARCHAR(50) DEFAULT 'rabin',
  `customer_id` VARCHAR(36) NOT NULL,
  `from_stage` VARCHAR(50),
  `to_stage` VARCHAR(50) NOT NULL,
  `changed_by` VARCHAR(36) NOT NULL,
  `change_reason` TEXT,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_pipeline_history_customer` (`customer_id`),
  KEY `idx_pipeline_history_tenant` (`tenant_key`),
  KEY `idx_pipeline_history_date` (`changed_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. Add indexes for performance
-- ========================================

-- Index for pipeline stage queries
CREATE INDEX `idx_customers_pipeline_stage` ON `customers` (`current_pipeline_stage`);

-- Index for type-based filtering
CREATE INDEX `idx_customers_type` ON `customers` (`type`);

-- Index for temperature-based filtering
CREATE INDEX `idx_customers_temperature` ON `customers` (`lead_temperature`);

-- Index for sales owner queries
CREATE INDEX `idx_customers_sales_owner` ON `customers` (`sales_owner`);

-- Index for followup date queries
CREATE INDEX `idx_customers_followup_date` ON `customers` (`last_followup_date`);

-- Index for next action date queries
CREATE INDEX `idx_customers_next_action` ON `customers` (`next_action_date`);

-- Composite index for pipeline queries
CREATE INDEX `idx_customers_pipeline_composite` ON `customers` (`tenant_key`, `type`, `current_pipeline_stage`);

-- ========================================
-- 5. Update existing customer records with default values
-- ========================================

-- Set default type to 'lead' for all existing customers
UPDATE `customers` 
SET `type` = 'lead' 
WHERE `type` IS NULL;

-- Set default pipeline stage to 'new_lead' for all existing customers
UPDATE `customers` 
SET `current_pipeline_stage` = 'new_lead' 
WHERE `current_pipeline_stage` IS NULL;

-- Set default success probability to 50% for all existing customers
UPDATE `customers` 
SET `success_probability` = 50 
WHERE `success_probability` IS NULL;

-- Set default lead temperature to 'warm' for all existing customers
UPDATE `customers` 
SET `lead_temperature` = 'warm' 
WHERE `lead_temperature` IS NULL;

-- Create initial pipeline history entries for existing customers
INSERT INTO `lead_pipeline_history` (`customer_id`, `from_stage`, `to_stage`, `changed_by`, `change_reason`, `tenant_key`)
SELECT 
    `id`,
    NULL,
    'new_lead',
    'system',
    'Initial pipeline setup - migrated existing customer',
    `tenant_key`
FROM `customers` 
WHERE `id` NOT IN (SELECT DISTINCT `customer_id` FROM `lead_pipeline_history`);

-- ========================================
-- 6. Add constraints and validation
-- ========================================

-- Add check constraint for success probability range
ALTER TABLE `customers` 
ADD CONSTRAINT `chk_success_probability_range` 
CHECK (`success_probability` >= 0 AND `success_probability` <= 100);

-- Add check constraint for deal value (must be positive if set)
ALTER TABLE `customers` 
ADD CONSTRAINT `chk_deal_value_positive` 
CHECK (`deal_value` IS NULL OR `deal_value` >= 0);

-- ========================================
-- 7. Create permissions for sales pipeline module
-- ========================================

-- Insert sales pipeline module permissions if permissions table exists
INSERT IGNORE INTO `permissions` (`module`, `action`, `role`, `tenant_key`) VALUES
('sales_pipeline', 'view', 'ceo', 'rabin'),
('sales_pipeline', 'create', 'ceo', 'rabin'),
('sales_pipeline', 'update', 'ceo', 'rabin'),
('sales_pipeline', 'delete', 'ceo', 'rabin'),
('sales_pipeline', 'view', 'sales_manager', 'rabin'),
('sales_pipeline', 'create', 'sales_manager', 'rabin'),
('sales_pipeline', 'update', 'sales_manager', 'rabin'),
('sales_pipeline', 'delete', 'sales_manager', 'rabin'),
('sales_pipeline', 'view', 'sales_specialist', 'rabin'),
('sales_pipeline', 'create', 'sales_specialist', 'rabin'),
('sales_pipeline', 'update', 'sales_specialist', 'rabin');

SELECT 'Sales Pipeline database migration completed successfully!' as message;