import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

// GET /api/products/categories - دریافت لیست دسته‌بندی‌های محصولات
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // دریافت دسته‌بندی‌های منحصر به فرد
    const categories = await executeQuery(`
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL 
        AND category != ''
        AND category != 'null'
      ORDER BY category ASC
    `);

    const categoryList = categories.map((row: any) => row.category);

    console.log('📂 Categories found:', categoryList);

    return NextResponse.json({
      success: true,
      data: categoryList
    });

  } catch (error) {
    console.error('❌ خطا در دریافت دسته‌بندی‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت دسته‌بندی‌ها' },
      { status: 500 }
    );
  }
}
