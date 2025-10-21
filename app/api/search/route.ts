import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const userRole = req.headers.get('x-user-role');
        const userId = req.headers.get('x-user-id');
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                success: false,
                message: 'حداقل 2 کاراکتر برای جستجو وارد کنید'
            }, { status: 400 });
        }

        const searchTerm = `%${query.trim()}%`;
        const results: any[] = [];

        // Search in customers
        if (hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'sales_agent', 'کارشناس فروش'])) {
            const customers = await executeQuery(`
        SELECT 
          id, name, email, phone, company, created_at,
          'customer' as type
        FROM customers 
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?
        LIMIT 10
      `, [searchTerm, searchTerm, searchTerm, searchTerm]);

            customers.forEach(customer => {
                results.push({
                    id: customer.id,
                    type: 'customer',
                    title: customer.name,
                    subtitle: customer.company,
                    description: customer.email,
                    metadata: {
                        phone: customer.phone,
                        email: customer.email
                    },
                    created_at: customer.created_at
                });
            });
        }

        // Search in sales
        if (hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'sales_agent', 'کارشناس فروش'])) {
            let salesQuery = `
        SELECT 
          s.id, s.customer_name, s.total_amount, s.currency, s.invoice_number, 
          s.payment_status, s.created_at, 'sale' as type
        FROM sales s
        WHERE s.customer_name LIKE ? OR s.invoice_number LIKE ?
      `;
            const salesParams = [searchTerm, searchTerm];

            // If not admin, only show own sales
            if (!hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'])) {
                salesQuery += ' AND s.sales_person_id = ?';
                salesParams.push(userId || '');
            }

            salesQuery += ' LIMIT 10';

            const sales = await executeQuery(salesQuery, salesParams);

            sales.forEach(sale => {
                const amount = typeof sale.total_amount === 'string' ? parseFloat(sale.total_amount) : sale.total_amount;
                const formattedAmount = amount >= 1000000
                    ? `${(amount / 1000000).toFixed(1)} میلیون تومان`
                    : `${amount.toLocaleString('fa-IR')} تومان`;

                results.push({
                    id: sale.id,
                    type: 'sale',
                    title: `فروش به ${sale.customer_name}`,
                    subtitle: sale.invoice_number ? `فاکتور: ${sale.invoice_number}` : undefined,
                    description: `وضعیت: ${getPaymentStatusLabel(sale.payment_status)}`,
                    metadata: {
                        amount: formattedAmount
                    },
                    created_at: sale.created_at
                });
            });
        }

        // Search in feedback
        if (hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'support', 'پشتیبانی'])) {
            const feedback = await executeQuery(`
        SELECT 
          f.id, f.customer_name, f.rating, f.comment, f.created_at,
          'feedback' as type
        FROM feedback f
        WHERE f.customer_name LIKE ? OR f.comment LIKE ?
        LIMIT 10
      `, [searchTerm, searchTerm]);

            feedback.forEach(fb => {
                results.push({
                    id: fb.id,
                    type: 'feedback',
                    title: `بازخورد از ${fb.customer_name}`,
                    subtitle: fb.rating ? `امتیاز: ${fb.rating}/5` : undefined,
                    description: fb.comment ? fb.comment.substring(0, 100) + (fb.comment.length > 100 ? '...' : '') : undefined,
                    created_at: fb.created_at
                });
            });
        }

        // Search in deals
        if (hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'sales_agent', 'کارشناس فروش'])) {
            let dealsQuery = `
        SELECT 
          d.id, d.title, d.customer_name, d.total_value, d.currency, 
          ps.name as stage_name, d.created_at, 'deal' as type
        FROM deals d
        LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id
        WHERE d.title LIKE ? OR d.customer_name LIKE ?
      `;
            const dealsParams = [searchTerm, searchTerm];

            // If not admin, only show own deals
            if (!hasPermission(userRole || '', ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش'])) {
                dealsQuery += ' AND d.assigned_to = ?';
                dealsParams.push(userId || '');
            }

            dealsQuery += ' LIMIT 10';

            const deals = await executeQuery(dealsQuery, dealsParams);

            deals.forEach(deal => {
                const amount = typeof deal.total_value === 'string' ? parseFloat(deal.total_value) : deal.total_value;
                const formattedAmount = amount >= 1000000
                    ? `${(amount / 1000000).toFixed(1)} میلیون تومان`
                    : `${amount.toLocaleString('fa-IR')} تومان`;

                results.push({
                    id: deal.id,
                    type: 'deal',
                    title: deal.title,
                    subtitle: deal.customer_name,
                    description: deal.stage_name ? `مرحله: ${deal.stage_name}` : undefined,
                    metadata: {
                        amount: formattedAmount
                    },
                    created_at: deal.created_at
                });
            });
        }

        // Sort results by relevance and date
        results.sort((a, b) => {
            // First sort by how well the title matches
            const aMatch = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
            const bMatch = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;

            if (aMatch !== bMatch) {
                return bMatch - aMatch;
            }

            // Then sort by date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return NextResponse.json({
            success: true,
            results: results.slice(0, 50), // Limit to 50 results
            query
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در جستجو' },
            { status: 500 }
        );
    }
}

function getPaymentStatusLabel(status: string): string {
    switch (status) {
        case 'pending': return 'در انتظار';
        case 'partial': return 'پرداخت جزئی';
        case 'paid': return 'پرداخت شده';
        case 'refunded': return 'بازگشت داده شده';
        default: return status;
    }
}