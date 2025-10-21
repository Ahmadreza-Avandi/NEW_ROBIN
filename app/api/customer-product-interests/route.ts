import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/customer-product-interests - دریافت علاقه‌مندی‌های مشتری
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const productId = searchParams.get('product_id');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (customerId) {
      whereClause += ' AND cpi.customer_id = ?';
      params.push(customerId);
    }

    if (productId) {
      whereClause += ' AND cpi.product_id = ?';
      params.push(productId);
    }

    const interests = await executeQuery(`
      SELECT 
        cpi.id,
        cpi.customer_id,
        cpi.product_id,
        cpi.interest_level,
        cpi.notes,
        cpi.created_at,
        cpi.updated_at,
        c.name as customer_name,
        p.name as product_name,
        p.category as product_category,
        p.price as product_price
      FROM customer_product_interests cpi
      LEFT JOIN customers c ON cpi.customer_id = c.id
      LEFT JOIN products p ON cpi.product_id = p.id
      ${whereClause}
      ORDER BY cpi.created_at DESC
    `, params);

    return NextResponse.json({
      success: true,
      data: interests
    });

  } catch (error) {
    console.error('خطا در دریافت علاقه‌مندی‌ها:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت علاقه‌مندی‌ها' },
      { status: 500 }
    );
  }
}

// POST /api/customer-product-interests - ایجاد علاقه‌مندی جدید
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customer_id,
      product_id,
      interest_level = 'medium',
      notes
    } = body;

    if (!customer_id || !product_id) {
      return NextResponse.json(
        { success: false, message: 'شناسه مشتری و محصول الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود رکورد قبلی
    const existingInterest = await executeQuery(`
      SELECT id FROM customer_product_interests 
      WHERE customer_id = ? AND product_id = ?
    `, [customer_id, product_id]);

    if (existingInterest.length > 0) {
      // بروزرسانی رکورد موجود
      await executeSingle(`
        UPDATE customer_product_interests 
        SET interest_level = ?, notes = ?, updated_at = NOW()
        WHERE customer_id = ? AND product_id = ?
      `, [interest_level, notes || null, customer_id, product_id]);

      return NextResponse.json({
        success: true,
        message: 'علاقه‌مندی با موفقیت بروزرسانی شد',
        data: { id: existingInterest[0].id }
      });
    } else {
      // ایجاد رکورد جدید
      const interestId = uuidv4();

      await executeSingle(`
        INSERT INTO customer_product_interests (
          id, customer_id, product_id, interest_level, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [interestId, customer_id, product_id, interest_level, notes || null]);

      return NextResponse.json({
        success: true,
        message: 'علاقه‌مندی با موفقیت ایجاد شد',
        data: { id: interestId }
      });
    }

  } catch (error) {
    console.error('خطا در ایجاد علاقه‌مندی:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد علاقه‌مندی' },
      { status: 500 }
    );
  }
}

// DELETE /api/customer-product-interests - حذف علاقه‌مندی
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const interestId = searchParams.get('id');
    const customerId = searchParams.get('customer_id');
    const productId = searchParams.get('product_id');

    if (interestId) {
      // حذف بر اساس ID
      await executeSingle(`
        DELETE FROM customer_product_interests WHERE id = ?
      `, [interestId]);
    } else if (customerId && productId) {
      // حذف بر اساس مشتری و محصول
      await executeSingle(`
        DELETE FROM customer_product_interests 
        WHERE customer_id = ? AND product_id = ?
      `, [customerId, productId]);
    } else {
      return NextResponse.json(
        { success: false, message: 'پارامترهای لازم ارائه نشده است' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'علاقه‌مندی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('خطا در حذف علاقه‌مندی:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف علاقه‌مندی' },
      { status: 500 }
    );
  }
}