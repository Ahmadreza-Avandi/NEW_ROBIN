-- Migration: Add tenant_key to all tables for multi-tenant support
-- این اسکریپت فیلد tenant_key رو به همه جداول اصلی اضافه می‌کنه

-- Users
ALTER TABLE `users` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_users_tenant` ON `users`(`tenant_key`);

-- Customers
ALTER TABLE `customers` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customers_tenant` ON `customers`(`tenant_key`);

-- Tasks
ALTER TABLE `tasks` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_tasks_tenant` ON `tasks`(`tenant_key`);

-- Activities
ALTER TABLE `activities` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_activities_tenant` ON `activities`(`tenant_key`);

-- Contacts
ALTER TABLE `contacts` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_contacts_tenant` ON `contacts`(`tenant_key`);

-- Deals
ALTER TABLE `deals` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_deals_tenant` ON `deals`(`tenant_key`);

-- Sales
ALTER TABLE `sales` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_sales_tenant` ON `sales`(`tenant_key`);

-- Products
ALTER TABLE `products` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_products_tenant` ON `products`(`tenant_key`);

-- Documents
ALTER TABLE `documents` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_documents_tenant` ON `documents`(`tenant_key`);

-- Chat Messages
ALTER TABLE `chat_messages` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_messages_tenant` ON `chat_messages`(`tenant_key`);

-- Chat Conversations
ALTER TABLE `chat_conversations` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_conversations_tenant` ON `chat_conversations`(`tenant_key`);

-- Chat Participants
ALTER TABLE `chat_participants` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_participants_tenant` ON `chat_participants`(`tenant_key`);

-- Feedback
ALTER TABLE `feedback` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_tenant` ON `feedback`(`tenant_key`);

-- Events (calendar_events)
ALTER TABLE `calendar_events` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_calendar_events_tenant` ON `calendar_events`(`tenant_key`);

-- Notes
ALTER TABLE `notes` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_notes_tenant` ON `notes`(`tenant_key`);

-- Daily Reports
ALTER TABLE `daily_reports` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_daily_reports_tenant` ON `daily_reports`(`tenant_key`);

-- Notifications
ALTER TABLE `notifications` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_notifications_tenant` ON `notifications`(`tenant_key`);

-- Tickets
ALTER TABLE `tickets` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_tickets_tenant` ON `tickets`(`tenant_key`);

-- Projects
ALTER TABLE `projects` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_projects_tenant` ON `projects`(`tenant_key`);

-- Pipelines
ALTER TABLE `pipelines` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_pipelines_tenant` ON `pipelines`(`tenant_key`);

-- Pipeline Stages
ALTER TABLE `pipeline_stages` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_pipeline_stages_tenant` ON `pipeline_stages`(`tenant_key`);

-- Customer Journey
ALTER TABLE `customer_journey` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_journey_tenant` ON `customer_journey`(`tenant_key`);

-- Customer Tags
ALTER TABLE `customer_tags` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_tags_tenant` ON `customer_tags`(`tenant_key`);

-- Deal Products
ALTER TABLE `deal_products` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_deal_products_tenant` ON `deal_products`(`tenant_key`);

-- Activity Log
ALTER TABLE `activity_log` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_activity_log_tenant` ON `activity_log`(`tenant_key`);

-- Alerts
ALTER TABLE `alerts` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_alerts_tenant` ON `alerts`(`tenant_key`);

-- Chat Groups
ALTER TABLE `chat_groups` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_groups_tenant` ON `chat_groups`(`tenant_key`);

-- Chat Group Members
ALTER TABLE `chat_group_members` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_group_members_tenant` ON `chat_group_members`(`tenant_key`);

-- Companies
ALTER TABLE `companies` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_companies_tenant` ON `companies`(`tenant_key`);

-- Interactions
ALTER TABLE `interactions` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_interactions_tenant` ON `interactions`(`tenant_key`);

