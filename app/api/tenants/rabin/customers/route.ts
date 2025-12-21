import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

/**
 * GET /api/tenants/rabin/customers
 * Get all customers for rabin tenant
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tenantKey = 'rabin';
    
    // Get all customers for rabin tenant
    const customers = await executeQuery(`
      SELECT 
        id,
        name,
        email,
        phone,
        company_name,
        address,
        city,
        state,
        country,
        segment,
        priority,
        status,
        source,
        wordpress_user_id,
        created_at,
        updated_at
      FROM customers 
      WHERE tenant_key = ?
      ORDER BY created_at DESC
    `, [tenantKey]);

    // Get summary statistics
    const [stats] = await executeQuery(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN source = 'wordpress' THEN 1 END) as wordpress_customers,
        COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_customers,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_customers
      FROM customers 
      WHERE tenant_key = ?
    `, [tenantKey]);

    return NextResponse.json({
      success: true,
      data: {
        tenant_key: tenantKey,
        customers: customers,
        stats: stats || {
          total_customers: 0,
          wordpress_customers: 0,
          manual_customers: 0,
          recent_customers: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching rabin customers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch customers',
        message: 'خطا در دریافت مشتریان'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/rabin/customers
 * Create a new customer for rabin tenant
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const tenantKey = 'rabin';
    
    const {
      name,
      email,
      phone,
      company_name,
      address,
      city,
      state,
      country,
      segment,
      priority,
      status,
      source
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name and email are required',
          message: 'نام و ایمیل الزامی است'
        },
        { status: 400 }
      );
    }

    // Check for duplicate email in this tenant
    const existingCustomer = await executeQuery(`
      SELECT id FROM customers 
      WHERE tenant_key = ? AND email = ?
    `, [tenantKey, email]);

    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already exists',
          message: 'این ایمیل قبلاً ثبت شده است'
        },
        { status: 400 }
      );
    }

    // Generate customer ID
    const { v4: uuidv4 } = require('uuid');
    const customerId = uuidv4();

    // Insert new customer
    await executeQuery(`
      INSERT INTO customers (
        id, tenant_key, name, email, phone, company_name, 
        address, city, state, country, segment, priority, 
        status, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      customerId,
      tenantKey,
      name,
      email,
      phone || null,
      company_name || null,
      address || null,
      city || null,
      state || null,
      country || 'Iran',
      segment || 'medium',
      priority || 'medium',
      status || 'prospect',
      source || 'manual'
    ]);

    // Get the created customer
    const [newCustomer] = await executeQuery(`
      SELECT * FROM customers WHERE id = ?
    `, [customerId]);

    return NextResponse.json({
      success: true,
      data: {
        customer: newCustomer
      },
      message: 'مشتری با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('Error creating rabin customer:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create customer',
        message: 'خطا در ایجاد مشتری'
      },
      { status: 500 }
    );
  }
}