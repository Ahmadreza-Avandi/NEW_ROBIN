import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import axios from 'axios';
import express, { Request, Response } from 'express';
import FormData from 'form-data';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

interface RequestWithFiles extends NextApiRequest {
  files: any[];
}

export default async (req: RequestWithFiles, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const expressReq = req as unknown as express.Request;
      const expressReqTyped = expressReq as Request;
      const expressRes = res as unknown as express.Response;
      const expressResTyped = expressRes as Response;

      upload.any()(expressReqTyped, expressResTyped, async (err) => {
        if (err) {
          console.error(err);
          return expressRes.status(500).json({ message: 'خطا در پردازش درخواست' });
        }

        const { files, body } = req;
        const { firstName, lastName, nationalCode, studentId } = body;
        const face = files && files.length > 0 ? files[0].buffer : null;

        if (!face) {
          return res.status(400).json({ message: 'تصویر چهره الزامی است' });
        }

        // ارسال به Python API برای ثبت چهره
        const pythonUrl = process.env.PYTHON_API_URL || 'http://pythonserver:5000';
        
        const formData = new FormData();
        formData.append('face', face, 'face.jpg');
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('nationalCode', nationalCode);
        if (studentId) formData.append('studentId', studentId);

        const response = await axios.post(
          `${pythonUrl}/register-face`,
          formData,
          {
            headers: formData.getHeaders()
          }
        );

        return res.status(200).json(response.data);
      });
    } catch (error: any) {
      console.error('Error in new-person:', error);
      return res.status(500).json({ 
        message: error.response?.data?.message || 'خطا در ثبت چهره' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
