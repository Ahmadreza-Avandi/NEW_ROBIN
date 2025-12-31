-- Add sales_pipeline module to the modules table
-- Requirements: 10.1

INSERT INTO `modules` (`id`, `name`, `display_name`, `description`, `route`, `icon`, `parent_id`, `sort_order`, `is_active`, `created_at`) VALUES
('mod-022', 'sales_pipeline', 'پیگیری فروش', 'سیستم مدیریت فرآیند فروش و پیگیری سرنخ‌ها', '/dashboard/sales-pipeline', 'TrendingUp', NULL, 25, 1, NOW())
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  description = VALUES(description),
  route = VALUES(route),
  icon = VALUES(icon),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);