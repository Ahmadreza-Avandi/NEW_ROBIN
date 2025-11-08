-- Script to separate tenant data
-- این اسکریپت داده‌های هر tenant رو جدا میکنه

-- ابتدا یه user برای tenant 'demo' بساز
INSERT INTO users (id, tenant_key, name, email, password, role, status, created_at, updated_at)
VALUES 
  ('demo-ceo-001', 'demo', 'مدیر دمو', 'demo@example.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'ceo', 'active', NOW(), NOW()),
  ('demo-agent-001', 'demo', 'فروشنده دمو', 'agent@demo.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE tenant_key = 'demo';

-- یه user برای tenant 'samin' بساز
INSERT INTO users (id, tenant_key, name, email, password, role, status, created_at, updated_at)
VALUES 
  ('samin-ceo-001', 'samin', 'مدیر سامین', 'samin@example.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'ceo', 'active', NOW(), NOW()),
  ('samin-agent-001', 'samin', 'فروشنده سامین', 'agent@samin.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE tenant_key = 'samin';

-- اگه میخوای داده‌های موجود رو به tenant های مختلف تقسیم کنی:
-- (این فقط مثاله، باید بر اساس نیازت تغییر بدی)

-- مثال: یه مشتری برای demo
INSERT INTO customers (id, tenant_key, name, email, phone, status, created_at, updated_at)
VALUES 
  (UUID(), 'demo', 'مشتری دمو', 'customer@demo.com', '09123456789', 'prospect', NOW(), NOW());

-- مثال: یه مشتری برای samin  
INSERT INTO customers (id, tenant_key, name, email, phone, status, created_at, updated_at)
VALUES 
  (UUID(), 'samin', 'مشتری سامین', 'customer@samin.com', '09123456788', 'prospect', NOW(), NOW());

-- نکته: اگه میخوای داده‌های موجود رو تقسیم کنی، باید دستی مشخص کنی
-- کدوم رکورد به کدوم tenant تعلق داره
-- مثلاً:
-- UPDATE users SET tenant_key = 'demo' WHERE email LIKE '%demo%';
-- UPDATE users SET tenant_key = 'samin' WHERE email LIKE '%samin%';

SELECT 'Tenant data separation completed!' as status;
