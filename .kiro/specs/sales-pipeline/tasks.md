# Implementation Plan: Sales Pipeline System

## Overview

این پلان پیاده‌سازی سیستم پیگیری فروش را در چهار مرحله اصلی انجام می‌دهد: تغییرات دیتابیس، ایجاد API ها، توسعه رابط کاربری، و ادغام با ماژول‌های موجود. هر مرحله بر روی مرحله قبلی ساخته می‌شود و در نهایت همه بخش‌ها به هم متصل می‌شوند.

## Tasks

- [x] 1. Database Schema Setup and Migration
  - Create database migration for customers table modifications
  - Add pipeline_stages table with default stages
  - Add lead_pipeline_history table for tracking stage changes
  - Update existing customer records with default values
  - _Requirements: 1.1, 2.1, 2.4_

- [ ]* 1.1 Write property test for database schema validation
  - **Property 1: Customer Type Field Validation**
  - **Validates: Requirements 1.1**

- [x] 2. Core Pipeline Data Models and Types
  - [x] 2.1 Create TypeScript interfaces for Lead, PipelineStage, and related types
    - Define Lead interface extending Customer with pipeline fields
    - Create PipelineStage interface with stage configuration
    - Add PipelineHistoryEntry interface for stage tracking
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.2 Write property test for data model validation
    - **Property 9: Success Probability Validation**
    - **Validates: Requirements 3.2**

  - [x] 2.3 Implement Lead Temperature Calculation Service
    - Create calculateLeadTemperature function with business logic
    - Implement automatic temperature update triggers
    - Add temperature calculation based on interaction dates and probabilities
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.4 Write property tests for temperature calculation
    - **Property 10: Temperature Calculation - Hot Leads**
    - **Property 11: Temperature Calculation - Cold Leads**
    - **Property 12: Temperature Auto-Update**
    - **Validates: Requirements 4.1, 4.3, 4.4**

- [ ] 3. Sales Pipeline API Development
  - [x] 3.1 Create sales pipeline API routes
    - Implement GET /api/[tenant_key]/sales-pipeline for pipeline data
    - Create PUT /api/[tenant_key]/sales-pipeline/lead/[id]/stage for stage updates
    - Add GET /api/[tenant_key]/sales-pipeline/lead/[id]/details for lead details
    - Implement POST /api/[tenant_key]/sales-pipeline/lead/[id]/convert for lead conversion
    - _Requirements: 2.5, 6.3, 8.1, 9.3_

  - [ ]* 3.2 Write property test for stage change API
    - **Property 15: Drag and Drop Stage Update**
    - **Validates: Requirements 6.3**

  - [x] 3.3 Implement lead automation services
    - Create follow-up alert generation system
    - Implement automatic task creation on stage changes
    - Add automatic lead to customer conversion logic
    - Create activity logging for stage changes
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 3.4 Write property tests for automation services
    - **Property 17: Follow-up Alert Generation**
    - **Property 18: Stage Change Task Creation**
    - **Property 19: Closed Won Conversion**
    - **Property 21: Activity Logging**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**

- [-] 4. Permission System Integration
  - [x] 4.1 Register sales pipeline module in permissions system
    - Add 'sales_pipeline' module to permissions configuration
    - Set default permissions for ceo, sales_manager, and sales_specialist roles
    - Implement permission checking middleware for API routes
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 4.2 Write property test for permission system
    - **Property 22: Permission-based Access Control**
    - **Validates: Requirements 10.4**

- [ ] 5. Checkpoint - Ensure backend functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Sales Pipeline Page Component Development
  - [x] 6.1 Create main sales pipeline page component
    - Implement SalesPipelinePage component with tenant routing
    - Add view switching between Kanban and List views
    - Create filtering and search functionality
    - Add new lead creation capability
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 6.2 Write property test for page component
    - **Property 13: Kanban Stage Display**
    - **Validates: Requirements 6.1**

  - [x] 6.3 Implement Kanban View Component
    - Create KanbanView component with drag and drop functionality
    - Implement LeadCard component with all required information display
    - Add stage columns with lead count indicators
    - Implement drag and drop handlers for stage changes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 6.4 Write property tests for Kanban functionality
    - **Property 14: Lead Card Placement**
    - **Validates: Requirements 6.2**

  - [x] 6.5 Implement List View Component
    - Create tabular display with sortable columns
    - Add filtering capabilities by stage, temperature, owner, and date ranges
    - Implement bulk actions for selected leads
    - Add export functionality for lead data
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 6.6 Write property test for list view functionality
    - **Property 5: Type-based Filtering**
    - **Validates: Requirements 1.5**

- [x] 7. Lead Details and Integration Components
  - [x] 7.1 Create Lead Details Modal/Page
    - Implement lead details display with customer profile integration
    - Add tabs for Activities Timeline, Tasks, and Documents
    - Create stage change interface with reason tracking
    - Implement quick action buttons for common operations
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.2 Write property test for module integration
    - **Property 16: Module Integration Consistency**
    - **Validates: Requirements 8.5**

  - [x] 7.3 Integrate with existing modules
    - Connect with Activities module for timeline display
    - Integrate with Tasks module for lead task management
    - Link with Documents module for file management
    - Ensure data consistency across all modules
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Sidebar Navigation and Menu Integration
  - [x] 8.1 Add sales pipeline menu item to sidebar
    - Update dashboard-sidebar.tsx to include sales pipeline link
    - Implement permission-based menu visibility
    - Add proper routing to sales pipeline page
    - _Requirements: 5.1, 10.5_

  - [ ]* 8.2 Write property test for menu visibility
    - **Property 23: Menu Visibility Control**
    - **Validates: Requirements 10.5**

- [x] 9. Customer Module Enhancement
  - [x] 9.1 Update customer list to display lead/customer type
    - Modify customer list component to show type field
    - Add filtering capability by customer type
    - Update customer creation to default to 'lead' type
    - _Requirements: 1.2, 1.4, 1.5_

  - [ ]* 9.2 Write property tests for customer type functionality
    - **Property 2: Default Lead Type Assignment**
    - **Property 4: Customer Type Display**
    - **Validates: Requirements 1.2, 1.4**

- [x] 10. Automation and Alert System
  - [x] 10.1 Implement follow-up alert system
    - Create background job for checking overdue leads
    - Implement alert notification system
    - Add alert display in dashboard
    - Create alert management interface
    - _Requirements: 9.1_

  - [x] 10.2 Implement stage change automation
    - Add automatic task creation on stage changes
    - Implement loss reason requirement for closed_lost leads
    - Create automatic lead to customer conversion
    - Add activity logging for all stage changes
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

  - [ ]* 10.3 Write property test for loss reason requirement
    - **Property 20: Loss Reason Requirement**
    - **Validates: Requirements 9.4**

- [-] 11. Error Handling and Validation
  - [ ] 11.1 Implement comprehensive error handling
    - Add database error handling for all operations
    - Implement validation for lead data inputs
    - Create user-friendly error messages
    - Add error logging and monitoring
    - _Requirements: All requirements (error handling)_

  - [ ]* 11.2 Write unit tests for error handling
    - Test validation error scenarios
    - Test database constraint violations
    - Test permission denied scenarios

- [ ] 12. Final Integration and Testing
  - [ ] 12.1 Wire all components together
    - Connect frontend components with API endpoints
    - Ensure proper data flow between all modules
    - Test complete user workflows
    - Verify permission system integration
    - _Requirements: All requirements_

  - [ ]* 12.2 Write integration tests
    - Test complete lead lifecycle workflows
    - Test cross-module data consistency
    - Test permission system integration

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests ensure all components work together properly