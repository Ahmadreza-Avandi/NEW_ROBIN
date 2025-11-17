import { NextApiRequest, NextApiResponse } from 'next';
import { getDbPool } from '@/lib/db';
import { decodeToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  
  // بررسی وجود توکن
  if (!authHeader) {
    return res.status(401).json({ message: 'توکن یافت نشد' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }

  // دیکد کردن توکن
  const user = decodeToken(token);
  if (!user) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }

  const pool = getDbPool();

  try {
    if (req.method === 'GET') {
      // دریافت اطلاعات کاربر از دیتابیس
      const query = `
        SELECT 
          u.id,
          u.fullName,
          u.nationalCode,
          u.phoneNumber,
          u.roleId,
          r.name as roleName,
          u.classId,
          c.name as className,
          u.majorId,
          m.name as majorName,
          u.gradeId,
          g.name as gradeName
        FROM user u
        LEFT JOIN role r ON u.roleId = r.id
        LEFT JOIN class c ON u.classId = c.id
        LEFT JOIN major m ON u.majorId = m.id
        LEFT JOIN grade g ON u.gradeId = g.id
        WHERE u.id = ?
      `;

      const [rows] = await pool.execute(query, [user.id]);
      const userData = (rows as any[])[0];

      if (!userData) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
      }

      // حذف رمز عبور از پاسخ
      return res.status(200).json(userData);

    } else if (req.method === 'PUT') {
      // به‌روزرسانی اطلاعات کاربر
      const { fullName, phoneNumber } = req.body;

      if (!fullName && !phoneNumber) {
        return res.status(400).json({ message: 'حداقل یک فیلد برای به‌روزرسانی لازم است' });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (fullName) {
        updates.push('fullName = ?');
        values.push(fullName);
      }

      if (phoneNumber) {
        updates.push('phoneNumber = ?');
        values.push(phoneNumber);
      }

      values.push(user.id);

      const updateQuery = `
        UPDATE user 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await pool.execute(updateQuery, values);

      return res.status(200).json({ 
        message: 'اطلاعات با موفقیت به‌روزرسانی شد',
        success: true 
      });

    } else {
      // اگر متد معتبر نیست
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return res.status(500).json({ 
      message: 'خطای سرور',
      error: error.message 
    });
  }
}
