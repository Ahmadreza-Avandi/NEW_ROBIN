import { NextApiRequest, NextApiResponse } from 'next';
import { getDbPool } from '@/lib/db';
import Redis from 'ioredis';

// اتصال به Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { classId, date } = req.query;
    
    if (!classId || !date) {
      return res.status(400).json({ 
        success: false,
        message: 'پارامترهای classId و date الزامی هستند' 
      });
    }
    
    try {
      const pool = getDbPool();
      
      // دریافت دانش‌آموزان از MySQL
      const studentsQuery = `
        SELECT 
          u.id as userId,
          u.nationalCode,
          u.fullName,
          c.name as className,
          u.classId,
          a.id,
          TIME_FORMAT(a.checkin_time, '%H:%i:%s') as checkin_time,
          a.jalali_date,
          COALESCE(a.status, 'absent') as status
        FROM User u
        JOIN Class c ON u.classId = c.id
        LEFT JOIN attendance a ON a.nationalCode = u.nationalCode 
          AND a.jalali_date = ?
        WHERE u.classId = ? AND u.roleId = 3
        ORDER BY u.fullName ASC
      `;
      
      const [students]: any = await pool.execute(studentsQuery, [date, classId]);
      
      // اضافه کردن تصاویر از Redis
      const studentsWithPhotos = await Promise.all(
        students.map(async (student: any) => {
          try {
            // دریافت تصویر از Redis
            const redisData = await redis.get(student.nationalCode);
            
            if (redisData) {
              const userData = JSON.parse(redisData);
              return {
                ...student,
                faceImage: userData.faceImage || null,
                detectionTime: userData.detectionTime || null,
                hasPhoto: !!userData.faceImage
              };
            }
            
            return {
              ...student,
              faceImage: null,
              detectionTime: null,
              hasPhoto: false
            };
          } catch (error) {
            console.error(`خطا در دریافت تصویر برای کد ملی ${student.nationalCode}:`, error);
            return {
              ...student,
              faceImage: null,
              detectionTime: null,
              hasPhoto: false
            };
          }
        })
      );
      
      return res.status(200).json({
        success: true,
        data: studentsWithPhotos,
        count: studentsWithPhotos.length
      });
      
    } catch (error) {
      console.error('خطا در دریافت اطلاعات:', error);
      return res.status(500).json({
        success: false,
        message: 'خطای سرور',
        error: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }
}
