// API: افزودن معلم (فقط مدیر)

import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/auth';
import { executeQuery, executeTransaction } from '@/lib/db';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { fullName, nationalCode, phoneNumber, password } = req.body;

    // اعتبارسنجی
    if (!fullName || !nationalCode || !phoneNumber || !password) {
      return res.status(400).json({ message: 'تمام فیلدها الزامی هستند' });
    }

    if (nationalCode.length !== 10) {
      return res.status(400).json({ message: 'کد ملی باید 10 رقم باشد' });
    }

    if (phoneNumber.length !== 11) {
      return res.status(400).json({ message: 'شماره تلفن باید 11 رقم باشد' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
    }

    try {
      // بررسی تکراری نبودن کد ملی
      const existing: any = await executeQuery(
        'SELECT id FROM user WHERE nationalCode = ?',
        [nationalCode]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'این کد ملی قبلاً ثبت شده است' });
      }

      // هش کردن رمز عبور
      const hashedPassword = await bcrypt.hash(password, 10);

      // درج معلم جدید (roleId = 2 برای معلم)
      const result: any = await executeQuery(
        'INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId) VALUES (?, ?, ?, ?, ?)',
        [fullName, nationalCode, phoneNumber, hashedPassword, UserRole.TEACHER]
      );

      return res.status(201).json({
        message: 'معلم با موفقیت اضافه شد',
        id: result.insertId,
        fullName,
        nationalCode,
        phoneNumber,
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      return res.status(500).json({ message: 'خطای سرور' });
    }
  },
  { requiredRole: UserRole.ADMIN }
);
