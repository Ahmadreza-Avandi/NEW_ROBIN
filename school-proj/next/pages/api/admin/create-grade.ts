// API: ایجاد پایه تحصیلی (فقط مدیر)

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'نام پایه الزامی است' });
    }

    try {
      // بررسی تکراری نبودن
      const existing: any = await executeQuery(
        'SELECT id FROM grade WHERE name = ?',
        [name]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'این پایه قبلاً ثبت شده است' });
      }

      // درج پایه جدید
      const result: any = await executeQuery(
        'INSERT INTO grade (name) VALUES (?)',
        [name]
      );

      return res.status(201).json({
        message: 'پایه با موفقیت ایجاد شد',
        id: result.insertId,
        name,
      });
    } catch (error) {
      console.error('Error creating grade:', error);
      return res.status(500).json({ message: 'خطای سرور' });
    }
  },
  { requiredRole: UserRole.ADMIN }
);
