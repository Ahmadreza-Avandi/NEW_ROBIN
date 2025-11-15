import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await executeQuery<any[]>(
      `SELECT id, fullName, nationalCode, checkin_time, location, createdAt 
       FROM last_seen 
       ORDER BY checkin_time DESC 
       LIMIT 50`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching last_seen data:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات' });
  }
}
