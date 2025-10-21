# Permissions System Update

## Overview
Updated the CRM system's permission handling to use dynamic module-based access from the `user_modules` table instead of hardcoded role checks in data APIs. This ensures users who see sidebar routes (based on granted modules) can access the corresponding data without 403 errors.

## Key Changes
- **lib/auth.ts**: Added `hasModulePermission(userId, moduleName)` to query `modules` and `user_modules` for granted status. Added `getUserModules(userId)` for listing granted modules. Basic logging included for errors.

- **app/api/users/route.ts**: 
  - GET: Replaced role check ('ceo'/'sales_manager') with `hasModulePermission(user.id, 'coworkers')`.
  - POST/PUT/DELETE: Retained strict role checks (ceo/sales_manager) for create/update/delete users.

- **app/api/documents/route.ts and sub-routes** ([id]/route.ts, [id]/share/route.ts, [id]/send-email/route.ts, categories/route.ts):
  - Added `hasModulePermission(user.id, 'documents')` check after user auth in all handlers.
  - Retained existing owner/ceo and document_permissions checks for specific actions (view/edit/delete/share).

- **app/api/reports/route.ts**:
  - Added `hasModulePermission(currentUser.id, 'reports')` in GET and POST.
  - Replaced `isManager` role check in GET with module permission for filtering reports.
  - Retained 'ceo'/'مدیر' check in POST to prevent managers from submitting reports.

- **app/api/user-permissions/route.ts**:
  - Added `hasModulePermission(user.id, 'settings')` for accessing the API.
  - Retained 'ceo' role requirement for POST/PUT (updating permissions).

- **Other Routes**: No hardcoded role checks found in activities/route.ts or customer-club routes.

## Module Mappings
- 'coworkers' → /api/users (list users)
- 'documents' → All document APIs (list, get, edit, share, email, categories)
- 'reports' → /api/reports (daily reports)
- 'settings' → /api/user-permissions (manage permissions)

## Notes
- Page access via middleware.ts remains role-based for security; sidebar visibility uses modules.
- Sensitive admin actions (e.g., user create/delete, permission updates) still require 'ceo' role.
- Test: Assign 'coworkers' module to an agent; verify /api/users GET succeeds without 403. Similar for 'documents' and 'reports'.
- If issues arise, check module names in `modules` table and grants in `user_modules`.

Updated on: 2025-09-16 


