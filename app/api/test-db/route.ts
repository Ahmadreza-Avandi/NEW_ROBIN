import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    // تست ساده دیتابیس
    const result = await executeQuery('SELECT COUNT(*) as count FROM customers LIMIT 1');
    
    return NextResponse.json({
      success: true,
      message: 'دیتابیس در دسترس است',
      customerCount: result[0]?.count || 0
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در اتصال به دیتابیس',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    }, { status: 500 });
  }
}