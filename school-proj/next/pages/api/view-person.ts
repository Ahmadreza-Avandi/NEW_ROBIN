// pages/api/persons.ts
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const nestjsUrl = process.env.NESTJS_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${nestjsUrl}/new-person`);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
