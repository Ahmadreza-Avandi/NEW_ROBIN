import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAuth } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { logActivity } from '@/lib/activity-logger';
import { LeadConversionResult } from '@/lib/sales-pipeline-types';

/**
 * POST /api/[tenant_key]/sales-pipeline/lead/[id]/convert
 * Convert lead to customer manually
 * Requirements: 9.3
 */
async function handleConvertLead(request: NextRequest, session: any) {
  let connection;

  try {
    const tenantKey = session.tenantKey || session.tenant_key;
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.indexOf('lead') + 1];
    const body = await request.json();

    const { sale_amount, notes } = body;

    // Connect to tenant database
    const pool = await getTenantConnection(tenantKey);
    connection = await pool.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Get current lead information
      const [currentLeads] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND tenant_key = ? AND type = "lead"',
        [leadId, tenantKey]
      ) as any[];

      if (currentLeads.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'سرنخ یافت نشد یا قبلاً تبدیل شده است' },
          { status: 404 }
        );
      }

      const currentLead = currentLeads[0];

      // Convert lead to customer
      await connection.query(`
        UPDATE customers SET 
          type = 'customer',
          current_pipeline_stage = 'closed_won',
          updated_at = NOW()
        WHERE id = ? AND tenant_key = ?
      `, [leadId, tenantKey]);

      // Record stage change in history
      await connection.query(`
        INSERT INTO lead_pipeline_history (
          tenant_key, customer_id, from_stage, to_stage, 
          changed_by, change_reason, changed_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        tenantKey, 
        leadId, 
        currentLead.current_pipeline_stage, 
        'closed_won', 
        session.userId, 
        notes ? `تبدیل دستی - ${notes}` : 'تبدیل دستی سرنخ به مشتری'
      ]);

      // Create sale record if amount provided
      let saleId = null;
      if (sale_amount && sale_amount > 0) {
        const [saleResult] = await connection.query(`
          INSERT INTO sales (
            tenant_key, customer_id, total_amount, sale_date,
            payment_status, notes, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, NOW(), 'paid', ?, ?, NOW(), NOW())
        `, [
          tenantKey, 
          leadId, 
          sale_amount, 
          notes || 'فروش ناشی از تبدیل سرنخ', 
          session.userId
        ]) as any;
        
        saleId = saleResult.insertId;
      }

      // Log conversion activity
      const userId = session.userId || session.id || 'unknown';
      const userName = session.user?.name || session.name || 'کاربر';
      
      await logActivity({
        tenantKey,
        userId,
        userName,
        type: 'lead',
        title: `تبدیل سرنخ به مشتری: ${currentLead.name}`,
        description: `سرنخ ${currentLead.name} با موفقیت به مشتری تبدیل شد${sale_amount ? ` - مبلغ فروش: ${sale_amount.toLocaleString()} تومان` : ''}${notes ? ` - یادداشت: ${notes}` : ''}`,
        customerId: leadId,
        customerName: currentLead.name
      });

      // Create follow-up task for new customer
      await connection.query(`
        INSERT INTO tasks (
          tenant_key, title, description, assigned_to, customer_id,
          due_date, priority, status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, ?, NOW(), NOW())
      `, [
        tenantKey,
        `پیگیری مشتری جدید: ${currentLead.name}`,
        `پیگیری و ارائه خدمات پس از فروش به مشتری ${currentLead.name}`,
        currentLead.sales_owner || session.userId,
        leadId,
        'medium',
        'pending',
        session.userId
      ]);

      // Commit transaction
      await connection.commit();

      const conversionResult: LeadConversionResult = {
        success: true,
        customer_id: leadId,
        conversion_date: new Date().toISOString(),
        sale_amount: sale_amount || undefined,
        notes: notes || undefined
      };

      return NextResponse.json({
        success: true,
        message: 'سرنخ با موفقیت به مشتری تبدیل شد',
        data: conversionResult
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ خطا در تبدیل سرنخ به مشتری:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در تبدیل سرنخ' },
      { status: 500 }
    );
  }
}

export const POST = requireTenantAuth(handleConvertLead);