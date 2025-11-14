import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const nestjsUrl = process.env.NESTJS_API_URL || 'http://localhost:3001';
    const response = await axios.get(`${nestjsUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in /api/auth/me:', error); // چاپ ارور برای دیباگ
    res.status(401).json({ message: 'Unauthorized' });
  }
}
