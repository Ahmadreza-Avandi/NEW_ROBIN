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
      // دریافت لیست نقش‌ها
      const roles: any = await executeQuery(
        `SELECT id, name, permissions, createdAt FROM role ORDER BY id ASC`
      );

      // پارس کردن permissions از JSON string به object
      const parsedRoles = roles.map((role: any) => ({
        ...role,
        permissions: typeof role.permissions === 'string' 
          ? JSON.parse(role.permissions) 
          : role.permissions
      }));

      return res.status(200).json(parsedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({ message: 'خطای سرور' });
    }
  },
  { requiredRole: UserRole.ADMIN }
);
