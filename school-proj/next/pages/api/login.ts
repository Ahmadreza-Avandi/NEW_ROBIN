// API لاگین - پیاده‌سازی کامل در Next.js

import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'school_proj_jwt_secret_local_dev';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { nationalCode, password } = req.body;

    // اعتبارسنجی ورودی
    if (!nationalCode || !password) {
      return res.status(400).json({ message: 'کد ملی و رمز عبور الزامی هستند' });
    }

    // جستجوی کاربر با اطلاعات نقش
    const users: any = await executeQuery(
      `SELECT u.id, u.fullName, u.nationalCode, u.password, u.roleId, r.name as roleName
       FROM user u
       JOIN role r ON u.roleId = r.id
       WHERE u.nationalCode = ?`,
      [nationalCode]
    );

    // بررسی وجود کاربر
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'کد ملی یا رمز عبور اشتباه است' });
    }

    const user = users[0];

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'کد ملی یا رمز عبور اشتباه است' });
    }

    // ساخت توکن JWT
    const token = jwt.sign(
      {
        id: user.id,
        nationalCode: user.nationalCode,
        fullName: user.fullName,
        roleId: user.roleId,
        roleName: user.roleName,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // توکن 7 روز معتبر است
    );

    // ارسال پاسخ موفق
    return res.status(200).json({
      access_token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        nationalCode: user.nationalCode,
        roleId: user.roleId,
        roleName: user.roleName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'خطای سرور' });
  }
}
