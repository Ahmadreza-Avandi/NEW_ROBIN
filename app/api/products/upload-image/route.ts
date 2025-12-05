import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    // بررسی نوع فایل
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'فقط فایل‌های تصویری مجاز هستند (JPG, PNG, WEBP, GIF)' },
        { status: 400 }
      );
    }

    // بررسی حجم فایل (حداکثر 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' },
        { status: 400 }
      );
    }

    // ساخت نام یونیک برای فایل
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // مسیر ذخیره‌سازی
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    // ساخت پوشه اگر وجود نداره
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // تبدیل فایل به Buffer و ذخیره
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, uniqueFileName);
    
    await writeFile(filePath, buffer);

    // URL عمومی فایل
    const fileUrl = `/uploads/products/${uniqueFileName}`;

    console.log('✅ Image uploaded:', fileUrl);

    return NextResponse.json({
      success: true,
      message: 'تصویر با موفقیت آپلود شد',
      data: {
        url: fileUrl,
        filename: uniqueFileName
      }
    });

  } catch (error) {
    console.error('❌ خطا در آپلود تصویر:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در آپلود تصویر' },
      { status: 500 }
    );
  }
}