-- Feedback Forms
ALTER TABLE `feedback_forms` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_forms_tenant` ON `feedback_forms`(`tenant_key`);

-- Document Categories
ALTER TABLE `document_categories` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_categories_tenant` ON `document_categories`(`tenant_key`);

-- Document Tags
ALTER TABLE `document_tags` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_tags_tenant` ON `document_tags`(`tenant_key`);

-- Event Attendees
ALTER TABLE `event_attendees` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_event_attendees_tenant` ON `event_attendees`(`tenant_key`);

-- Customer Health
ALTER TABLE `customer_health` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_health_tenant` ON `customer_health`(`tenant_key`);

-- Customer Current Stage
ALTER TABLE `customer_current_stage` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_current_stage_tenant` ON `customer_current_stage`(`tenant_key`);

-- Customer Pipeline Progress
ALTER TABLE `customer_pipeline_progress` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_pipeline_progress_tenant` ON `customer_pipeline_progress`(`tenant_key`);

-- Deal Stage History
ALTER TABLE `deal_stage_history` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_deal_stage_history_tenant` ON `deal_stage_history`(`tenant_key`);

-- Document Permissions
ALTER TABLE `document_permissions` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_permissions_tenant` ON `document_permissions`(`tenant_key`);

-- Document Comments
ALTER TABLE `document_comments` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_comments_tenant` ON `document_comments`(`tenant_key`);

-- Document Shares
ALTER TABLE `document_shares` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_shares_tenant` ON `document_shares`(`tenant_key`);

-- Document Activity Log
ALTER TABLE `document_activity_log` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_activity_log_tenant` ON `document_activity_log`(`tenant_key`);

-- Interaction Attachments
ALTER TABLE `interaction_attachments` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_interaction_attachments_tenant` ON `interaction_attachments`(`tenant_key`);

-- Interaction Follow Ups
ALTER TABLE `interaction_follow_ups` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_interaction_follow_ups_tenant` ON `interaction_follow_ups`(`tenant_key`);

-- Interaction Tags
ALTER TABLE `interaction_tags` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_interaction_tags_tenant` ON `interaction_tags`(`tenant_key`);

-- Contact Activities
ALTER TABLE `contact_activities` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_contact_activities_tenant` ON `contact_activities`(`tenant_key`);

-- Chat Reactions
ALTER TABLE `chat_reactions` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_chat_reactions_tenant` ON `chat_reactions`(`tenant_key`);

-- Event Reminders
ALTER TABLE `event_reminders` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_event_reminders_tenant` ON `event_reminders`(`tenant_key`);

-- Feedback Form Questions
ALTER TABLE `feedback_form_questions` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_form_questions_tenant` ON `feedback_form_questions`(`tenant_key`);

-- Feedback Form Submissions
ALTER TABLE `feedback_form_submissions` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_form_submissions_tenant` ON `feedback_form_submissions`(`tenant_key`);

-- Feedback Form Responses
ALTER TABLE `feedback_form_responses` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_form_responses_tenant` ON `feedback_form_responses`(`tenant_key`);

-- Document Tag Relations
ALTER TABLE `document_tag_relations` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_document_tag_relations_tenant` ON `document_tag_relations`(`tenant_key`);

-- Event Participants
ALTER TABLE `event_participants` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_event_participants_tenant` ON `event_participants`(`tenant_key`);

-- Customer Journey Stages
ALTER TABLE `customer_journey_stages` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_customer_journey_stages_tenant` ON `customer_journey_stages`(`tenant_key`);

-- Feedback Responses
ALTER TABLE `feedback_responses` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_feedback_responses_tenant` ON `feedback_responses`(`tenant_key`);

-- Interaction Summary
ALTER TABLE `interaction_summary` ADD COLUMN `tenant_key` VARCHAR(100) DEFAULT 'rabin' AFTER `id`;
CREATE INDEX `idx_interaction_summary_tenant` ON `interaction_summary`(`tenant_key`);
