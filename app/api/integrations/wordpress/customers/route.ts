import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { withWordPressAuth } from '@/lib/wordpress-auth';
import { v4 as uuidv4 } from 'uuid';

// JSON Schema for WordPress customer data validation
interface WordPressCustomerData {
  source: 'wordpress';
  wordpress_user_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  registration_date: string;
  metadata?: Record<string, any>;
  tenant_key?: string;
}

/**
 * Validate WordPress customer data against schema
 */
function validateCustomerData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.source || data.source !== 'wordpress') {
    errors.push('source must be "wordpress"');
  }

  if (!data.wordpress_user_id || typeof data.wordpress_user_id !== 'number') {
    errors.push('wordpress_user_id is required and must be a number');
  }

  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('email is required and must be a valid email address');
  }

  if (!data.registration_date || typeof data.registration_date !== 'string') {
    errors.push('registration_date is required and must be a string');
  }

  // Optional field type validation
  if (data.first_name && typeof data.first_name !== 'string') {
    errors.push('first_name must be a string');
  }

  if (data.last_name && typeof data.last_name !== 'string') {
    errors.push('last_name must be a string');
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.push('phone must be a string');
  }

  if (data.company_name && typeof data.company_name !== 'string') {
    errors.push('company_name must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for duplicate customers by email or wordpress_user_id
 */
async function findExistingCustomer(email: string, wordpress_user_id: number, tenant_key: string): Promise<any> {
  try {
    const customers = await executeQuery(`
      SELECT id, email, wordpress_user_id 
      FROM customers 
      WHERE tenant_key = ? AND (email = ? OR wordpress_user_id = ?)
      LIMIT 1
    `, [tenant_key, email, wordpress_user_id]);

    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    console.error('Error finding existing customer:', error);
    return null;
  }
}

/**
 * Create new customer record
 */
async function createCustomer(data: WordPressCustomerData): Promise<string> {
  const customerId = uuidv4();
  const tenantKey = data.tenant_key || 'default';
  
  // Determine segment based on company_name
  const segment = data.company_name ? 'small_business' : 'individual';
  
  // Combine first_name and last_name for the name field
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email;

  await executeSingle(`
    INSERT INTO customers (
      id, name, company_name, email, phone, address, city, state, country,
      segment, priority, status, source, wordpress_user_id, tenant_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    customerId,
    name,
    data.company_name || null,
    data.email,
    data.phone || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.country || 'Iran',
    segment,
    'medium',
    'prospect',
    'wordpress',
    data.wordpress_user_id,
    tenantKey
  ]);

  return customerId;
}

/**
 * Update existing customer record
 */
async function updateCustomer(customerId: string, data: WordPressCustomerData): Promise<void> {
  // Combine first_name and last_name for the name field
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email;
  
  // Determine segment based on company_name
  const segment = data.company_name ? 'small_business' : 'individual';

  await executeSingle(`
    UPDATE customers SET
      name = ?,
      company_name = ?,
      phone = ?,
      address = ?,
      city = ?,
      state = ?,
      country = ?,
      segment = ?,
      updated_at = NOW()
    WHERE id = ?
  `, [
    name,
    data.company_name || null,
    data.phone || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.country || 'Iran',
    segment,
    customerId
  ]);
}

/**
 * POST /api/integrations/wordpress/customers
 * Receive and process WordPress customer data
 */
async function handleCustomerData(request: NextRequest, tenantKey: string): Promise<NextResponse> {
  try {
    const body = await request.text();
    let customerData: WordPressCustomerData;

    // Parse JSON
    try {
      customerData = JSON.parse(body);
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

    // Validate customer data
    const validation = validateCustomerData(customerData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Customer data validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Use tenant key from authentication
    customerData.tenant_key = tenantKey;

    // Check for existing customer (scoped to tenant)
    const existingCustomer = await findExistingCustomer(
      customerData.email,
      customerData.wordpress_user_id,
      tenantKey
    );

    let customerId: string;
    let isUpdate = false;

    if (existingCustomer) {
      // Update existing customer
      customerId = existingCustomer.id;
      await updateCustomer(customerId, customerData);
      isUpdate = true;
    } else {
      // Create new customer
      customerId = await createCustomer(customerData);
    }

    // Fetch the created/updated customer for response (scoped to tenant)
    const [customer] = await executeQuery(`
      SELECT id, name, email, phone, company_name, segment, status, source, wordpress_user_id, created_at, updated_at
      FROM customers
      WHERE id = ? AND tenant_key = ?
    `, [customerId, tenantKey]);

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Customer updated successfully' : 'Customer created successfully',
      data: {
        customer_id: customerId,
        wordpress_user_id: customerData.wordpress_user_id,
        email: customerData.email,
        action: isUpdate ? 'updated' : 'created',
        tenant_key: tenantKey,
        customer: customer
      }
    });

  } catch (error) {
    console.error('WordPress customer integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process customer data'
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
    async (req, tenantKey, apiKeyInfo) => {
      // Create new request with the body for processing
      const newRequest = new NextRequest(req.url, {
        method: 'POST',
        headers: req.headers,
        body: body
      });
      
      return handleCustomerData(newRequest, tenantKey);
    },
    body
  );
}