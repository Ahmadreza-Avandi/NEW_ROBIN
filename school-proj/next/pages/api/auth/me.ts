import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // تایید توکن
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // دریافت اطلاعات کاربر از دیتابیس
    const users = await executeQuery<any[]>(
      `SELECT u.id, u.fullName, u.nationalCode, u.phoneNumber, u.roleId,
              r.name as roleName, r.permissions,
              c.name as className, m.name as majorName, g.name as gradeName
       FROM user u
       LEFT JOIN role r ON u.roleId = r.id
       LEFT JOIN class c ON u.classId = c.id
       LEFT JOIN major m ON u.majorId = m.id
       LEFT JOIN grade g ON u.gradeId = g.id
       WHERE u.id = ?`,
      [decoded.userId || decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'کاربر یافت نشد' });
    }

    const user = users[0];
    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      nationalCode: user.nationalCode,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions ? JSON.parse(user.permissions) : {},
      className: user.className,
      majorName: user.majorName,
      gradeName: user.gradeName
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
}
