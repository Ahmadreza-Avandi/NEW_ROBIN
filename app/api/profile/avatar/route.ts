import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserFromToken } from '@/lib/auth';
import { executeSingle } from '@/lib/database';

export async function POST(req: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.get('auth-token')?.value ||
            req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'توکن یافت نشد' },
                { status: 401 }
            );
        }

        const userId = await getUserFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'توکن نامعتبر است' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'فایل انتخاب نشده است' },
                { status: 400 }
            );
        }

        // بررسی نوع فایل
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'فقط فایل‌های تصویری مجاز هستند' },
                { status: 400 }
            );
        }

        // بررسی سایز فایل (حداکثر 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' },
                { status: 400 }
            );
        }

        // تبدیل فایل به buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ایجاد نام فایل منحصر به فرد
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExtension}`;

        // مسیر ذخیره فایل
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
        const filePath = join(uploadDir, fileName);

        try {
            // ایجاد دایرکتوری اگر وجود ندارد
            await mkdir(uploadDir, { recursive: true });

            // ذخیره فایل
            await writeFile(filePath, buffer);
        } catch (error) {
            console.error('Error saving file:', error);
            return NextResponse.json(
                { success: false, message: 'خطا در ذخیره فایل' },
                { status: 500 }
            );
        }

        // به‌روزرسانی مسیر آواتار در دیتابیس
        const avatarUrl = `/uploads/avatars/${fileName}`;

        try {
            await executeSingle(
                'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
                [avatarUrl, userId]
            );
        } catch (error) {
            console.error('Error updating avatar in database:', error);
            return NextResponse.json(
                { success: false, message: 'خطا در به‌روزرسانی دیتابیس' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'تصویر پروفایل با موفقیت به‌روزرسانی شد',
            data: { avatar: avatarUrl }
        });

    } catch (error) {
        console.error('Avatar upload API error:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در آپلود تصویر' },
            { status: 500 }
        );
    }
}
