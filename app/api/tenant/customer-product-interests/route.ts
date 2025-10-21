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
            const [rows] = await conn.query(
                'SELECT * FROM customer_product_interests WHERE tenant_key = ? ORDER BY created_at DESC',
                [tenantKey]
            );

            return NextResponse.json({
                success: true,
                data: rows
            });
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در دریافت علاقه‌مندی‌های محصول:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            customer_id,
            product_id,
            interest_level,
            notes
        } = body;

        if (!customer_id || !product_id) {
            return NextResponse.json(
                { success: false, message: 'customer_id و product_id الزامی هستند' },
                { status: 400 }
            );
        }

        const pool = await getTenantConnection(tenantKey);
        const conn = await pool.getConnection();

        try {
            const [result] = await conn.query(
                `INSERT INTO customer_product_interests (
          tenant_key,
          customer_id,
          product_id,
          interest_level,
          notes,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    tenantKey,
                    customer_id,
                    product_id,
                    interest_level || 'medium',
                    notes || null
                ]
            ) as any;

            return NextResponse.json({
                success: true,
                message: 'علاقه‌مندی محصول با موفقیت اضافه شد',
                data: {
                    id: result.insertId
                }
            });
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('❌ خطا در افزودن علاقه‌مندی محصول:', error);
        return NextResponse.json(
            { success: false, message: 'خطای سرور' },
            { status: 500 }
        );
    }
}