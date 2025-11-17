// API اعتبارسنجی توکن

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'school_proj_jwt_secret_local_dev';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // دریافت توکن از header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'توکن یافت نشد' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }

    // اعتبارسنجی توکن
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // ارسال اطلاعات کاربر
    return res.status(200).json({
      valid: true,
      user: {
        id: decoded.id,
        nationalCode: decoded.nationalCode,
        fullName: decoded.fullName,
        roleId: decoded.roleId,
        roleName: decoded.roleName,
        role: decoded.roleName, // برای سازگاری با کد قدیمی
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده است' });
  }
}
