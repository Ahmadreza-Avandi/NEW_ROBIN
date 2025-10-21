import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/database';
import { getAuthUser } from '@/lib/auth-helper';
import { v4 as uuidv4 } from 'uuid';

// GET /api/sales - Get all sales records
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const paymentStatus = searchParams.get('payment_status');
        const customerId = searchParams.get('customer_id');

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        // Add date filters
        if (startDate) {
            whereClause += ' AND DATE(s.sale_date) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND DATE(s.sale_date) <= ?';
            params.push(endDate);
        }
        if (paymentStatus) {
            whereClause += ' AND s.payment_status = ?';
            params.push(paymentStatus);
        }
        if (customerId) {
            whereClause += ' AND s.customer_id = ?';
            params.push(customerId);
        }

        // Users with 'ceo' role can see all sales, others only see their own
        if (user.role !== 'ceo') {
          whereClause += ' AND s.sales_person_id = ?';
          params.push(user.id);
        }

        // Execute query with proper error handling
        console.log('Executing sales query with params:', params);
        console.log('Where clause:', whereClause);
        
        let sales = [];
        try {
            sales = await executeQuery(`
                SELECT 
                    s.id,
                    s.customer_name,
                    s.total_amount,
                    s.payment_status,
                    s.sale_date,
                    s.created_at,
                    s.invoice_number,
                    s.sales_person_name
                FROM sales s
                ${whereClause}
                ORDER BY s.created_at DESC
                LIMIT 100
            `, params);
            console.log('Sales query result:', sales ? sales.length : 'null/undefined', 'records');
        } catch (queryError) {
            console.error('Sales query error:', queryError);
            // Return empty array instead of throwing
            sales = [];
        }

        // Get sale items for each sale
        let salesWithItems = [];
        
        if (sales && Array.isArray(sales) && sales.length > 0) {
            salesWithItems = await Promise.all(
                sales.map(async (sale: any) => {
                    try {
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
                        `, [sale.id]);

                        return {
                            ...sale,
                            items: items || []
                        };
                    } catch (error) {
                        console.error(`Error fetching items for sale ${sale.id}:`, error);
                        return {
                            ...sale,
                            items: []
                        };
                    }
                })
            );
        }

        console.log(`Returning ${salesWithItems.length} sales with items`);

        return NextResponse.json({
            success: true,
            data: {
                sales: salesWithItems || []
            }
        });

    } catch (error) {
        console.error('Get sales API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در دریافت فروش‌ها' },
            { status: 500 }
        );
    }
}

// POST /api/sales - Create new sale record
export async function POST(req: NextRequest) {
    console.log('🔄 POST /api/sales - Starting request');
    try {
        // Get authenticated user
        const user = await getAuthUser(req);
        console.log('👤 User authentication result:', user ? 'Authenticated' : 'Not authenticated');

        if (!user) {
            console.log('❌ Authentication failed - returning 401');
            return NextResponse.json({
                success: false,
                message: 'لطفا وارد حساب کاربری خود شوید'
            }, { status: 401 });
        }

        // Get user info
        const [userInfo] = await executeQuery('SELECT name FROM users WHERE id = ?', [user.id]);
        const userName = userInfo?.name || 'نامشخص';

        // Get request body
        const body = await req.json();
        console.log('Sale request body:', body);

        // Validate required fields
        if (!body.customer_id) {
            console.log('❌ Missing customer_id');
            return NextResponse.json({
                success: false,
                message: 'لطفاً مشتری را انتخاب کنید'
            }, { status: 400 });
        }
        
        if (!body.items || body.items.length === 0) {
            console.log('❌ No items provided');
            return NextResponse.json({
                success: false,
                message: 'لطفاً حداقل یک محصول انتخاب کنید'
            }, { status: 400 });
        }
        
        // Validate each item
        for (let i = 0; i < body.items.length; i++) {
            const item = body.items[i];
            console.log(`Validating item ${i}:`, item);
            
            if (!item.product_id) {
                console.log(`❌ Item ${i} missing product_id`);
                return NextResponse.json({
                    success: false,
                    message: `محصول ${i + 1}: لطفاً محصول را انتخاب کنید`
                }, { status: 400 });
            }
            
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                console.log(`❌ Item ${i} has invalid quantity: ${item.quantity}`);
                return NextResponse.json({
                    success: false,
                    message: `محصول ${i + 1}: تعداد باید بیشتر از صفر باشد`
                }, { status: 400 });
            }
            
            if (typeof item.unit_price !== 'number' || item.unit_price <= 0) {
                console.log(`❌ Item ${i} has invalid unit_price: ${item.unit_price}`);
                return NextResponse.json({
                    success: false,
                    message: `محصول ${i + 1}: قیمت واحد باید بیشتر از صفر باشد`
                }, { status: 400 });
            }
        }

        // Generate UUID for sale
        const saleId = uuidv4();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Get customer info
        const [customer] = await executeQuery('SELECT name FROM customers WHERE id = ?', [body.customer_id]);
        const customerName = customer?.name || 'مشتری نامشخص';

        console.log('Starting sale creation with:', {
            customer_id: body.customer_id,
            total_amount: body.total_amount,
            items_count: body.items?.length || 0,
            userName,
            customerName
        });

        // Use connection with transaction
        console.log('🔄 Starting database transaction');
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            console.log('📝 Creating sale record in database');
            
            // Create sale record
            await connection.execute(`
                INSERT INTO sales (
                    id,
                    deal_id,
                    customer_id,
                    customer_name,
                    total_amount,
                    currency,
                    payment_status,
                    payment_method,
                    sale_date,
                    delivery_date,
                    payment_due_date,
                    notes,
                    invoice_number,
                    sales_person_id,
                    sales_person_name,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                saleId,
                body.deal_id || null,
                body.customer_id,
                customerName,
                body.total_amount,
                body.currency || 'IRR',
                body.payment_status || 'pending',
                body.payment_method || null,
                body.sale_date || now,
                body.delivery_date || null,
                body.payment_due_date || null,
                body.notes || null,
                body.invoice_number || null,
                user.id,
                userName,
                now,
                now
            ]);

            // Create sale items
            console.log(`📦 Creating ${body.items?.length || 0} sale items`);

            if (body.items && body.items.length > 0) {
                for (let i = 0; i < body.items.length; i++) {
                    const item = body.items[i];
                    console.log(`📦 Processing item ${i + 1}/${body.items.length}: product_id=${item.product_id}`);

                    try {
                        // Get product info
                        const [productRows] = await connection.execute('SELECT name FROM products WHERE id = ?', [item.product_id]);
                        const products = productRows as any[];
                        const productName = products[0]?.name || 'محصول نامشخص';
                        console.log(`📦 Found product: ${productName}`);

                        const itemId = uuidv4();
                        await connection.execute(`
                            INSERT INTO sale_items (
                                id,
                                sale_id,
                                product_id,
                                product_name,
                                quantity,
                                unit_price,
                                discount_percentage,
                                total_price,
                                created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            itemId,
                            saleId,
                            item.product_id,
                            productName,
                            Math.max(1, item.quantity), // Ensure quantity is at least 1
                            Math.max(0.01, item.unit_price), // Ensure unit_price is positive
                            item.discount_percentage || 0,
                            Math.max(0.01, item.total_price || (item.quantity * item.unit_price)), // Calculate if not provided
                            now
                        ]);
                        console.log(`✅ Item ${i + 1} created with ID: ${itemId}`);
                    } catch (itemError) {
                        console.error(`❌ Error creating item ${i + 1}:`, itemError);
                        throw itemError; // Re-throw to trigger rollback
                    }
                }
            } else {
                console.log('⚠️ No items to create');
            }

            // Commit transaction
            console.log('✅ All operations successful, committing transaction');
            await connection.commit();
            console.log('✅ Transaction committed');

        } catch (error) {
            // Rollback on error
            console.error('❌ Error during transaction, rolling back:', error);
            try {
                await connection.rollback();
                console.log('✅ Transaction rolled back successfully');
            } catch (rollbackError) {
                console.error('❌ Error during rollback:', rollbackError);
            }
            throw error;
        } finally {
            connection.release();
        }

        return NextResponse.json({
            success: true,
            message: 'فروش با موفقیت ثبت شد',
            data: {
                id: saleId,
                customer_name: customerName,
                total_amount: body.total_amount,
                items_count: body.items.length,
                sales_person_name: userName,
                sale_date: body.sale_date || now
            }
        });

    } catch (error) {
        console.error('Create sale API error:', error);
        console.error('Error details:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, message: 'خطا در ثبت فروش' },
            { status: 500 }
        );
    }
}