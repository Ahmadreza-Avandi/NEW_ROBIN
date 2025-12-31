# Requirements Document

## Introduction

سیستم پیگیری فروش (Sales Pipeline) یک لایه اتوماسیون و منطقی است که ماژول‌های موجود CRM را به هم متصل می‌کند تا فرآیند فروش را بهینه‌سازی و مدیریت کند. این سیستم به جای ایجاد ماژول مستقل جدید، از ماژول‌های موجود مانند مشتریان، فعالیت‌ها، وظایف و اسناد استفاده می‌کند.

## Glossary

- **Sales_Pipeline_System**: سیستم پیگیری فروش که فرآیند تبدیل سرنخ به مشتری را مدیریت می‌کند
- **Lead**: سرنخ فروش - مشتری بالقوه که هنوز خرید نکرده است
- **Customer**: مشتری واقعی که حداقل یک خرید انجام داده است
- **Pipeline_Stage**: مرحله‌ای از فرآیند فروش (سرنخ جدید، تماس اولیه، نیازسنجی، پیشنهاد، مذاکره، نتیجه)
- **Deal_Value**: مبلغ احتمالی معامله برای هر سرنخ
- **Success_Probability**: درصد احتمال موفقیت در بستن معامله
- **Lead_Temperature**: وضعیت هوشمند سرنخ (داغ، نیمه‌فعال، سرد)
- **Activities_Module**: ماژول موجود فعالیت‌ها که تایم‌لاین تعاملات را مدیریت می‌کند
- **Tasks_Module**: ماژول موجود وظایف که اقدامات فروش را مدیریت می‌کند
- **Documents_Module**: ماژول موجود اسناد که فایل‌های مربوط به فروش را ذخیره می‌کند

## Requirements

### Requirement 1: افزودن نوع مشتری

**User Story:** به عنوان کاربر فروش، می‌خواهم بتوانم مشتریان را به دو دسته Lead و Customer تقسیم کنم، تا بتوانم فرآیند فروش را بهتر مدیریت کنم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL add a type field to customers table with values 'lead' and 'customer'
2. WHEN a new customer is created, THE Sales_Pipeline_System SHALL set default type to 'lead'
3. WHEN a lead makes their first purchase, THE Sales_Pipeline_System SHALL automatically change type from 'lead' to 'customer'
4. THE Sales_Pipeline_System SHALL display customer type in the customers list interface
5. THE Sales_Pipeline_System SHALL provide filtering capability by customer type in the customers page

### Requirement 2: طراحی فرآیند فروش قابل تنظیم

**User Story:** به عنوان مدیر فروش، می‌خواهم فرآیند فروش قابل تنظیمی داشته باشم، تا بتوانم مراحل مختلف فروش را تعریف و مدیریت کنم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL support configurable pipeline stages including 'new_lead', 'contacted', 'needs_analysis', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'
2. WHEN a lead is created, THE Sales_Pipeline_System SHALL assign it to 'new_lead' stage by default
3. THE Sales_Pipeline_System SHALL track stage entry date for each pipeline stage
4. THE Sales_Pipeline_System SHALL maintain stage history for each lead showing all stage transitions
5. THE Sales_Pipeline_System SHALL allow manual stage progression by authorized users

### Requirement 3: مدیریت اطلاعات معامله

**User Story:** به عنوان کارشناس فروش، می‌خواهم برای هر سرنخ اطلاعات معامله شامل مبلغ احتمالی و درصد موفقیت را ثبت کنم، تا بتوانم پیش‌بینی درآمد داشته باشم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL store deal value for each lead
2. THE Sales_Pipeline_System SHALL store success probability percentage for each lead
3. THE Sales_Pipeline_System SHALL track assigned sales person for each lead
4. THE Sales_Pipeline_System SHALL record last follow-up date for each lead
5. THE Sales_Pipeline_System SHALL store next action date for each lead

### Requirement 4: محاسبه وضعیت هوشمند سرنخ

**User Story:** به عنوان مدیر فروش، می‌خواهم سیستم به صورت خودکار وضعیت سرنخ‌ها را محاسبه کند، تا بتوانم سرنخ‌های داغ و سرد را تشخیص دهم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL calculate lead temperature as 'hot' when recent interaction exists AND success probability is above 70%
2. THE Sales_Pipeline_System SHALL calculate lead temperature as 'warm' when moderate interaction exists OR success probability is between 30-70%
3. THE Sales_Pipeline_System SHALL calculate lead temperature as 'cold' when no follow-up has occurred for more than 3 days
4. THE Sales_Pipeline_System SHALL update lead temperature automatically when interactions or probabilities change
5. THE Sales_Pipeline_System SHALL display lead temperature with appropriate visual indicators

