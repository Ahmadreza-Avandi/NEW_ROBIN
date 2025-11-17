// API دریافت حاضری دانش‌آموز - فقط برای دانش‌آموزان

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { getDbPool } from '@/lib/db';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'تاریخ شروع و پایان الزامی است' 
      });
    }

    try {
      const pool = getDbPool();

      // کوئری برای دریافت حاضری‌های دانش‌آموز در بازه زمانی مشخص
      const query = `
        SELECT 
          a.jalali_date,
          a.checkin_time,
          a.status,
          s.name as subjectName,
          s.startTime,
          s.endTime,
          s.dayOfWeek
        FROM attendance a
        LEFT JOIN Subject s ON a.subjectId = s.id
        WHERE a.nationalCode = ?
          AND a.jalali_date BETWEEN ? AND ?
        ORDER BY a.jalali_date DESC, a.checkin_time DESC
      `;

      const [rows] = await pool.execute(query, [
        user.nationalCode,
        startDate,
        endDate
      ]);

      // گروه‌بندی بر اساس تاریخ
      const attendanceByDate: any = {};
      (rows as any[]).forEach((row) => {
        const date = row.jalali_date;
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = [];
        }
        attendanceByDate[date].push({
          subjectName: row.subjectName || 'نامشخص',
          startTime: row.startTime || '00:00:00',
          endTime: row.endTime || '00:00:00',
          status: row.status,
          checkin_time: row.checkin_time,
          dayOfWeek: row.dayOfWeek
        });
      });

      // تبدیل به آرایه برای نمایش راحت‌تر
      const attendance = (rows as any[]).map((row) => ({
        jalali_date: row.jalali_date,
        subjectName: row.subjectName || 'نامشخص',
        startTime: row.startTime || '00:00:00',
        endTime: row.endTime || '00:00:00',
        status: row.status,
        checkin_time: row.checkin_time,
        dayOfWeek: row.dayOfWeek
      }));

      return res.status(200).json({
        attendance,
        attendanceByDate,
        summary: {
          total: attendance.length,
          present: attendance.filter((a: any) => a.status === 'present').length,
          absent: attendance.filter((a: any) => a.status === 'absent').length
        }
      });
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      return res.status(500).json({ 
        message: 'خطای سرور',
        error: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    }
  },
  { requiredRole: UserRole.STUDENT }
);
