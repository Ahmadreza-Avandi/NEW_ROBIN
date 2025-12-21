import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * GET /api/admin/api-keys
 * Get all API keys for admin management
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check admin authentication
    const authResponse = await checkAdminAuth(request);
    if (authResponse) return authResponse;

    // Get all API keys (without showing the actual key values)
    const keys = await executeQuery(`
      SELECT 
        id,
        tenant_key,
        name,
        CONCAT(LEFT(api_key, 8), '...') as key_preview,
        api_key,
        created_at,
        last_used_at,
        is_active,
        usage_count
      FROM wordpress_api_keys 
      ORDER BY tenant_key, created_at DESC
    `);

    // Format the response
    const formattedKeys = keys.map((key: any) => ({
      id: key.id,
      tenant_key: key.tenant_key,
      name: key.name,
      key: key.key_preview,
      created_at: key.created_at,
      last_used: key.last_used_at,
      is_active: Boolean(key.is_active),
      usage_count: key.usage_count || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        keys: formattedKeys
      }
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API keys',
        message: 'خطا در دریافت کلیدهای API'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check admin authentication
    const authResponse = await checkAdminAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { name, tenant_key } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name is required',
          message: 'نام کلید API الزامی است'
        },
        { status: 400 }
      );
    }

    // Use provided tenant_key or default
    const finalTenantKey = tenant_key || 'default';

    // Generate a secure API key
    const apiKey = generateApiKey();
    const keyId = uuidv4();

    // Insert the new API key
    await executeQuery(`
      INSERT INTO wordpress_api_keys (
        id, tenant_key, name, api_key, created_at, is_active
      ) VALUES (?, ?, ?, ?, NOW(), 1)
    `, [keyId, finalTenantKey, name.trim(), apiKey]);

    // Return the new key (this is the only time the full key is shown)
    return NextResponse.json({
      success: true,
      data: {
        key: {
          id: keyId,
          tenant_key: finalTenantKey,
          name: name.trim(),
          key: apiKey,
          created_at: new Date().toISOString(),
          last_used: null,
          is_active: true,
          usage_count: 0
        }
      },
      message: 'کلید API با موفقیت ساخته شد'
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create API key',
        message: 'خطا در ساخت کلید API'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure API key
 */
function generateApiKey(): string {
  const prefix = 'wp_crm_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
}

/**
 * Check admin authentication
 */
async function checkAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get session or token from request
    // This should match your existing admin authentication logic
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('admin_session');
    
    // For now, we'll use a simple check - you should implement proper admin auth
    // This is a placeholder - implement your actual admin authentication logic
    
    return null; // Authentication passed
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        message: 'احراز هویت مدیر الزامی است'
      },
      { status: 401 }
    );
  }
}

/**
 * Create the API keys table if it doesn't exist
 */
async function ensureApiKeysTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS wordpress_api_keys (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INT DEFAULT 0,
        INDEX idx_api_key (api_key),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `);
  } catch (error) {
    console.error('Error creating API keys table:', error);
  }
}

// Ensure table exists when module loads
ensureApiKeysTable();