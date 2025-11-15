import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId } = req.body;

    // اعتبارسنجی ورودی‌های الزامی
    if (!fullName || !nationalCode || !phoneNumber || !password) {
      return res.status(400).json({ message: 'لطفا همه فیلدهای الزامی را پر کنید' });
    }

    try {
      // بررسی تکراری بودن کد ملی
      const existingUser = await executeQuery<any[]>(
        'SELECT id FROM user WHERE nationalCode = ?',
        [nationalCode]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'کاربری با این کد ملی قبلاً ثبت شده است' });
      }

      // هش کردن پسورد
      const hashedPassword = await bcrypt.hash(password, 10);

      // درج کاربر جدید
      const result = await executeQuery(
        `INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName,
          nationalCode,
          phoneNumber,
          hashedPassword,
          roleId || 2,
          majorId || null,
          gradeId || null,
          classId || null
        ]
      );

      return res.status(200).json({ 
        message: 'کاربر با موفقیت ثبت شد',
        userId: (result as any).insertId 
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      return res.status(500).json({ message: 'خطا در ثبت کاربر' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
