import { NextApiRequest, NextApiResponse } from 'next';
import { executeTransaction } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { classId, subjectId, jalaliDate } = req.query;

  if (!classId || !subjectId || !jalaliDate) {
    return res.status(400).json({ message: 'کلاس، درس و تاریخ الزامی هستند' });
  }

  try {
    const result = await executeTransaction(async (connection) => {
      // استخراج اطلاعات درس (ساعت شروع و پایان)
      const subjectQuery = `
        SELECT 
          id,
          name,
          TIME_FORMAT(startTime, '%H:%i:%s') as startTime,
          TIME_FORMAT(endTime, '%H:%i:%s') as endTime
        FROM subject 
        WHERE id = ?
      `;

      const [subjectRows]: any = await connection.execute(subjectQuery, [subjectId]);
      
      if (subjectRows.length === 0) {
        throw new Error('درس یافت نشد');
      }

      const subject = subjectRows[0];

      // دریافت دانش‌آموزان حاضر در این تاریخ و این درس
      const attendanceQuery = `
        SELECT 
          a.id,
          a.nationalCode,
          a.fullName,
          a.checkin_time,
          a.status,
          a.subjectId,
          CASE 
            WHEN TIME(a.checkin_time) BETWEEN TIME(?) AND TIME(?) THEN 'در زمان'
            WHEN TIME(a.checkin_time) < TIME(?) THEN 'زودتر'
            ELSE 'دیرتر'
          END as time_status
        FROM attendance a
        WHERE a.jalali_date = ? 
        AND a.classId = ?
        AND (a.subjectId = ? OR a.subjectId IS NULL)
        AND a.status = 'present'
        ORDER BY a.checkin_time
      `;

      const [attendanceRows] = await connection.execute(attendanceQuery, [
        subject.startTime,
        subject.endTime,
        subject.startTime,
        jalaliDate,
        classId,
        subjectId
      ]);

      // آمار کلی
      const stats = {
        subjectInfo: subject,
        totalStudents: (attendanceRows as any[]).length,
        onTime: (attendanceRows as any[]).filter(row => row.time_status === 'در زمان').length,
        early: (attendanceRows as any[]).filter(row => row.time_status === 'زودتر').length,
        late: (attendanceRows as any[]).filter(row => row.time_status === 'دیرتر').length
      };

      return {
        subject: subject,
        attendance: attendanceRows,
        stats: stats
      };
    });
    
    return res.status(200).json(result);
    
  } catch (error: unknown) {
    console.error('Error comparing attendance with class time:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(error instanceof Error && error.message === 'درس یافت نشد' ? 404 : 500).json({ 
      message,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 