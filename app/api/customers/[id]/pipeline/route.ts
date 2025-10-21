import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { hasPermission } from '@/lib/auth';

// GET /api/customers/[id]/pipeline - دریافت وضعیت فرآیند فروش مشتری
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userRole = req.headers.get('x-user-role');
        const userId = req.headers.get('x-user-id');
        const { id: customerId } = await params;

        // بررسی دسترسی
        const [customer] = await executeQuery(`
            SELECT * FROM customers WHERE id = ?
        `, [customerId]);

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'مشتری یافت نشد' },
                { status: 404 }
            );
        }

        if (!hasPermission(userRole || '', ['ceo', 'sales_manager']) && customer.assigned_to !== userId) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 403 }
            );
        }

        // دریافت تمام مراحل فرآیند فروش
        const stages = await executeQuery(`
            SELECT * FROM pipeline_stages 
            WHERE is_active = 1 
            ORDER BY stage_order ASC
        `);

        // دریافت مرحله فعلی مشتری
        const [currentStage] = await executeQuery(`
            SELECT ccs.*, ps.name as stage_name, ps.code as stage_code, ps.stage_order
            FROM customer_current_stage ccs
            JOIN pipeline_stages ps ON ccs.current_stage_id = ps.id
            WHERE ccs.customer_id = ?
        `, [customerId]);

        // دریافت پیشرفت مشتری در هر مرحله
        const progress = await executeQuery(`
            SELECT cpp.*, ps.name as stage_name, ps.code as stage_code, ps.stage_order,
                   u.name as completed_by_name
            FROM customer_pipeline_progress cpp
            JOIN pipeline_stages ps ON cpp.stage_id = ps.id
            LEFT JOIN users u ON cpp.completed_by = u.id
            WHERE cpp.customer_id = ?
            ORDER BY ps.stage_order ASC
        `, [customerId]);

        // ترکیب اطلاعات
        const stagesWithProgress = stages.map(stage => {
            const stageProgress = progress.find(p => p.stage_id === stage.id);
            return {
                ...stage,
                isCompleted: stageProgress?.is_completed || false,
                completedAt: stageProgress?.completed_at || null,
                completedBy: stageProgress?.completed_by_name || null,
                notes: stageProgress?.notes || null,
                isCurrent: currentStage?.current_stage_id === stage.id
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                customerId,
                currentStage: currentStage || null,
                stages: stagesWithProgress,
                overallProgress: Math.round((progress.filter(p => p.is_completed).length / stages.length) * 100)
            }
        });

    } catch (error) {
        console.error('Get pipeline API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت فرآیند فروش' },
            { status: 500 }
        );
    }
}

// PUT /api/customers/[id]/pipeline - به‌روزرسانی مرحله فرآیند فروش
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userRole = req.headers.get('x-user-role');
        const userId = req.headers.get('x-user-id');
        const { id: customerId } = await params;
        const body = await req.json();
        const { stageId, action, notes } = body; // action: 'complete' | 'uncomplete' | 'set_current'

        // بررسی دسترسی
        const [customer] = await executeQuery(`
            SELECT * FROM customers WHERE id = ?
        `, [customerId]);

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'مشتری یافت نشد' },
                { status: 404 }
            );
        }

        if (!hasPermission(userRole || '', ['ceo', 'sales_manager']) && customer.assigned_to !== userId) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 403 }
            );
        }

        // دریافت اطلاعات مرحله
        const [stage] = await executeQuery(`
            SELECT * FROM pipeline_stages WHERE id = ?
        `, [stageId]);

        if (!stage) {
            return NextResponse.json(
                { success: false, message: 'مرحله یافت نشد' },
                { status: 404 }
            );
        }

        if (action === 'complete') {
            // تکمیل مرحله
            await executeSingle(`
                INSERT INTO customer_pipeline_progress 
                (customer_id, stage_id, is_completed, completed_at, completed_by, notes)
                VALUES (?, ?, TRUE, NOW(), ?, ?)
                ON DUPLICATE KEY UPDATE
                is_completed = TRUE,
                completed_at = NOW(),
                completed_by = ?,
                notes = ?,
                updated_at = NOW()
            `, [customerId, stageId, userId, notes, userId, notes]);

            // اگر این مرحله فعلی نیست، آن را به عنوان مرحله فعلی تنظیم کن
            const [currentStage] = await executeQuery(`
                SELECT ccs.*, ps.stage_order
                FROM customer_current_stage ccs
                JOIN pipeline_stages ps ON ccs.current_stage_id = ps.id
                WHERE ccs.customer_id = ?
            `, [customerId]);

            if (!currentStage || stage.stage_order > currentStage.stage_order) {
                await executeSingle(`
                    INSERT INTO customer_current_stage (customer_id, current_stage_id)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE
                    current_stage_id = ?,
                    updated_at = NOW()
                `, [customerId, stageId, stageId]);
            }

        } else if (action === 'uncomplete') {
            // لغو تکمیل مرحله
            await executeSingle(`
                UPDATE customer_pipeline_progress 
                SET is_completed = FALSE, completed_at = NULL, completed_by = NULL
                WHERE customer_id = ? AND stage_id = ?
            `, [customerId, stageId]);

        } else if (action === 'set_current') {
            // تنظیم به عنوان مرحله فعلی
            await executeSingle(`
                INSERT INTO customer_current_stage (customer_id, current_stage_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE
                current_stage_id = ?,
                updated_at = NOW()
            `, [customerId, stageId, stageId]);
        }

        // به‌روزرسانی تاریخ آخرین تعامل مشتری
        await executeSingle(`
            UPDATE customers 
            SET last_interaction = NOW(), updated_at = NOW()
            WHERE id = ?
        `, [customerId]);

        return NextResponse.json({
            success: true,
            message: 'فرآیند فروش با موفقیت به‌روزرسانی شد'
        });

    } catch (error) {
        console.error('Update pipeline API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در به‌روزرسانی فرآیند فروش' },
            { status: 500 }
        );
    }
}