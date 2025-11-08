-- Create demo users for testing multi-tenant functionality
-- این اسکریپت user های نمونه برای tenant های مختلف میسازه

-- Demo tenant users
INSERT INTO users (id, tenant_key, name, email, password, role, phone, status, created_at, updated_at)
VALUES 
  ('demo-ceo-001', 'demo', 'مدیر عامل دمو', 'ceo@demo.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'ceo', '09111111111', 'active', NOW(), NOW()),
  ('demo-manager-001', 'demo', 'مدیر فروش دمو', 'manager@demo.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_manager', '09111111112', 'active', NOW(), NOW()),
  ('demo-agent-001', 'demo', 'کارشناس فروش دمو 1', 'agent1@demo.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', '09111111113', 'active', NOW(), NOW()),
  ('demo-agent-002', 'demo', 'کارشناس فروش دمو 2', 'agent2@demo.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', '09111111114', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  tenant_key = VALUES(tenant_key),
  name = VALUES(name),
  email = VALUES(email),
  role = VALUES(role),
  phone = VALUES(phone),
  status = VALUES(status);

-- Samin tenant users
INSERT INTO users (id, tenant_key, name, email, password, role, phone, status, created_at, updated_at)
VALUES 
  ('samin-ceo-001', 'samin', 'مدیر عامل سامین', 'ceo@samin.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'ceo', '09222222221', 'active', NOW(), NOW()),
  ('samin-manager-001', 'samin', 'مدیر فروش سامین', 'manager@samin.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_manager', '09222222222', 'active', NOW(), NOW()),
  ('samin-agent-001', 'samin', 'کارشناس فروش سامین 1', 'agent1@samin.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', '09222222223', 'active', NOW(), NOW()),
  ('samin-agent-002', 'samin', 'کارشناس فروش سامین 2', 'agent2@samin.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'sales_agent', '09222222224', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  tenant_key = VALUES(tenant_key),
  name = VALUES(name),
  email = VALUES(email),
  role = VALUES(role),
  phone = VALUES(phone),
  status = VALUES(status);

-- Demo tenant customers
INSERT INTO customers (id, tenant_key, name, email, phone, status, priority, segment, created_at, updated_at)
VALUES 
  (UUID(), 'demo', 'شرکت نمونه دمو 1', 'company1@demo.com', '09111111115', 'prospect', 'high', 'enterprise', NOW(), NOW()),
  (UUID(), 'demo', 'شرکت نمونه دمو 2', 'company2@demo.com', '09111111116', 'active', 'medium', 'small_business', NOW(), NOW()),
  (UUID(), 'demo', 'مشتری دمو 3', 'customer3@demo.com', '09111111117', 'prospect', 'low', 'individual', NOW(), NOW());

-- Samin tenant customers
INSERT INTO customers (id, tenant_key, name, email, phone, status, priority, segment, created_at, updated_at)
VALUES 
  (UUID(), 'samin', 'شرکت نمونه سامین 1', 'company1@samin.com', '09222222225', 'prospect', 'high', 'enterprise', NOW(), NOW()),
  (UUID(), 'samin', 'شرکت نمونه سامین 2', 'company2@samin.com', '09222222226', 'active', 'medium', 'small_business', NOW(), NOW()),
  (UUID(), 'samin', 'مشتری سامین 3', 'customer3@samin.com', '09222222227', 'prospect', 'low', 'individual', NOW(), NOW());

-- Demo tenant tasks
INSERT INTO tasks (id, tenant_key, title, description, assigned_to, assigned_by, status, priority, created_at, updated_at)
VALUES 
  (UUID(), 'demo', 'تماس با مشتری دمو', 'پیگیری پروژه جدید', 'demo-agent-001', 'demo-ceo-001', 'pending', 'high', NOW(), NOW()),
  (UUID(), 'demo', 'ارسال پیشنهاد قیمت', 'آماده سازی پیشنهاد برای مشتری', 'demo-agent-002', 'demo-manager-001', 'in_progress', 'medium', NOW(), NOW());

-- Samin tenant tasks
INSERT INTO tasks (id, tenant_key, title, description, assigned_to, assigned_by, status, priority, created_at, updated_at)
VALUES 
  (UUID(), 'samin', 'تماس با مشتری سامین', 'پیگیری پروژه جدید', 'samin-agent-001', 'samin-ceo-001', 'pending', 'high', NOW(), NOW()),
  (UUID(), 'samin', 'ارسال پیشنهاد قیمت', 'آماده سازی پیشنهاد برای مشتری', 'samin-agent-002', 'samin-manager-001', 'in_progress', 'medium', NOW(), NOW());

SELECT 'Demo users and data created successfully!' as status;
SELECT 'Password for all demo users: 123456' as info;
