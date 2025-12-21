import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(request: NextRequest) {
  try {
    const tenantKey = request.headers.get('X-Tenant-Key');

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      // Check if sale_items table exists
      const [tables] = await conn.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sale_items'
      `);

      if (!tables || (tables as any[]).length === 0) {
        // Table doesn't exist, return empty array
        return NextResponse.json({
          success: true,
          products: []
        });
      }

      // Get top selling products from sale_items table
      const [topProducts] = await conn.query(`
        SELECT 
          si.product_id,
          si.product_name,
          si.product_category,
          COUNT(*) as sale_count,
          SUM(si.quantity) as total_quantity,
          SUM(si.total_price) as total_revenue,
          AVG(si.unit_price) as avg_price
        FROM sale_items si
        WHERE si.tenant_key = ?
        GROUP BY si.product_id, si.product_name, si.product_category
        ORDER BY total_revenue DESC, total_quantity DESC
        LIMIT 10
      `, [tenantKey]);

      return NextResponse.json({
        success: true,
        products: topProducts
      });
    } finally {
      conn.release();
    }

  } catch (error: any) {
    console.error('❌ خطا در دریافت پرفروش‌ترین محصولات:', error);
    
    // Handle specific database connection errors
    if (error.code === 'ER_CON_COUNT_ERROR' || error.message?.includes('Too many connections')) {
      return NextResponse.json(
        { success: false, message: 'مشکل در اتصال به دیتابیس' },
        { status: 503 }
      );
    }
    
    // Handle table not exists error (sale_items table might not exist yet)
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json(
        { success: true, products: [] }, // Return empty array instead of error
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}