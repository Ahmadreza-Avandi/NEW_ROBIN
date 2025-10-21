import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // بررسی تعداد مشتریان قبل از پاکسازی
    const beforeCount = await executeQuery('SELECT COUNT(*) as count FROM customers');
    
    // حذف مشتریان تکراری
    await executeQuery(`
      DELETE c1 FROM customers c1
      INNER JOIN customers c2 
      WHERE c1.id > c2.id 
        AND c1.name = c2.name 
        AND COALESCE(c1.phone, '') = COALESCE(c2.phone, '')
        AND COALESCE(c1.email, '') = COALESCE(c2.email, '')
    `);

    // بررسی تعداد مشتریان بعد از پاکسازی
    const afterCount = await executeQuery('SELECT COUNT(*) as count FROM customers');
    
    const removedCount = beforeCount[0].count - afterCount[0].count;

    return NextResponse.json({
      success: true,
      message: 'پاکسازی با موفقیت انجام شد',
      data: {
        before: beforeCount[0].count,
        after: afterCount[0].count,
        removed: removedCount
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در پاکسازی' },
      { status: 500 }
    );
  }
}