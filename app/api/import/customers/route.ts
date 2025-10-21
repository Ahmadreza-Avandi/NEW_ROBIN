import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
    try {
        const currentUserId = req.headers.get('x-user-id');

        if (!currentUserId) {
            return NextResponse.json(
                { success: false, message: 'کاربر احراز هویت نشده است' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const mappingsStr = formData.get('mappings') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'فایل انتخاب نشده است' },
                { status: 400 }
            );
        }

        if (!mappingsStr) {
            return NextResponse.json(
                { success: false, message: 'نقشه‌برداری فیلدها مشخص نشده است' },
                { status: 400 }
            );
        }

        const mappings = JSON.parse(mappingsStr);
        console.log('📥 Received mappings:', mappings);

        // Read file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (data.length < 2) {
            return NextResponse.json(
                { success: false, message: 'فایل خالی است یا فرمت صحیحی ندارد' },
                { status: 400 }
            );
        }

        const headers = data[0].map((h: any) => String(h).trim());
        console.log('📋 Excel headers:', headers);
        const rows = data.slice(1);
        console.log('📊 Total rows:', rows.length);

        // Convert mappings from {field_key: excel_header} to {field_key: column_index}
        const fieldToColumnIndex: Record<string, number> = {};
        Object.entries(mappings).forEach(([fieldKey, excelHeader]) => {
            if (excelHeader && excelHeader !== '__none__') {
                const columnIndex = headers.indexOf(excelHeader as string);
                if (columnIndex !== -1) {
                    fieldToColumnIndex[fieldKey] = columnIndex;
                }
            }
        });
        console.log('🗺️ Field to column index mapping:', fieldToColumnIndex);

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Process each row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Skip empty rows
            if (!row || row.every(cell => !cell)) {
                continue;
            }

            try {
                // Map row data to customer fields
                const customerData: any = {};

                Object.entries(fieldToColumnIndex).forEach(([fieldKey, columnIndex]) => {
                    const value = row[columnIndex];
                    if (value !== undefined && value !== null && value !== '') {
                        // تمیز کردن مقدار (حذف فاصله‌های اضافی)
                        customerData[fieldKey] = typeof value === 'string' ? value.trim() : value;
                    }
                });

                // Validate required fields
                if (!customerData.name) {
                    errors.push(`ردیف ${i + 2}: نام و نام خانوادگی الزامی است`);
                    errorCount++;
                    continue;
                }

                // تعیین segment بر اساس company_name
                // اگر segment در اکسل مشخص نشده باشد، بر اساس company_name تعیین می‌شود
                if (!customerData.segment) {
                    customerData.segment = customerData.company_name ? 'small_business' : 'individual';
                }

                // Validate segment value و تبدیل مقادیر نامعتبر
                const validSegments = ['enterprise', 'small_business', 'individual'];
                
                // تبدیل medium_business به small_business
                if (customerData.segment === 'medium_business') {
                    customerData.segment = 'small_business';
                }
                
                if (!validSegments.includes(customerData.segment)) {
                    errors.push(`ردیف ${i + 2}: بخش "${customerData.segment}" نامعتبر است - باید یکی از: enterprise, small_business, individual`);
                    errorCount++;
                    continue;
                }

                // Validate priority if provided
                if (customerData.priority) {
                    const validPriorities = ['low', 'medium', 'high'];
                    if (!validPriorities.includes(customerData.priority)) {
                        errors.push(`ردیف ${i + 2}: اولویت باید یکی از مقادیر low, medium, high باشد`);
                        errorCount++;
                        continue;
                    }
                }

                // Generate UUID for customer
                const customerId = uuidv4();

                // Insert customer
                await executeSingle(`
          INSERT INTO customers (
            id, name, company_name, segment, email, phone, website, address, city, state,
            industry, company_size, annual_revenue, priority, assigned_to,
            status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
                    customerId,
                    customerData.name,
                    customerData.company_name || null,
                    customerData.segment,
                    customerData.email || null,
                    customerData.phone || null,
                    customerData.website || null,
                    customerData.address || null,
                    customerData.city || null,
                    customerData.state || null,
                    customerData.industry || null,
                    customerData.company_size || null,
                    customerData.annual_revenue || null,
                    customerData.priority || 'medium',
                    currentUserId,
                    'prospect'
                ]);

                successCount++;
            } catch (error) {
                console.error(`Error importing row ${i + 2}:`, error);
                errors.push(`ردیف ${i + 2}: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `${successCount} مشتری با موفقیت وارد شد${errorCount > 0 ? ` و ${errorCount} خطا رخ داد` : ''}`,
            stats: {
                successful: successCount,
                failed: errorCount,
                total: successCount + errorCount
            },
            errors: errors.slice(0, 10) // Return first 10 errors only
        });

    } catch (error) {
        console.error('Import customers API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'خطا در وارد کردن مشتریان',
                error: error instanceof Error ? error.message : 'خطای نامشخص'
            },
            { status: 500 }
        );
    }
}