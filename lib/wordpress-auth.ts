import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import crypto from 'crypto';

interface WordPressAuthConfig {
  hmacSecret?: string;
  rateLimitWindow: number; // in milliseconds
  rateLimitMax: number; // max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface ApiKeyInfo {
  id: string;
  tenant_key: string;
  name: string;
  is_active: boolean;
}

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * WordPress Integration API Authentication Middleware
 * Validates API keys and optional HMAC signatures for WordPress requests
 */
export class WordPressAuthMiddleware {
  private config: WordPressAuthConfig;

  constructor(config: WordPressAuthConfig) {
    this.config = config;
  }

  /**
   * Validate API key from request headers and get tenant info
   */
  private async validateApiKey(request: NextRequest): Promise<ApiKeyInfo | null> {
    const apiKey = request.headers.get('X-WP-API-Key') || 
                   request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return null;
    }

    try {
      // Get API key info from database
      const keyInfo = await executeSingle(`
        SELECT id, tenant_key, name, is_active, usage_count
        FROM wordpress_api_keys 
        WHERE api_key = ? AND is_active = TRUE
      `, [apiKey]);

      if (!keyInfo) {
        return null;
      }

      // Update usage count and last used timestamp
      await executeQuery(`
        UPDATE wordpress_api_keys 
        SET usage_count = usage_count + 1, last_used_at = NOW()
        WHERE id = ?
      `, [keyInfo.id]);

      return {
        id: keyInfo.id,
        tenant_key: keyInfo.tenant_key,
        name: keyInfo.name,
        is_active: Boolean(keyInfo.is_active)
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Validate HMAC signature if provided
   */
  private validateHmacSignature(request: NextRequest, body: string): boolean {
    if (!this.config.hmacSecret) {
      return true; // HMAC is optional
    }

    const signature = request.headers.get('X-WP-Signature');
    if (!signature) {
      return true; // HMAC is optional, allow requests without signature
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.hmacSecret)
      .update(body)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }

  /**
   * Check rate limiting for the request
   */
  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(clientId);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }

    if (entry.count >= this.config.rateLimitMax) {
      return false; // Rate limit exceeded
    }

    entry.count++;
    return true;
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientId(request: NextRequest, tenantKey?: string): string {
    // Use tenant key + API key as client identifier, fallback to IP
    const apiKey = request.headers.get('X-WP-API-Key') || 
                   request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (apiKey && tenantKey) {
      return `tenant:${tenantKey}:api_key:${apiKey.substring(0, 8)}`;
    }

    // Fallback to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return `ip:${ip}`;
  }

  /**
   * Main authentication method
   */
  async authenticate(request: NextRequest, body?: string): Promise<{
    success: boolean;
    error?: string;
    statusCode?: number;
    tenantKey?: string;
    apiKeyInfo?: ApiKeyInfo;
  }> {
    try {
      // Check API key and get tenant info
      const apiKeyInfo = await this.validateApiKey(request);
      if (!apiKeyInfo) {
        return {
          success: false,
          error: 'Invalid or missing API key',
          statusCode: 401
        };
      }

      // Check rate limiting per tenant
      const clientId = this.getClientId(request, apiKeyInfo.tenant_key);
      if (!this.checkRateLimit(clientId)) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429
        };
      }

      // Check HMAC signature if body is provided
      if (body && !this.validateHmacSignature(request, body)) {
        return {
          success: false,
          error: 'Invalid HMAC signature',
          statusCode: 401
        };
      }

      return { 
        success: true, 
        tenantKey: apiKeyInfo.tenant_key,
        apiKeyInfo: apiKeyInfo
      };
    } catch (error) {
      console.error('WordPress authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed',
        statusCode: 500
      };
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Create WordPress authentication middleware instance
 */
export function createWordPressAuth(): WordPressAuthMiddleware {
  const config: WordPressAuthConfig = {
    hmacSecret: process.env.WORDPRESS_HMAC_SECRET,
    rateLimitWindow: 60000, // 1 minute
    rateLimitMax: 100 // 100 requests per minute per tenant
  };

  return new WordPressAuthMiddleware(config);
}

/**
 * Helper function to handle authentication in API routes
 */
export async function withWordPressAuth(
  request: NextRequest,
  handler: (request: NextRequest, tenantKey: string, apiKeyInfo: ApiKeyInfo) => Promise<NextResponse>,
  body?: string
): Promise<NextResponse> {
  const auth = createWordPressAuth();
  const authResult = await auth.authenticate(request, body);

  if (!authResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: authResult.error,
        message: 'WordPress integration authentication failed'
      },
      { status: authResult.statusCode || 401 }
    );
  }

  return handler(request, authResult.tenantKey!, authResult.apiKeyInfo!);
}