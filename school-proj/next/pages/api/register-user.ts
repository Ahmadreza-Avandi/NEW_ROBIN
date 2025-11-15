import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId } = req.body;

    // اعتبارسنجی ورودی‌های الزامی
    if (!fullName || !nationalCode || !phoneNumber || !password) {
      return res.status(400).json({ message: 'لطفا همه فیلدهای الزامی را پر کنید' });
    }

    // بررسی تکراری نبودن کد ملی
    const existingUser: any = await executeQuery(
      'SELECT id FROM user WHERE nationalCode = ?',
      [nationalCode]
    );

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: 'کاربری با این کد ملی قبلاً ثبت‌نام کرده است' });
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // تنظیم مقادیر پیش‌فرض
    const finalRoleId = roleId || 3; // دانش‌آموز
    const finalMajorId = majorId && majorId !== 0 ? majorId : null;
    const finalGradeId = gradeId && gradeId !== 0 ? gradeId : null;

    // درج کاربر جدید
    const result: any = await executeQuery(
      `INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
      [fullName, nationalCode, phoneNumber, hashedPassword, finalRoleId, finalMajorId, finalGradeId]
    );

    console.log('User registered successfully:', { id: result.insertId, nationalCode });

    return res.status(201).json({
      message: 'ثبت‌نام با موفقیت انجام شد',
      userId: result.insertId,
    });

  } catch (error: any) {
    console.error('Error registering user:', error);
    return res.status(500).json({ 
      message: 'خطای سرور در ثبت‌نام',
      error: error.message 
    });
  }
}
