import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // دریافت لیست صنایع منحصر به فرد
    const industries = await executeQuery(`
      SELECT DISTINCT industry 
      FROM customers 
      WHERE industry IS NOT NULL AND industry != '' 
      ORDER BY industry
    `);

    // دریافت لیست کاربران مسئول
    const assignedUsers = await executeQuery(`
      SELECT DISTINCT u.id, u.name 
      FROM users u 
      INNER JOIN customers c ON u.id = c.assigned_to 
      WHERE u.name IS NOT NULL 
      ORDER BY u.name
    `);

    // دریافت لیست شهرها
    const cities = await executeQuery(`
      SELECT DISTINCT city 
      FROM customers 
      WHERE city IS NOT NULL AND city != '' 
      ORDER BY city
    `);

    // دریافت لیست منابع کسب مشتری
    const sources = await executeQuery(`
      SELECT DISTINCT source 
      FROM customers 
      WHERE source IS NOT NULL AND source != '' 
      ORDER BY source
    `);

    // دریافت لیست محصولات
    const products = await executeQuery(`
      SELECT id, name, category 
      FROM products 
      WHERE status = 'active' 
      ORDER BY name
    `);

    return NextResponse.json({
      success: true,
      industries: industries.map((row: any) => row.industry),
      assignedUsers: assignedUsers,
      cities: cities.map((row: any) => row.city),
      sources: sources.map((row: any) => row.source),
      products: products
    });

  } catch (error) {
    console.error('خطا در دریافت گزینه‌های فیلتر:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت گزینه‌های فیلتر' },
      { status: 500 }
    );
  }
}