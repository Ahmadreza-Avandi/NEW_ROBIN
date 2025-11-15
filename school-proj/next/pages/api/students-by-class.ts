import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { classId } = req.query;

  if (!classId) {
    return res.status(400).json({ message: 'شناسه کلاس الزامی است' });
  }

  try {
    // کوئری برای دریافت همه دانش‌آموزان یک کلاس
    const query = `
      SELECT 
        u.id,
        u.nationalCode,
        u.fullName,
        c.name as className
      FROM user u
      JOIN class c ON u.classId = c.id
      WHERE u.classId = ? AND u.roleId = 3
      ORDER BY u.fullName ASC
    `;
    
    const students = await executeQuery(query, [classId]);
    
    return res.status(200).json(students);
  } catch (error: unknown) {
    console.error('Error fetching students by class:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 