### Requirement 5: صفحه مرکز کنترل فروش

**User Story:** به عنوان کاربر فروش، می‌خواهم یک صفحه مرکزی داشته باشم که همه کارهای مربوط به فروش را از آنجا انجام دهم، تا کارایی بیشتری داشته باشم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL provide a dedicated sales pipeline page under customer management section
2. THE Sales_Pipeline_System SHALL display kanban view with columns for each pipeline stage
3. THE Sales_Pipeline_System SHALL display list view with lead information including stage, source, predicted value, success probability, owner, last interaction, and next action
4. THE Sales_Pipeline_System SHALL allow drag and drop functionality between pipeline stages in kanban view
5. THE Sales_Pipeline_System SHALL provide quick access to customer profile, activities timeline, tasks, and documents from pipeline interface

### Requirement 6: نمای کانبان فروش

**User Story:** به عنوان کارشناس فروش، می‌خواهم سرنخ‌ها را در نمای کانبان ببینم، تا بتوانم به راحتی آنها را بین مراحل مختلف جابجا کنم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL display pipeline stages as vertical columns in kanban view
2. THE Sales_Pipeline_System SHALL display leads as cards within appropriate stage columns
3. WHEN a lead card is dragged to a different stage, THE Sales_Pipeline_System SHALL update the lead's current stage
4. THE Sales_Pipeline_System SHALL display customer name, deal value, sales owner, last follow-up date, and temperature status on each card
5. THE Sales_Pipeline_System SHALL provide direct link to customer profile from each lead card

### Requirement 7: نمای لیستی سرنخ‌ها

**User Story:** به عنوان مدیر فروش، می‌خواهم سرنخ‌ها را در نمای لیستی با جزئیات کامل ببینم، تا بتوانم تحلیل بهتری از وضعیت فروش داشته باشم.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL display leads in tabular format with sortable columns
2. THE Sales_Pipeline_System SHALL show lead name, current stage, source, predicted value, success probability, assigned owner, last interaction date, and next action date
3. THE Sales_Pipeline_System SHALL provide filtering capabilities by stage, temperature, owner, and date ranges
4. THE Sales_Pipeline_System SHALL allow bulk actions on selected leads
5. THE Sales_Pipeline_System SHALL provide export functionality for lead data

### Requirement 8: ادغام با ماژول‌های موجود

**User Story:** به عنوان کاربر سیستم، می‌خواهم سیستم پیگیری فروش با ماژول‌های موجود یکپارچه باشد، تا نیازی به ورود مجدد اطلاعات نداشته باشم.

#### Acceptance Criteria

1. WHEN accessing lead details, THE Sales_Pipeline_System SHALL display customer profile from existing customer module
2. WHEN accessing lead timeline, THE Sales_Pipeline_System SHALL display interactions from existing Activities_Module
3. WHEN managing lead tasks, THE Sales_Pipeline_System SHALL use existing Tasks_Module functionality
4. WHEN accessing lead documents, THE Sales_Pipeline_System SHALL use existing Documents_Module
5. THE Sales_Pipeline_System SHALL maintain data consistency across all integrated modules

### Requirement 9: اتوماسیون‌های فروش

**User Story:** به عنوان مدیر فروش، می‌خواهم سیستم به صورت خودکار هشدارها و اقدامات لازم را انجام دهد، تا هیچ سرنخی فراموش نشود.

#### Acceptance Criteria

1. WHEN a lead has not been followed up for more than 3 days, THE Sales_Pipeline_System SHALL generate an alert
2. WHEN a lead stage is changed, THE Sales_Pipeline_System SHALL automatically create a follow-up task
3. WHEN a lead is marked as 'closed_won', THE Sales_Pipeline_System SHALL automatically change customer type from 'lead' to 'customer'
4. WHEN a lead is marked as 'closed_lost', THE Sales_Pipeline_System SHALL require entry of loss reason
5. THE Sales_Pipeline_System SHALL log all stage changes as activities in the Activities_Module

### Requirement 10: سیستم دسترسی و مجوزها

**User Story:** به عنوان مدیر سیستم، می‌خواهم دسترسی به صفحه پیگیری فروش قابل کنترل باشد، تا فقط کاربران مجاز بتوانند از آن استفاده کنند.

#### Acceptance Criteria

1. THE Sales_Pipeline_System SHALL register 'sales_pipeline' module in the permissions system
2. THE Sales_Pipeline_System SHALL grant access by default to 'ceo' and 'sales_manager' roles
3. THE Sales_Pipeline_System SHALL grant access by default to 'sales_specialist' role
4. THE Sales_Pipeline_System SHALL deny access to users without proper permissions
5. THE Sales_Pipeline_System SHALL display the sales pipeline menu item only for authorized users