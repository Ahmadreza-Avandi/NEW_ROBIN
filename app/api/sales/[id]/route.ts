import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/database';
import { getAuthUser } from '@/lib/auth-helper';

// PATCH /api/sales/[id] - Update sale status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const { id: saleId } = await params;
        const body = await req.json();

        // Validate sale exists
        const [sale] = await executeQuery('SELECT * FROM sales WHERE id = ?', [saleId]);
        if (!sale) {
            return NextResponse.json({
                success: false,
                message: 'فروش یافت نشد'
            }, { status: 404 });
        }

        // Check permission - only sales person or managers can update
        if (!['ceo', 'sales_manager'].includes(user.role) && sale.sales_person_id !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'شما مجاز به ویرایش این فروش نیستید'
            }, { status: 403 });
        }

        // Update allowed fields
        const allowedFields = ['payment_status', 'payment_method', 'notes', 'total_amount'];
        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        }

        if (updateFields.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'هیچ فیلد قابل بروزرسانی ارسال نشده'
            }, { status: 400 });
        }

        // Add updated_at
        updateFields.push('updated_at = NOW()');
        updateValues.push(saleId);

        // Update sale
        await executeQuery(
            `UPDATE sales SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        return NextResponse.json({
            success: true,
            message: 'فروش با موفقیت بروزرسانی شد'
        });

    } catch (error) {
        console.error('Update sale API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در بروزرسانی فروش' },
            { status: 500 }
        );
    }
}

// GET /api/sales/[id] - Get sale details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const { id: saleId } = await params;

        // Get sale details
        const [sale] = await executeQuery(`
            SELECT 
                s.*,
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.id = ?
        `, [saleId]);

        if (!sale) {
            return NextResponse.json({
                success: false,
                message: 'فروش یافت نشد'
            }, { status: 404 });
        }

        // Check permission
        if (!['ceo', 'sales_manager'].includes(user.role) && sale.sales_person_id !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'شما مجاز به مشاهده این فروش نیستید'
            }, { status: 403 });
        }

        // Get sale items
        const items = await executeQuery(`
            SELECT
                id,
                product_id,
                product_name,
                quantity,
                unit_price,
                discount_percentage,
                total_price
            FROM sale_items
            WHERE sale_id = ?
        `, [saleId]);

        return NextResponse.json({
            success: true,
            data: {
                ...sale,
                items: items || []
            }
        });

    } catch (error) {
        console.error('Get sale details API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت جزئیات فروش' },
            { status: 500 }
        );
    }
}