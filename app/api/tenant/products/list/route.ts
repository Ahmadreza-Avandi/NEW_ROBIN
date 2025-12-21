import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

async function handleGetProductsList(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const customerId = searchParams.get('customer_id');

    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      let whereConditions = ['p.tenant_key = ?', 'p.status = "active"'];
      let queryParams = [tenantKey];

      // فیلتر جستجو
      if (search) {
        whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)');
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      // اگر customer_id داده شده، محصولاتی که قبلاً اضافه شده رو حذف کن
      if (customerId) {
        whereConditions.push(`p.id NOT IN (
          SELECT product_id FROM customer_product_interests 
          WHERE customer_id = ?
        )`);
        queryParams.push(customerId);
      }

      const whereClause = whereConditions.join(' AND ');

      // دریافت لیست محصولات
      const [products] = await connection.query(`
        SELECT p.id, p.name, p.description, p.price, p.category, p.image
        FROM products p
        WHERE ${whereClause}
        ORDER BY p.name ASC
        LIMIT 50
      `, queryParams) as any[];

      return NextResponse.json({
        success: true,
        data: products,
        products: products // Add both for compatibility
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در دریافت لیست محصولات:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export const GET = requireTenantAuth(handleGetProductsList);