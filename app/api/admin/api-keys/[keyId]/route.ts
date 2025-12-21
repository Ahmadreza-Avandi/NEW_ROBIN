import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';

/**
 * PATCH /api/admin/api-keys/[keyId]
 * Update an API key (enable/disable)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { keyId: string } }
): Promise<NextResponse> {
  try {
    // Check admin authentication
    const authResponse = await checkAdminAuth(request);
    if (authResponse) return authResponse;

    const { keyId } = params;
    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'is_active must be a boolean',
          message: 'وضعیت فعال/غیرفعال باید مشخص باشد'
        },
        { status: 400 }
      );
    }

    // Check if API key exists
    const existingKey = await executeSingle(`
      SELECT id, name FROM wordpress_api_keys WHERE id = ?
    `, [keyId]);

    if (!existingKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not found',
          message: 'کلید API یافت نشد'
        },
        { status: 404 }
      );
    }

    // Update the API key status
    await executeQuery(`
      UPDATE wordpress_api_keys 
      SET is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [is_active, keyId]);

    return NextResponse.json({
      success: true,
      data: {
        id: keyId,
        is_active: is_active
      },
      message: is_active ? 'کلید API فعال شد' : 'کلید API غیرفعال شد'
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update API key',
        message: 'خطا در به‌روزرسانی کلید API'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/api-keys/[keyId]
 * Delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
): Promise<NextResponse> {
  try {
    // Check admin authentication
    const authResponse = await checkAdminAuth(request);
    if (authResponse) return authResponse;

    const { keyId } = params;

    // Check if API key exists
    const existingKey = await executeSingle(`
      SELECT id, name FROM wordpress_api_keys WHERE id = ?
    `, [keyId]);

    if (!existingKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not found',
          message: 'کلید API یافت نشد'
        },
        { status: 404 }
      );
    }

    // Delete the API key
    await executeQuery(`
      DELETE FROM wordpress_api_keys WHERE id = ?
    `, [keyId]);

    return NextResponse.json({
      success: true,
      message: 'کلید API با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete API key',
        message: 'خطا در حذف کلید API'
      },
      { status: 500 }
    );
  }
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