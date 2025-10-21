import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromToken, hasModulePermission } from '@/lib/auth';
import { convertToJalali } from '@/lib/persian-date';
import { unlink } from 'fs/promises';
import { executeQuery, executeSingle } from '@/lib/database';

function mapAccessLevel(level?: string): 'public' | 'private' | 'restricted' | 'confidential' {
    switch ((level || '').toLowerCase()) {
        case 'public':
            return 'public';
        case 'restricted':
            return 'restricted';
        case 'confidential':
            return 'confidential';
        // مقدار قدیمی internal به private نگاشت می‌شود
        case 'internal':
        default:
            return 'private';
    }
}

// آپلود سند جدید
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد - فعلاً غیرفعال برای تست
        // const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        // if (!hasDocsAccess) {
        //   return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        // }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = (formData.get('title') as string) || '';
        const description = (formData.get('description') as string) || '';
        const accessLevelRaw = (formData.get('accessLevel') as string) || 'private';
        const tagsRaw = (formData.get('tags') as string) || '';

        if (!file) {
            return NextResponse.json({ error: 'فایل انتخاب نشده' }, { status: 400 });
        }

        // بررسی نوع فایل مجاز
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'نوع فایل مجاز نیست' }, { status: 400 });
        }

        // حداکثر 50MB
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'حجم فایل بیش از حد مجاز است' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // تولید نام فایل ذخیره شده
        const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
        const storedFilename = `${uuidv4()}.${fileExtension || 'bin'}`;

        // مسیر uploads برای Docker و Local
        const uploadDir = join(process.cwd(), 'uploads', 'documents');

        console.log('Upload directory path:', uploadDir);
        console.log('Current working directory:', process.cwd());
        console.log('Environment:', process.env.NODE_ENV);
        console.log('User ID:', process.getuid ? process.getuid() : 'N/A');
        console.log('Group ID:', process.getgid ? process.getgid() : 'N/A');

        try {
            await mkdir(uploadDir, { recursive: true });
            console.log('Upload directory created successfully');

            // بررسی مجوزهای نوشتن
            const { access, constants } = await import('fs/promises');
            await access(uploadDir, constants.W_OK);
            console.log('Write permission confirmed for upload directory');
        } catch (mkdirError) {
            console.error('Error creating upload directory:', mkdirError);
            console.error('Upload directory details:', {
                path: uploadDir,
                exists: await import('fs').then(fs => fs.existsSync(uploadDir)),
                stats: await import('fs/promises').then(fs =>
                    fs.stat(uploadDir).catch(() => null)
                )
            });
            throw new Error('خطا در ایجاد پوشه آپلود');
        }

        const absFilePath = join(uploadDir, storedFilename);
        console.log('Absolute file path:', absFilePath);

        try {
            await writeFile(absFilePath, buffer);
            console.log('File written successfully to:', absFilePath);
        } catch (writeError) {
            console.error('Error writing file:', writeError);
            throw new Error('خطا در نوشتن فایل');
        }

        // ثبت در دیتابیس طبق ساختار جدید
        const documentId = uuidv4();
        const persianDate = convertToJalali(new Date());
        const accessLevel = mapAccessLevel(accessLevelRaw);

        // برچسب‌ها را به JSON تبدیل می‌کنیم (آرایه رشته‌ها)
        const tags = tagsRaw
            ? JSON.stringify(
                tagsRaw
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
            )
            : null;

        try {
            // بررسی اتصال دیتابیس قبل از insert
            console.log('Testing database connection...');
            const { testConnection } = await import('@/lib/database');
            const isConnected = await testConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }
            console.log('Database connection successful');

            console.log('Inserting document with data:', {
                documentId,
                title: title || file.name,
                description: description || null,
                original_filename: file.name,
                stored_filename: storedFilename,
                file_path: `/uploads/documents/${storedFilename}`,
                file_size: file.size,
                mime_type: file.type,
                file_extension: fileExtension,
                access_level: accessLevel,
                status: 'active',
                version: 1,
                tags,
                persian_date: persianDate,
                uploaded_by: user.id
            });

            // بررسی وجود جدول documents
            try {
                await executeSingle('SELECT 1 FROM documents LIMIT 1');
                console.log('Documents table exists');
            } catch (tableError) {
                console.error('Documents table check failed:', tableError);
                throw new Error('جدول اسناد در دیتابیس وجود ندارد');
            }

            await executeSingle(
                `INSERT INTO documents (
            id,
            title,
            description,
            original_filename,
            stored_filename,
            file_path,
            file_size,
            mime_type,
            file_extension,
            access_level,
            status,
            version,
            tags,
            persian_date,
            uploaded_by,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    documentId,
                    title || file.name,
                    description || null,
                    file.name,
                    storedFilename,
                    `/uploads/documents/${storedFilename}`,
                    file.size,
                    file.type,
                    fileExtension,
                    accessLevel,
                    'active',
                    1,
                    tags,
                    persianDate,
                    user.id,
                ],
            );

            console.log('Document inserted successfully');
        } catch (dbError) {
            console.error('Database error:', dbError);
            console.error('Error details:', {
                code: (dbError as any).code,
                errno: (dbError as any).errno,
                sqlMessage: (dbError as any).sqlMessage,
                sqlState: (dbError as any).sqlState
            });

            // حذف فایل آپلود شده در صورت خطا
            try {
                await unlink(absFilePath);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }

            // ارسال پیام خطای دقیق‌تر
            const errorMessage = (dbError as any).sqlMessage || 'خطا در ذخیره اطلاعات در دیتابیس';
            throw new Error(errorMessage);
        }

        // ثبت لاگ فعالیت اسناد
        try {
            await executeSingle(
                `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address)
           VALUES (UUID(), ?, ?, 'upload', ?, ?)`,
                [
                    documentId,
                    user.id,
                    JSON.stringify({ title: title || file.name, size: file.size, mime: file.type }),
                    (request as any).ip || 'unknown',
                ],
            );
            console.log('Activity log inserted successfully');
        } catch (logError) {
            console.error('Error inserting activity log:', logError);
            // ادامه می‌دهیم حتی اگر لاگ ثبت نشود
        }

        return NextResponse.json({
            success: true,
            document: {
                id: documentId,
                title: title || file.name,
                filename: file.name,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error('خطا در آپلود فایل:', error);

        // ارسال پیام خطای دقیق‌تر بر اساس نوع خطا
        let errorMessage = 'خطا در آپلود فایل';

        if (error instanceof Error) {
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                errorMessage = 'جدول اسناد در دیتابیس وجود ندارد';
            } else if (error.message.includes('ER_ACCESS_DENIED')) {
                errorMessage = 'خطای دسترسی به دیتابیس';
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'خطا در اتصال به دیتابیس';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}

// دریافت لیست اسناد
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد - فعلاً غیرفعال برای تست
        // const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        // if (!hasDocsAccess) {
        //   return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        // }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const search = searchParams.get('search') || '';
        const accessLevel = searchParams.get('accessLevel') || '';
        const documentType = searchParams.get('documentType') || '';
        const contentType = searchParams.get('contentType') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        let whereClause = 'WHERE d.status != "deleted"';
        const queryParams: any[] = [];

        // دسترسی کاربر - فعلاً غیرفعال برای تست
        // if (user.role !== 'ceo') {
        //     whereClause += ` AND (
        // d.uploaded_by = ? OR 
        // d.access_level = 'public' OR
        // EXISTS (
        //   SELECT 1 FROM document_shares ds 
        //   WHERE ds.document_id = d.id AND ds.shared_with_user_id = ?
        // )
        //   )`;
        //     queryParams.push(user.id, user.id);
        // }

        if (search) {
            // استفاده از LIKE ساده برای سازگاری
            whereClause += ' AND (d.title LIKE ? OR d.description LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (accessLevel) {
            whereClause += ' AND d.access_level = ?';
            queryParams.push(mapAccessLevel(accessLevel));
        }

        if (documentType) {
            switch (documentType) {
                case 'contract':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('application/pdf');
                    break;
                case 'presentation':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('image/%');
                    break;
                case 'report':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('text/%');
                    break;
                case 'invoice':
                    whereClause += ' AND (d.mime_type LIKE ? OR d.mime_type LIKE ?)';
                    queryParams.push('application/vnd.ms-excel%', 'application/vnd.openxmlformats-officedocument.spreadsheetml%');
                    break;
                case 'other':
                    whereClause += ' AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ?';
                    queryParams.push('application/pdf', 'image/%', 'text/%', 'application/vnd.ms-excel%', 'application/vnd.openxmlformats-officedocument.spreadsheetml%');
                    break;
            }
        }

        if (contentType) {
            switch (contentType) {
                case 'photo':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('image/%');
                    break;
                case 'video':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('video/%');
                    break;
                case 'audio':
                    whereClause += ' AND d.mime_type LIKE ?';
                    queryParams.push('audio/%');
                    break;
                case 'document':
                    whereClause += ' AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ? AND d.mime_type NOT LIKE ?';
                    queryParams.push('image/%', 'video/%', 'audio/%');
                    break;
            }
        }

        if (dateFrom) {
            whereClause += ' AND DATE(d.created_at) >= ?';
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            whereClause += ' AND DATE(d.created_at) <= ?';
            queryParams.push(dateTo);
        }

        const offset = (page - 1) * limit;

        const documents = await executeQuery(
            `SELECT 
        d.id,
        d.title,
        d.description,
        CASE 
            WHEN d.mime_type LIKE 'application/pdf' THEN 'contract'
            WHEN d.mime_type LIKE 'image/%' THEN 'presentation'
            WHEN d.mime_type LIKE 'text/%' THEN 'report'
            WHEN d.mime_type LIKE 'application/vnd.ms-excel%' OR d.mime_type LIKE 'application/vnd.openxmlformats-officedocument.spreadsheetml%' THEN 'invoice'
            ELSE 'other'
        END as document_type,
        CASE 
            WHEN d.mime_type LIKE 'image/%' THEN 'photo'
            WHEN d.mime_type LIKE 'video/%' THEN 'video'
            WHEN d.mime_type LIKE 'audio/%' THEN 'audio'
            ELSE 'document'
        END as content_type,
        d.status,
        d.file_extension as format,
        d.stored_filename as file_name,
        d.original_filename as original_name,
        d.file_path,
        d.file_size,
        d.mime_type,
        CAST(d.version AS CHAR) as version,
        CASE WHEN d.access_level = 'public' THEN 1 ELSE 0 END as is_public,
        d.access_level,
        d.tags,
        d.download_count,
        IFNULL(d.persian_date, DATE_FORMAT(d.created_at, '%Y/%m/%d')) as persian_date,
        u.name as uploaded_by_name,
        d.created_at
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset],
        );

        const countResult = await executeSingle(
            `SELECT COUNT(*) as total FROM documents d ${whereClause}`,
            queryParams,
        );

        return NextResponse.json({
            documents,
            pagination: {
                page,
                limit,
                total: countResult.total,
                totalPages: Math.ceil((countResult.total as number) / limit),
            },
        });
    } catch (error) {
        console.error('خطا در دریافت اسناد:', error);

        let errorMessage = 'خطا در دریافت اسناد';

        if (error instanceof Error) {
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                errorMessage = 'جدول اسناد در دیتابیس وجود ندارد';
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'خطا در اتصال به دیتابیس';
            }
        }

        return NextResponse.json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}

// حذف سند
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد - فعلاً غیرفعال برای تست
        // const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        // if (!hasDocsAccess) {
        //     return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        // }

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('id');

        if (!documentId) {
            return NextResponse.json({ error: 'شناسه سند الزامی است' }, { status: 400 });
        }

        // بررسی وجود سند
        const document = await executeSingle(
            'SELECT id, uploaded_by, file_path FROM documents WHERE id = ?',
            [documentId]
        );

        if (!document) {
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        // بررسی مجوز حذف (فقط سازنده یا CEO)
        if (user.role !== 'ceo' && document.uploaded_by !== user.id) {
            return NextResponse.json({ error: 'مجوز حذف ندارید' }, { status: 403 });
        }

        // حذف سند از دیتابیس
        await executeSingle(
            'UPDATE documents SET status = "deleted" WHERE id = ?',
            [documentId]
        );

        // ثبت لاگ حذف
        await executeSingle(
            `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address)
             VALUES (UUID(), ?, ?, 'delete', ?, ?)`,
            [
                documentId,
                user.id,
                JSON.stringify({ reason: 'user_request' }),
                (request as any).ip || 'unknown',
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'سند با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف سند:', error);
        return NextResponse.json({ error: 'خطا در حذف سند' }, { status: 500 });
    }
}