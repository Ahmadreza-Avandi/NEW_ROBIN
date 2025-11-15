// API: ایجاد کلاس (فقط مدیر)

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { executeTransaction } from '@/lib/db';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, majorId, gradeId } = req.body;

    // اعتبارسنجی
    if (!name || !majorId || !gradeId) {
      return res.status(400).json({ 
        message: 'نام کلاس، رشته و پایه الزامی هستند' 
      });
    }

    try {
      const result = await executeTransaction(async (connection) => {
        // بررسی وجود رشته و پایه
        const [major]: any = await connection.execute(
          'SELECT id FROM major WHERE id = ?',
          [majorId]
        );

        const [grade]: any = await connection.execute(
          'SELECT id FROM grade WHERE id = ?',
          [gradeId]
        );

        if (major.length === 0) {
          throw new Error('رشته یافت نشد');
        }

        if (grade.length === 0) {
          throw new Error('پایه یافت نشد');
        }

        // بررسی تکراری نبودن
        const [existing]: any = await connection.execute(
          'SELECT id FROM class WHERE name = ? AND majorId = ? AND gradeId = ?',
          [name, majorId, gradeId]
        );

        if (existing.length > 0) {
          throw new Error('این کلاس قبلاً ثبت شده است');
        }

        // درج کلاس جدید
        const [insertResult]: any = await connection.execute(
          'INSERT INTO class (name, majorId, gradeId) VALUES (?, ?, ?)',
          [name, majorId, gradeId]
        );

        return insertResult;
      });

      return res.status(201).json({
        message: 'کلاس با موفقیت ایجاد شد',
        id: result.insertId,
        name,
        majorId,
        gradeId,
      });
    } catch (error) {
      console.error('Error creating class:', error);
      const message = error instanceof Error ? error.message : 'خطای سرور';
      return res.status(400).json({ message });
    }
  },
  { requiredRole: UserRole.ADMIN }
);
