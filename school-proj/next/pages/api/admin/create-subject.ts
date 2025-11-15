// API: ایجاد درس (فقط مدیر)

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { executeTransaction } from '@/lib/db';
import { UserRole } from '@/lib/auth';

const VALID_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, classId, teacherId, dayOfWeek, startTime, endTime } = req.body;

    // اعتبارسنجی
    if (!name || !classId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'تمام فیلدها الزامی هستند' 
      });
    }

    if (!VALID_DAYS.includes(dayOfWeek)) {
      return res.status(400).json({ message: 'روز هفته نامعتبر است' });
    }

    try {
      const result = await executeTransaction(async (connection) => {
        // بررسی وجود کلاس
        const [classData]: any = await connection.execute(
          'SELECT id FROM class WHERE id = ?',
          [classId]
        );

        if (classData.length === 0) {
          throw new Error('کلاس یافت نشد');
        }

        // بررسی وجود معلم
        const [teacher]: any = await connection.execute(
          'SELECT id, roleId FROM user WHERE id = ?',
          [teacherId]
        );

        if (teacher.length === 0) {
          throw new Error('معلم یافت نشد');
        }

        // بررسی اینکه کاربر معلم یا مدیر باشد
        if (teacher[0].roleId !== UserRole.TEACHER && teacher[0].roleId !== UserRole.ADMIN) {
          throw new Error('کاربر انتخاب شده معلم نیست');
        }

        // بررسی تداخل زمانی برای معلم
        const [conflicts]: any = await connection.execute(
          `SELECT id FROM subject 
           WHERE teacherId = ? 
           AND dayOfWeek = ? 
           AND (
             (startTime <= ? AND endTime > ?) OR
             (startTime < ? AND endTime >= ?) OR
             (startTime >= ? AND endTime <= ?)
           )`,
          [teacherId, dayOfWeek, startTime, startTime, endTime, endTime, startTime, endTime]
        );

        if (conflicts.length > 0) {
          throw new Error('معلم در این زمان درس دیگری دارد');
        }

        // درج درس جدید
        const [insertResult]: any = await connection.execute(
          'INSERT INTO subject (name, classId, teacherId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)',
          [name, classId, teacherId, dayOfWeek, startTime, endTime]
        );

        return insertResult;
      });

      return res.status(201).json({
        message: 'درس با موفقیت ایجاد شد',
        id: result.insertId,
        name,
        classId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      const message = error instanceof Error ? error.message : 'خطای سرور';
      return res.status(400).json({ message });
    }
  },
  { requiredRole: UserRole.ADMIN }
);
