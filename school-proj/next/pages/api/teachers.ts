// API دریافت لیست معلمان

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // دریافت لیست معلمان
      const teachers = await executeQuery(
        `SELECT 
          u.id,
          u.fullName,
          u.nationalCode,
          u.phoneNumber,
          u.roleId,
          r.name as roleName,
          u.createdAt
         FROM user u
         JOIN role r ON u.roleId = r.id
         WHERE u.roleId = ?
         ORDER BY u.fullName ASC`,
        [UserRole.TEACHER]
      );

      return res.status(200).json(teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return res.status(500).json({ message: 'خطای سرور' });
    }
  },
  { requiredRole: [UserRole.ADMIN, UserRole.TEACHER] }
);
