import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-jalaali';

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
      const [documents] = await conn.query(
        `SELECT id, title, original_filename, file_path, file_size, mime_type, 
                uploaded_by, created_at 
         FROM documents 
         WHERE tenant_key = ?
         ORDER BY created_at DESC`,
        [tenantKey]
      ) as any[];

      return NextResponse.json({
        success: true,
        documents: documents
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📄 POST /api/tenant/documents - شروع');
    
    const tenantKey = request.headers.get('X-Tenant-Key');
    console.log('🔑 Tenant Key:', tenantKey);

    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }

    const session = getTenantSessionFromRequest(request, tenantKey);
    console.log('👤 Session:', session ? 'Found' : 'Not found');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز' },
        { status: 401 }
      );
    }

    // دریافت فرم‌دیتا
    console.log('📦 دریافت FormData...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';
    const accessLevel = (formData.get('accessLevel') as string) || 'private';
    const tags = (formData.get('tags') as string) || '';

    console.log('📁 File:', file ? file.name : 'No file');
    console.log('📝 Title:', title);

    if (!file) {
      console.log('❌ فایل یافت نشد');
      return NextResponse.json(
        { success: false, error: 'فایل انتخاب نشده' },
        { status: 400 }
      );
    }

    // بررسی نوع فایل
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
      return NextResponse.json(
        { success: false, error: 'نوع فایل مجاز نیست' },
        { status: 400 }
      );
    }

    // حداکثر 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم فایل بیش از حد مجاز است' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تولید نام فایل
    const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
    const storedFilename = `${uuidv4()}.${fileExtension || 'bin'}`;

    // مسیر uploads
    const uploadDir = join(process.cwd(), 'uploads', 'documents');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Error creating upload directory:', mkdirError);
    }

    const absFilePath = join(uploadDir, storedFilename);

    try {
      await writeFile(absFilePath, buffer);
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return NextResponse.json(
        { success: false, error: 'خطا در نوشتن فایل' },
        { status: 500 }
      );
    }

    // ثبت در دیتابیس
    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const documentId = uuidv4();
      const userId = (session as any).user?.id || session.userId || 'unknown';

      // تاریخ فارسی
      moment.loadPersian({ dialect: 'persian-modern' });
      const persianDate = moment().format('jYYYY/jMM/jDD');

      // تبدیل tags به JSON اگر وجود داشت
      const tagsJson = tags ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : null;

      await conn.query(
        `INSERT INTO documents (
          id, tenant_key, title, description, original_filename, stored_filename,
          file_path, file_size, mime_type, file_extension, access_level,
          status, version, tags, persian_date, uploaded_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          documentId,
          tenantKey,
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
          tagsJson,
          persianDate,
          userId
        ]
      );

      return NextResponse.json({
        success: true,
        document: {
          id: documentId,
          title: title || file.name,
          filename: file.name,
          size: file.size,
          type: file.type
        }
      });
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('❌ Error uploading document:', error);
    console.error('❌ Error stack:', (error as Error).stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در آپلود فایل',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
