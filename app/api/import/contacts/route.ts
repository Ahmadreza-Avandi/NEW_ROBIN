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
                // Map row data to contact fields
                const contactData: any = {};

                Object.entries(fieldToColumnIndex).forEach(([fieldKey, columnIndex]) => {
                    const value = row[columnIndex];
                    if (value !== undefined && value !== null && value !== '') {
                        contactData[fieldKey] = value;
                    }
                });

                // Validate required fields
                if (!contactData.first_name) {
                    errors.push(`ردیف ${i + 2}: نام الزامی است`);
                    errorCount++;
                    continue;
                }

                if (!contactData.last_name) {
                    errors.push(`ردیف ${i + 2}: نام خانوادگی الزامی است`);
                    errorCount++;
                    continue;
                }

                // Validate source if provided
                if (contactData.source) {
                    const validSources = ['website', 'referral', 'social_media', 'cold_call', 'trade_show', 'other'];
                    if (!validSources.includes(contactData.source)) {
                        errors.push(`ردیف ${i + 2}: منبع باید یکی از مقادیر website, referral, social_media, cold_call, trade_show, other باشد`);
                        errorCount++;
                        continue;
                    }
                }

                // Generate UUID for contact
                const contactId = uuidv4();

                // Insert contact
                await executeSingle(`
          INSERT INTO contacts (
            id, first_name, last_name, job_title, department, email, phone, mobile,
            source, linkedin_url, twitter_url, address, city, country, notes,
            assigned_to, created_by, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
                    contactId,
                    contactData.first_name,
                    contactData.last_name,
                    contactData.job_title || null,
                    contactData.department || null,
                    contactData.email || null,
                    contactData.phone || null,
                    contactData.mobile || null,
                    contactData.source || 'other',
                    contactData.linkedin_url || null,
                    contactData.twitter_url || null,
                    contactData.address || null,
                    contactData.city || null,
                    contactData.country || null,
                    contactData.notes || null,
                    currentUserId,
                    currentUserId,
                    'active'
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
            message: `${successCount} مخاطب با موفقیت وارد شد${errorCount > 0 ? ` و ${errorCount} خطا رخ داد` : ''}`,
            stats: {
                successful: successCount,
                failed: errorCount,
                total: successCount + errorCount
            },
            errors: errors.slice(0, 10) // Return first 10 errors only
        });

    } catch (error) {
        console.error('Import contacts API error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'خطا در وارد کردن مخاطبین',
                error: error instanceof Error ? error.message : 'خطای نامشخص'
            },
            { status: 500 }
        );
    }
}