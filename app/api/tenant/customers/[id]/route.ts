import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;

    try {
        const tenantKey = request.headers.get('X-Tenant-Key');

        if (!tenantKey) {
            return NextResponse.json(
                { success: false, message: 'Tenant key یافت نشد' },
                { status: 400 }
            );
        }

        const session = getTenantSessionFromRequest(request, tenantKey);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 401 }
            );
        }

        const customerId = params.id;
        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        try {
            // دریافت مشتری
            const [customers] = await connection.query(
                'SELECT * FROM customers WHERE id = ? AND tenant_key = ?',
                [customerId, tenantKey]
            ) as any[];

            if (!customers || customers.length === 0) {
                return NextResponse.json(
                    { success: false, message: 'مشتری یافت نشد' },
                    { status: 404 }
                );
            }

            const customer = customers[0];

            // دریافت فعالیت‌های مشتری
            const [activities] = await connection.query(
                'SELECT id, type, title, description, performed_by as performed_by_name, created_at, outcome FROM activities WHERE customer_id = ? AND tenant_key = ? ORDER BY created_at DESC LIMIT 10',
                [customerId, tenantKey]
            ) as any[];

            // دریافت مخاطبین مشتری
            const [contacts] = await connection.query(
                'SELECT id, first_name, last_name, email, phone, job_title, is_primary FROM contacts WHERE company_id = ? AND tenant_key = ? ORDER BY is_primary DESC',
                [customerId, tenantKey]
            ) as any[];

            // دریافت فروش‌های مشتری
            const [sales] = await connection.query(
                `SELECT 
          s.id, 
          s.total_amount, 
          s.payment_status, 
          s.sale_date, 
          s.invoice_number,
          u.name as sales_person_name
        FROM sales s 
        LEFT JOIN users u ON s.assigned_to = u.id
        WHERE s.customer_id = ? AND s.tenant_key = ? 
        ORDER BY s.sale_date DESC 
        LIMIT 10`,
                [customerId, tenantKey]
            ) as any[];

            return NextResponse.json({
                success: true,
                data: {
                    ...customer,
                    activities: activities || [],
                    contacts: contacts || [],
                    sales: sales || [],
                    total_deals: sales?.length || 0,
                    total_tickets: 0,
                    total_contacts: contacts?.length || 0
                }
            });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('❌ خطا در دریافت مشتری:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور' },
            { status: 500 }
        );
    }
}