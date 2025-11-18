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
        console.log('🔍 Customer Profile - Tenant Key:', tenantKey);

        if (!tenantKey) {
            console.log('❌ No tenant key provided');
            return NextResponse.json(
                { success: false, message: 'Tenant key یافت نشد' },
                { status: 400 }
            );
        }

        const session = getTenantSessionFromRequest(request, tenantKey);
        console.log('🔍 Session:', session ? 'Found' : 'Not found');
        
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'دسترسی غیرمجاز' },
                { status: 401 }
            );
        }

        const customerId = params.id;
        console.log('🔍 Customer ID:', customerId);
        
        const pool = await getTenantConnection(tenantKey);
        connection = await pool.getConnection();

        try {
            // دریافت مشتری
            const [customers] = await connection.query(
                'SELECT * FROM customers WHERE id = ?',
                [customerId]
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
                'SELECT id, type, title, description, performed_by as performed_by_name, created_at, outcome FROM activities WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10',
                [customerId]
            ) as any[];

            // دریافت مخاطبین مشتری
            const [contacts] = await connection.query(
                'SELECT id, first_name, last_name, email, phone, job_title, is_primary FROM contacts WHERE company_id = ? ORDER BY is_primary DESC',
                [customerId]
            ) as any[];

            // دریافت فروش‌های مشتری
            const [sales] = await connection.query(
                `SELECT 
          s.id, 
          s.total_amount, 
          s.payment_status, 
          s.sale_date, 
          s.invoice_number,
          s.sales_person_name
        FROM sales s 
        WHERE s.customer_id = ? 
        ORDER BY s.sale_date DESC 
        LIMIT 10`,
                [customerId]
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
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            { success: false, message: 'خطای سرور', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}