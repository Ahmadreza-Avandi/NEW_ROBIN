import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { withWordPressAuth } from '@/lib/wordpress-auth';
import { v4 as uuidv4 } from 'uuid';

// JSON Schema for WordPress order data validation
interface OrderLineItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
}

interface BillingInfo {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

interface WordPressOrderData {
  source: 'wordpress';
  wordpress_order_id: number;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  order_date: string;
  billing_info: BillingInfo;
  line_items: OrderLineItem[];
  metadata?: Record<string, any>;
  tenant_key?: string;
}

/**
 * Validate WordPress order data against schema
 */
function validateOrderData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.source || data.source !== 'wordpress') {
    errors.push('source must be "wordpress"');
  }

  if (!data.wordpress_order_id || typeof data.wordpress_order_id !== 'number') {
    errors.push('wordpress_order_id is required and must be a number');
  }

  if (!data.customer_email || typeof data.customer_email !== 'string' || !data.customer_email.includes('@')) {
    errors.push('customer_email is required and must be a valid email address');
  }

  if (typeof data.total_amount !== 'number' || data.total_amount < 0) {
    errors.push('total_amount is required and must be a positive number');
  }

  if (!data.currency || typeof data.currency !== 'string') {
    errors.push('currency is required and must be a string');
  }

  if (!data.status || typeof data.status !== 'string') {
    errors.push('status is required and must be a string');
  }

  if (!data.order_date || typeof data.order_date !== 'string') {
    errors.push('order_date is required and must be a string');
  }

  if (!data.billing_info || typeof data.billing_info !== 'object') {
    errors.push('billing_info is required and must be an object');
  }

  if (!Array.isArray(data.line_items)) {
    errors.push('line_items is required and must be an array');
  } else {
    // Validate line items
    data.line_items.forEach((item: any, index: number) => {
      if (!item.product_name || typeof item.product_name !== 'string') {
        errors.push(`line_items[${index}].product_name is required and must be a string`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`line_items[${index}].quantity is required and must be a positive number`);
      }
      if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
        errors.push(`line_items[${index}].unit_price is required and must be a non-negative number`);
      }
      if (typeof item.total_price !== 'number' || item.total_price < 0) {
        errors.push(`line_items[${index}].total_price is required and must be a non-negative number`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Find or create customer from order data
 */
async function findOrCreateCustomer(orderData: WordPressOrderData): Promise<string> {
  const tenantKey = orderData.tenant_key || 'default';
  
  // First, try to find existing customer by email
  const existingCustomers = await executeQuery(`
    SELECT id FROM customers 
    WHERE tenant_key = ? AND email = ?
    LIMIT 1
  `, [tenantKey, orderData.customer_email]);

  if (existingCustomers.length > 0) {
    return existingCustomers[0].id;
  }

  // Create new customer from billing info
  const customerId = uuidv4();
  const billing = orderData.billing_info;
  
  const name = [billing.first_name, billing.last_name].filter(Boolean).join(' ') || orderData.customer_email;
  const segment = billing.company ? 'small_business' : 'individual';

  await executeSingle(`
    INSERT INTO customers (
      id, name, company_name, email, phone, address, city, state, country,
      segment, priority, status, source, tenant_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    customerId,
    name,
    billing.company || null,
    orderData.customer_email,
    billing.phone || null,
    [billing.address_1, billing.address_2].filter(Boolean).join(', ') || null,
    billing.city || null,
    billing.state || null,
    billing.country || 'Iran',
    segment,
    'medium',
    'customer', // Orders indicate they are already customers
    'wordpress',
    tenantKey
  ]);

  return customerId;
}

/**
 * Check for existing order
 */
async function findExistingOrder(wordpress_order_id: number, tenant_key: string): Promise<any> {
  try {
    const orders = await executeQuery(`
      SELECT id FROM sales 
      WHERE tenant_key = ? AND wordpress_order_id = ?
      LIMIT 1
    `, [tenant_key, wordpress_order_id]);

    return orders.length > 0 ? orders[0] : null;
  } catch (error) {
    console.error('Error finding existing order:', error);
    return null;
  }
}

/**
 * Create new order record
 */
async function createOrder(orderData: WordPressOrderData, customerId: string): Promise<string> {
  const orderId = uuidv4();
  const tenantKey = orderData.tenant_key || 'default';
  
  // Map WooCommerce status to CRM status
  const statusMapping: Record<string, string> = {
    'pending': 'pending',
    'processing': 'confirmed',
    'on-hold': 'on_hold',
    'completed': 'delivered',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'failed': 'failed'
  };
  
  const crmStatus = statusMapping[orderData.status] || 'pending';

  await executeSingle(`
    INSERT INTO sales (
      id, customer_id, total_amount, currency, status, sale_date, 
      source, wordpress_order_id, tenant_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    orderId,
    customerId,
    orderData.total_amount,
    orderData.currency,
    crmStatus,
    orderData.order_date,
    'wordpress',
    orderData.wordpress_order_id,
    tenantKey
  ]);

  // Create order line items
  for (const item of orderData.line_items) {
    const itemId = uuidv4();
    
    await executeSingle(`
      INSERT INTO sale_items (
        id, sale_id, product_name, quantity, unit_price, total_price, 
        sku, tenant_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      itemId,
      orderId,
      item.product_name,
      item.quantity,
      item.unit_price,
      item.total_price,
      item.sku || null,
      tenantKey
    ]);
  }

  return orderId;
}

/**
 * Update existing order record
 */
async function updateOrder(orderId: string, orderData: WordPressOrderData): Promise<void> {
  // Map WooCommerce status to CRM status
  const statusMapping: Record<string, string> = {
    'pending': 'pending',
    'processing': 'confirmed',
    'on-hold': 'on_hold',
    'completed': 'delivered',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'failed': 'failed'
  };
  
  const crmStatus = statusMapping[orderData.status] || 'pending';

  await executeSingle(`
    UPDATE sales SET
      total_amount = ?,
      currency = ?,
      status = ?,
      sale_date = ?,
      updated_at = NOW()
    WHERE id = ?
  `, [
    orderData.total_amount,
    orderData.currency,
    crmStatus,
    orderData.order_date,
    orderId
  ]);

  // Delete existing line items and recreate them
  await executeSingle(`DELETE FROM sale_items WHERE sale_id = ?`, [orderId]);
  
  const tenantKey = orderData.tenant_key || 'default';
  
  // Recreate line items
  for (const item of orderData.line_items) {
    const itemId = uuidv4();
    
    await executeSingle(`
      INSERT INTO sale_items (
        id, sale_id, product_name, quantity, unit_price, total_price, 
        sku, tenant_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      itemId,
      orderId,
      item.product_name,
      item.quantity,
      item.unit_price,
      item.total_price,
      item.sku || null,
      tenantKey
    ]);
  }
}

/**
 * POST /api/integrations/wordpress/orders
 * Receive and process WordPress order data
 */
async function handleOrderData(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    let orderData: WordPressOrderData;

    // Parse JSON
    try {
      orderData = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    // Validate order data
    const validation = validateOrderData(orderData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Order data validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Set default tenant key if not provided
    const tenantKey = orderData.tenant_key || 'default';
    orderData.tenant_key = tenantKey;

    // Find or create customer
    const customerId = await findOrCreateCustomer(orderData);

    // Check for existing order
    const existingOrder = await findExistingOrder(orderData.wordpress_order_id, tenantKey);

    let orderId: string;
    let isUpdate = false;

    if (existingOrder) {
      // Update existing order
      orderId = existingOrder.id;
      await updateOrder(orderId, orderData);
      isUpdate = true;
    } else {
      // Create new order
      orderId = await createOrder(orderData, customerId);
    }

    // Fetch the created/updated order for response
    const [order] = await executeQuery(`
      SELECT s.*, c.name as customer_name, c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [orderId]);

    // Fetch order items
    const orderItems = await executeQuery(`
      SELECT product_name, quantity, unit_price, total_price, sku
      FROM sale_items
      WHERE sale_id = ?
      ORDER BY created_at
    `, [orderId]);

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Order updated successfully' : 'Order created successfully',
      data: {
        order_id: orderId,
        wordpress_order_id: orderData.wordpress_order_id,
        customer_id: customerId,
        customer_email: orderData.customer_email,
        action: isUpdate ? 'updated' : 'created',
        order: {
          ...order,
          line_items: orderItems
        }
      }
    });

  } catch (error) {
    console.error('WordPress order integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process order data'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint with WordPress authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  
  return withWordPressAuth(
    request,
    async (req) => {
      // Create new request with the body for processing
      const newRequest = new NextRequest(req.url, {
        method: 'POST',
        headers: req.headers,
        body: body
      });
      
      return handleOrderData(newRequest);
    },
    body
  );
}