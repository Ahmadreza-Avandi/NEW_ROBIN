-- Missing Tables for CRM System
-- Import this file to create missing tables and fix database issues

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE IF NOT EXISTS `modules` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `route` varchar(100) DEFAULT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT IGNORE INTO `modules` (`id`, `name`, `display_name`, `description`, `icon`, `route`, `parent_id`, `sort_order`, `is_active`) VALUES
('mod-dashboard', 'dashboard', 'داشبورد', 'صفحه اصلی سیستم', 'home', '/dashboard', NULL, 1, 1),
('mod-customers', 'customers', 'مشتریان', 'مدیریت مشتریان', 'users', '/dashboard/customers', NULL, 2, 1),
('mod-sales', 'sales', 'فروش', 'مدیریت فروش و معاملات', 'shopping-cart', '/dashboard/sales', NULL, 3, 1),
('mod-activities', 'activities', 'فعالیت‌ها', 'مدیریت فعالیت‌ها و تعاملات', 'activity', '/dashboard/activities', NULL, 4, 1),
('mod-calendar', 'calendar', 'تقویم', 'مدیریت رویدادها و جلسات', 'calendar', '/dashboard/calendar', NULL, 5, 1),
('mod-feedback', 'feedback', 'بازخورد', 'مدیریت بازخوردهای مشتریان', 'message-circle', '/dashboard/feedback', NULL, 6, 1),
('mod-documents', 'documents', 'اسناد', 'مدیریت اسناد و فایل‌ها', 'file-text', '/dashboard/documents', NULL, 7, 1),
('mod-reports', 'reports', 'گزارشات', 'گزارشات و آمار', 'bar-chart', '/dashboard/reports', NULL, 8, 1),
('mod-settings', 'settings', 'تنظیمات', 'تنظیمات سیستم', 'settings', '/dashboard/settings', NULL, 9, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions` (already exists with different structure)
-- This table exists but has different columns: resource, action, granted
-- No need to create it again

-- --------------------------------------------------------

--
-- Table structure for table `sales_pipeline_stages`
--

CREATE TABLE IF NOT EXISTS `sales_pipeline_stages` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_pipeline_stages`
--

INSERT IGNORE INTO `sales_pipeline_stages` (`id`, `name`, `description`, `stage_order`, `color`) VALUES
('stage-001', 'مشتری بالقوه', 'مشتریان جدید که هنوز تماس اولیه برقرار نشده', 1, '#6B7280'),
('stage-002', 'تماس اولیه', 'اولین تماس با مشتری برقرار شده', 2, '#3B82F6'),
('stage-003', 'ارزیابی نیاز', 'نیازهای مشتری شناسایی شده', 3, '#F59E0B'),
('stage-004', 'ارائه پیشنهاد', 'پیشنهاد قیمت ارائه شده', 4, '#8B5CF6'),
('stage-005', 'مذاکره', 'در حال مذاکره با مشتری', 5, '#EF4444'),
('stage-006', 'بسته شده - برنده', 'معامله با موفقیت بسته شده', 6, '#10B981'),
('stage-007', 'بسته شده - بازنده', 'معامله شکست خورده', 7, '#DC2626');

-- --------------------------------------------------------

--
-- Add missing columns to existing tables
--

-- Add missing columns to feedback table
ALTER TABLE `feedback` 
ADD COLUMN IF NOT EXISTS `assigned_to` varchar(36) DEFAULT NULL AFTER `customer_id`,
ADD COLUMN IF NOT EXISTS `resolved_by` varchar(36) DEFAULT NULL AFTER `assigned_to`,
ADD COLUMN IF NOT EXISTS `resolved_at` timestamp NULL DEFAULT NULL AFTER `resolved_by`;

-- Add missing columns to users table if it exists
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `department` varchar(100) DEFAULT NULL AFTER `role`,
ADD COLUMN IF NOT EXISTS `position` varchar(100) DEFAULT NULL AFTER `department`,
ADD COLUMN IF NOT EXISTS `last_login` timestamp NULL DEFAULT NULL AFTER `is_active`;

-- --------------------------------------------------------

--
-- Create missing views
--

-- Drop existing views if they exist
DROP VIEW IF EXISTS `daily_interaction_stats`;
DROP VIEW IF EXISTS `interaction_summary`;
DROP VIEW IF EXISTS `sales_pipeline_report`;
DROP VIEW IF EXISTS `sales_statistics`;

-- Create daily_interaction_stats view
CREATE VIEW `daily_interaction_stats` AS
SELECT 
    DATE(created_at) as interaction_date,
    'email' as type,
    'outbound' as direction,
    'neutral' as sentiment,
    COUNT(*) as interaction_count,
    AVG(0) as avg_duration
FROM feedback 
WHERE type = 'email'
GROUP BY DATE(created_at)
UNION ALL
SELECT 
    DATE(created_at) as interaction_date,
    'phone' as type,
    'inbound' as direction,
    'positive' as sentiment,
    COUNT(*) as interaction_count,
    AVG(30) as avg_duration
FROM activities 
WHERE type = 'call'
GROUP BY DATE(created_at);

-- Create interaction_summary view
CREATE VIEW `interaction_summary` AS
SELECT 
    id,
    customer_id,
    type,
    title as subject,
    description,
    'outbound' as direction,
    created_at as interaction_date,
    duration,
    outcome,
    'positive' as sentiment,
    performed_by as user_id
FROM activities
UNION ALL
SELECT 
    id,
    customer_id,
    type,
    title as subject,
    comment as description,
    'inbound' as direction,
    created_at as interaction_date,
    0 as duration,
    status as outcome,
    sentiment,
    assigned_to as user_id
FROM feedback;

-- Create sales_pipeline_report view
CREATE VIEW `sales_pipeline_report` AS
SELECT 
    d.id as deal_id,
    d.title as deal_title,
    d.total_value as deal_value,
    d.probability,
    d.expected_close_date,
    d.stage_id,
    sps.name as stage_name,
    sps.stage_order,
    c.name as customer_name,
    u.name as assigned_to_name,
    d.created_at
FROM deals d
LEFT JOIN sales_pipeline_stages sps ON d.stage_id = sps.id
LEFT JOIN customers c ON d.customer_id = c.id
LEFT JOIN users u ON d.assigned_to = u.id
WHERE d.stage_id NOT IN ('stage-006', 'stage-007');

-- Create sales_statistics view
CREATE VIEW `sales_statistics` AS
SELECT 
    DATE(sale_date) as sale_date,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_sale_value
FROM sales
GROUP BY DATE(sale_date);

-- --------------------------------------------------------

--
-- Add indexes for better performance
--

CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_assigned_to ON feedback(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_customer_id ON activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_performed_by ON activities(performed_by);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_sales_person_id ON sales(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_user_permissions_action ON user_permissions(action);

-- --------------------------------------------------------

--
-- Update existing data to fix inconsistencies
--

UPDATE customers SET status = 'prospect' WHERE status IS NULL OR status = '';
UPDATE activities SET outcome = 'completed' WHERE outcome IS NULL OR outcome = '';
UPDATE feedback SET status = 'pending' WHERE status IS NULL OR status = '';
UPDATE users SET is_active = 1 WHERE is_active IS NULL;

-- --------------------------------------------------------

--
-- Insert default permissions for CEO users
--

INSERT IGNORE INTO user_permissions (user_id, resource, action, granted)
SELECT u.id, 'sales', 'manage', 1
FROM users u
WHERE u.role = 'ceo' AND NOT EXISTS (
    SELECT 1 FROM user_permissions up 
    WHERE up.user_id = u.id AND up.resource = 'sales' AND up.action = 'manage'
);

INSERT IGNORE INTO user_permissions (user_id, resource, action, granted)
SELECT u.id, 'customers', 'manage', 1
FROM users u
WHERE u.role = 'ceo' AND NOT EXISTS (
    SELECT 1 FROM user_permissions up 
    WHERE up.user_id = u.id AND up.resource = 'customers' AND up.action = 'manage'
);

INSERT IGNORE INTO user_permissions (user_id, resource, action, granted)
SELECT u.id, 'activities', 'manage', 1
FROM users u
WHERE u.role = 'ceo' AND NOT EXISTS (
    SELECT 1 FROM user_permissions up 
    WHERE up.user_id = u.id AND up.resource = 'activities' AND up.action = 'manage'
);

INSERT IGNORE INTO user_permissions (user_id, resource, action, granted)
SELECT u.id, 'feedback', 'manage', 1
FROM users u
WHERE u.role = 'ceo' AND NOT EXISTS (
    SELECT 1 FROM user_permissions up 
    WHERE up.user_id = u.id AND up.resource = 'feedback' AND up.action = 'manage'
);

-- --------------------------------------------------------

COMMIT;

-- Success message
SELECT 'Database tables and views created successfully!' as message;