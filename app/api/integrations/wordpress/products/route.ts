import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { withWordPressAuth } from '@/lib/wordpress-auth';
import { v4 as uuidv4 } from 'uuid';

// JSON Schema for WordPress product data validation
interface WordPressProductData {
  source: 'wordpress';
  wordpress_product_id: number;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  currency?: string;
  category?: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
  tenant_key?: string;
}

/**
 * Validate WordPress product data against schema
 */
function validateProductData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.source || data.source !== 'wordpress') {
    errors.push('source must be "wordpress"');
  }

  if (!data.wordpress_product_id || typeof data.wordpress_product_id !== 'number') {
    errors.push('wordpress_product_id is required and must be a number');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required and must be a string');
  }

  if (!data.status || !['active', 'inactive'].includes(data.status)) {
    errors.push('status is required and must be either "active" or "inactive"');
  }

  // Optional field type validation
  if (data.description && typeof data.description !== 'string') {
    errors.push('description must be a string');
  }

  if (data.sku && typeof data.sku !== 'string') {
    errors.push('sku must be a string');
  }

  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    errors.push('price must be a non-negative number');
  }

  if (data.currency && typeof data.currency !== 'string') {
    errors.push('currency must be a string');
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push('category must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for existing product by wordpress_product_id or SKU
 */
async function findExistingProduct(wordpress_product_id: number, sku: string | undefined, tenant_key: string): Promise<any> {
  try {
    let query = `
      SELECT id, name, wordpress_product_id, sku 
      FROM products 
      WHERE tenant_key = ? AND wordpress_product_id = ?
    `;
    let params = [tenant_key, wordpress_product_id];

    // Also check by SKU if provided
    if (sku) {
      query += ` OR (tenant_key = ? AND sku = ?)`;
      params.push(tenant_key, sku);
    }

    query += ` LIMIT 1`;

    const products = await executeQuery(query, params);
    return products.length > 0 ? products[0] : null;
  } catch (error) {
    console.error('Error finding existing product:', error);
    return null;
  }
}

/**
 * Create new product record
 */
async function createProduct(data: WordPressProductData): Promise<string> {
  const productId = uuidv4();
  const tenantKey = data.tenant_key || 'default';
  
  // Map WordPress status to CRM status
  const crmStatus = data.status === 'active' ? 'active' : 'inactive';

  await executeSingle(`
    INSERT INTO products (
      id, name, description, sku, price, currency, category, status, 
      source, wordpress_product_id, tenant_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    productId,
    data.name,
    data.description || null,
    data.sku || null,
    data.price || null,
    data.currency || 'IRR',
    data.category || null,
    crmStatus,
    'wordpress',
    data.wordpress_product_id,
    tenantKey
  ]);

  return productId;
}

/**
 * Update existing product record
 */
async function updateProduct(productId: string, data: WordPressProductData): Promise<void> {
  // Map WordPress status to CRM status
  const crmStatus = data.status === 'active' ? 'active' : 'inactive';

  await executeSingle(`
    UPDATE products SET
      name = ?,
      description = ?,
      sku = ?,
      price = ?,
      currency = ?,
      category = ?,
      status = ?,
      updated_at = NOW()
    WHERE id = ?
  `, [
    data.name,
    data.description || null,
    data.sku || null,
    data.price || null,
    data.currency || 'IRR',
    data.category || null,
    crmStatus,
    productId
  ]);
}

/**
 * Handle product categories
 */
async function ensureProductCategory(categoryName: string, tenantKey: string): Promise<void> {
  if (!categoryName) return;

  try {
    // Check if category exists
    const existingCategories = await executeQuery(`
      SELECT id FROM product_categories 
      WHERE tenant_key = ? AND name = ?
      LIMIT 1
    `, [tenantKey, categoryName]);

    if (existingCategories.length === 0) {
      // Create new category
      const categoryId = uuidv4();
      await executeSingle(`
        INSERT INTO product_categories (id, name, tenant_key, created_at)
        VALUES (?, ?, ?, NOW())
      `, [categoryId, categoryName, tenantKey]);
    }
  } catch (error) {
    console.error('Error ensuring product category:', error);
    // Continue without failing the product creation
  }
}

/**
 * POST /api/integrations/wordpress/products
 * Receive and process WordPress product data
 */
async function handleProductData(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    let productData: WordPressProductData;

    // Parse JSON
    try {
      productData = JSON.parse(body);
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

    // Validate product data
    const validation = validateProductData(productData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Product data validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Set default tenant key if not provided
    const tenantKey = productData.tenant_key || 'default';
    productData.tenant_key = tenantKey;

    // Ensure product category exists
    if (productData.category) {
      await ensureProductCategory(productData.category, tenantKey);
    }

    // Check for existing product
    const existingProduct = await findExistingProduct(
      productData.wordpress_product_id,
      productData.sku,
      tenantKey
    );

    let productId: string;
    let isUpdate = false;

    if (existingProduct) {
      // Update existing product
      productId = existingProduct.id;
      await updateProduct(productId, productData);
      isUpdate = true;
    } else {
      // Create new product
      productId = await createProduct(productData);
    }

    // Fetch the created/updated product for response
    const [product] = await executeQuery(`
      SELECT id, name, description, sku, price, currency, category, status, 
             source, wordpress_product_id, created_at, updated_at
      FROM products
      WHERE id = ?
    `, [productId]);

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Product updated successfully' : 'Product created successfully',
      data: {
        product_id: productId,
        wordpress_product_id: productData.wordpress_product_id,
        name: productData.name,
        sku: productData.sku,
        action: isUpdate ? 'updated' : 'created',
        product: product
      }
    });

  } catch (error) {
    console.error('WordPress product integration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process product data'
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
      
      return handleProductData(newRequest);
    },
    body
  );
}