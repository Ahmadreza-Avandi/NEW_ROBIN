import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getCurrentUser, hasModulePermission } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Import types
interface NotificationService {
  sendTaskAssignmentEmail: (email: string, name: string, taskData: any) => Promise<any>;
  sendTaskCompletionEmail: (email: string, name: string, taskData: any) => Promise<any>;
}

interface NotificationSystem {
  notifyTaskAssigned: (taskData: any, userId: string) => Promise<any>;
  notifyTaskCompleted: (taskData: any, userId: string) => Promise<any>;
}

// Import notification services
import notificationServiceModule from '@/lib/notification-service.js';
import notificationSystemModule from '@/lib/notification-system.js';

// Initialize services
const notificationService: NotificationService | undefined = notificationServiceModule;
const internalNotificationSystem: NotificationSystem | undefined = notificationSystemModule;

// GET /api/tasks - Get all tasks
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
        { status: 401 }
      );
    }

    const userId = user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get current user info
    const currentUsers = await executeQuery(`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE id = ? AND status = 'active'
    `, [userId]);

    if (currentUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const currentUser = currentUsers[0];
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const assigned_to = searchParams.get('assigned_to') || '';

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      whereClause += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assigned_to) {
      whereClause += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    // Check if user has tasks module permission
    const hasTasksPermission = await hasModulePermission(currentUser.id, 'tasks');
    const isManager = ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'].includes(currentUser.role);

    // If user doesn't have tasks permission and is not a manager, only show assigned tasks or created tasks
    if (!hasTasksPermission && !isManager) {
      whereClause += ' AND (t.assigned_to = ? OR t.assigned_by = ? OR EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?))';
      params.push(currentUser.id, currentUser.id, currentUser.id);
    }

    const finalQuery = `
      SELECT 
        t.*,
        c.name as customer_name,
        u1.name as assigned_to_name,
        u2.name as assigned_by_name
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.assigned_by = u2.id
      ${whereClause}
      ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
      LIMIT 100
    `;

    console.log('Executing tasks query with params:', params);
    console.log('Where clause:', whereClause);

    let tasks = [];
    try {
      tasks = await executeQuery(finalQuery, params);
      
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) {
        console.error('Tasks query returned non-array result:', tasks);
        tasks = [];
      }
    } catch (queryError) {
      console.error('Tasks query error:', queryError);
      // Return empty array instead of throwing
      tasks = [];
    }

    // Get files for each task
    for (let task of tasks) {
      try {
        const files = await executeQuery(`
          SELECT tf.*, u.name as uploaded_by_name
          FROM task_files tf
          LEFT JOIN users u ON tf.uploaded_by = u.id
          WHERE tf.task_id = ?
          ORDER BY tf.uploaded_at DESC
        `, [task.id]);
        task.files = files || [];
      } catch (fileError) {
        console.error(`Error fetching files for task ${task.id}:`, fileError);
        task.files = [];
      }
    }

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت وظایف' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
        { status: 401 }
      );
    }

    const userId = user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get current user info
    const currentUsers = await executeQuery(`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE id = ? AND status = 'active'
    `, [userId]);

    if (currentUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const currentUser = currentUsers[0];
    const body = await req.json();
    const {
      title, description, customer_id, deal_id, assigned_to,
      priority, category, due_date
    } = body;

    if (!title || !assigned_to || assigned_to.length === 0) {
      return NextResponse.json(
        { success: false, message: 'عنوان و حداقل یک فرد مسئول الزامی است' },
        { status: 400 }
      );
    }

    // Validate that all assigned users exist
    for (const userId of assigned_to) {
      if (!userId || userId.trim() === '') {
        return NextResponse.json(
          { success: false, message: 'شناسه کاربر نامعتبر است' },
          { status: 400 }
        );
      }

      const userExists = await executeQuery(`
        SELECT id FROM users WHERE id = ? AND status = 'active'
      `, [userId]);

      if (userExists.length === 0) {
        return NextResponse.json(
          { success: false, message: `کاربر با شناسه ${userId} یافت نشد` },
          { status: 400 }
        );
      }
    }

    // Check if user has permission to create tasks
    const hasTasksPermission = await hasModulePermission(currentUser.id, 'tasks');
    const isManager = ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'].includes(currentUser.role);

    if (!hasTasksPermission && !isManager) {
      return NextResponse.json(
        { success: false, message: 'شما مجوز ایجاد وظیفه ندارید' },
        { status: 403 }
      );
    }

    const taskId = uuidv4();

    // Convert due_date to MySQL format if provided
    let formattedDueDate = null;
    if (due_date) {
      const date = new Date(due_date);
      formattedDueDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Create the task
    await executeSingle(`
      INSERT INTO tasks (
        id, title, description, customer_id, deal_id, assigned_to,
        assigned_by, priority, category, status, due_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
    `, [
      taskId,
      title,
      description || null,
      customer_id || null,
      deal_id || null,
      assigned_to[0],
      currentUser.id,
      priority || 'medium',
      category || 'follow_up',
      formattedDueDate
    ]);

    // Add all assignees
    for (const userId of assigned_to) {
      await executeSingle(`
        INSERT INTO task_assignees (id, task_id, user_id, assigned_by)
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), taskId, userId, currentUser.id]);
    }

    // Send notification emails and internal notifications to assigned users (async, don't wait for them)
    for (const userId of assigned_to) {
      try {
        const assignedUsers = await executeQuery(`
          SELECT email, name FROM users WHERE id = ? AND status = 'active'
        `, [userId]);

        if (assignedUsers.length > 0) {
          const assignedUser = assignedUsers[0];
          const taskData = {
            id: taskId,
            title,
            description,
            priority: priority || 'medium',
            category: category || 'follow_up',
            due_date: formattedDueDate
          };

          // Send email notification
          if (notificationService && typeof notificationService.sendTaskAssignmentEmail === 'function') {
            notificationService.sendTaskAssignmentEmail(assignedUser.email, assignedUser.name, taskData)
              .then((emailResult: any) => {
                if (emailResult.success) {
                  console.log('✅ Task assignment email sent to:', assignedUser.email);
                } else {
                  console.log('⚠️ Task assignment email failed:', emailResult.error);
                }
              })
              .catch((error: any) => {
                console.error('❌ Task assignment email error:', error);
              });
          } else {
            console.log('⚠️ Notification service not available, skipping task assignment email');
          }

          // Send internal notification
          if (internalNotificationSystem && typeof internalNotificationSystem.notifyTaskAssigned === 'function') {
            internalNotificationSystem.notifyTaskAssigned(taskData, userId)
              .then((notifResult: any) => {
                if (notifResult.success) {
                  console.log('✅ Internal task notification sent to user:', userId);
                } else {
                  console.log('⚠️ Internal task notification failed:', notifResult.error);
                }
              })
              .catch((error: any) => {
                console.error('❌ Internal task notification error:', error);
              });
          } else {
            console.log('⚠️ Internal notification system not available, skipping internal notification');
          }
        }
      } catch (error) {
        console.error('❌ Error getting assigned user info:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'وظیفه با موفقیت ایجاد شد',
      data: { id: taskId }
    });
  } catch (error) {
    console.error('Create task API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد وظیفه' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - Update task status or completion
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است یا منقضی شده است' },
        { status: 401 }
      );
    }

    const userId = user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Get current user info
    const currentUsers = await executeQuery(`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE id = ? AND status = 'active'
    `, [userId]);

    if (currentUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const currentUser = currentUsers[0];
    const body = await req.json();
    const { taskId, status, completion_notes } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { success: false, message: 'شناسه وظیفه و وضعیت الزامی است' },
        { status: 400 }
      );
    }

    // Check if user has tasks permission or is assigned to this task or is a manager
    const hasTasksPermission = await hasModulePermission(currentUser.id, 'tasks');
    const isManager = ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'].includes(currentUser.role);

    if (!hasTasksPermission && !isManager) {
      // Check if user is assigned to this task (either in main assigned_to field or in task_assignees table)
      const assignedTask = await executeQuery(`
        SELECT t.id FROM tasks t 
        WHERE t.id = ? AND (
          t.assigned_to = ? OR 
          t.assigned_by = ? OR 
          EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)
        )
      `, [taskId, currentUser.id, currentUser.id, currentUser.id]);

      if (assignedTask.length === 0) {
        return NextResponse.json(
          { success: false, message: 'شما مجوز تغییر این وظیفه را ندارید' },
          { status: 403 }
        );
      }
    }

    // Update task status
    const updateFields = ['status = ?'];
    const updateParams = [status];

    if (status === 'completed') {
      updateFields.push('completed_at = NOW()');
      if (completion_notes) {
        updateFields.push('completion_notes = ?');
        updateParams.push(completion_notes);
      }

      // Send notification to CEO when task is completed
      try {
        // Get task details
        const taskDetails = await executeQuery(`
          SELECT t.*, u.name as assigned_to_name
          FROM tasks t
          LEFT JOIN users u ON t.assigned_to = u.id
          WHERE t.id = ?
        `, [taskId]);

        if (taskDetails.length > 0) {
          const taskData = {
            id: taskId,
            title: taskDetails[0].title,
            completed_by_name: currentUser.name,
            assigned_to_name: taskDetails[0].assigned_to_name
          };

          // Get CEO user ID
          const ceoUserId = process.env.CEO_USER_ID || 'ceo-001'; // This should be configured

          // Send notification to CEO
          if (internalNotificationSystem && typeof internalNotificationSystem.notifyTaskCompleted === 'function') {
            internalNotificationSystem.notifyTaskCompleted(taskData, ceoUserId)
              .then((notifResult: any) => {
                if (notifResult.success) {
                  console.log('✅ Task completion notification sent to CEO');
                } else {
                  console.log('⚠️ Task completion notification failed:', notifResult.error);
                }
              })
              .catch((error: any) => {
                console.error('❌ Task completion notification error:', error);
              });
          } else {
            console.log('⚠️ Internal notification system not available, skipping CEO notification');
          }

          // Send email notification to CEO
          const ceoUsers = await executeQuery(`
            SELECT email, name FROM users WHERE role = 'ceo' AND status = 'active'
          `);

          if (ceoUsers.length > 0) {
            const ceoUser = ceoUsers[0];
            if (notificationService && typeof notificationService.sendTaskCompletionEmail === 'function') {
              notificationService.sendTaskCompletionEmail(ceoUser.email, ceoUser.name, taskData)
                .then((emailResult: any) => {
                  if (emailResult.success) {
                    console.log('✅ Task completion email sent to CEO:', ceoUser.email);
                  } else {
                    console.log('⚠️ Task completion email failed:', emailResult.error);
                  }
                })
                .catch((error: any) => {
                  console.error('❌ Task completion email error:', error);
                });
            } else {
              console.log('⚠️ Notification service not available, skipping task completion email');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error sending task completion notification:', error);
        // Don't fail the task update if notification fails
      }
    }

    updateParams.push(taskId);

    await executeSingle(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateParams);

    return NextResponse.json({
      success: true,
      message: status === 'completed' ? 'وظیفه با موفقیت تکمیل شد' : 'وضعیت وظیفه به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Update task API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی وظیفه' },
      { status: 500 }
    );
  }
}