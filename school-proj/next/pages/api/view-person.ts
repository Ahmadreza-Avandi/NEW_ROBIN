import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const persons = await executeQuery<any[]>(
        `SELECT u.id, u.fullName, u.nationalCode, u.phoneNumber, 
                r.name as roleName, c.name as className, 
                m.name as majorName, g.name as gradeName
         FROM user u
         LEFT JOIN role r ON u.roleId = r.id
         LEFT JOIN class c ON u.classId = c.id
         LEFT JOIN major m ON u.majorId = m.id
         LEFT JOIN grade g ON u.gradeId = g.id
         ORDER BY u.createdAt DESC`
      );
      res.status(200).json(persons);
    } catch (error) {
      console.error('Error fetching persons:', error);
      res.status(500).json({ error: 'خطا در دریافت اطلاعات' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
