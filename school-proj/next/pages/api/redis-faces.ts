import { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';

// اتصال به Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // دریافت تمام کلیدها از Redis
      const keys = await redis.keys('*');
      
      if (keys.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'هیچ داده‌ای در Redis یافت نشد',
          data: [],
          count: 0
        });
      }

      // دریافت دیتای هر کلید
      const faceData = await Promise.all(
        keys.map(async (key) => {
          try {
            const data = await redis.get(key);
            if (data) {
              const parsedData = JSON.parse(data);
              return {
                nationalCode: key,
                ...parsedData,
                // حذف تصویر برای کاهش حجم پاسخ (اختیاری)
                faceImage: parsedData.faceImage ? 
                  `${parsedData.faceImage.substring(0, 50)}...` : null,
                hasImage: !!parsedData.faceImage
              };
            }
            return null;
          } catch (error) {
            console.error(`خطا در خواندن کلید ${key}:`, error);
            return null;
          }
        })
      );

      // فیلتر کردن مقادیر null
      const validData = faceData.filter(item => item !== null);

      return res.status(200).json({
        success: true,
        message: 'دیتاها با موفقیت دریافت شدند',
        data: validData,
        count: validData.length
      });

    } catch (error) {
      console.error('خطا در دریافت دیتا از Redis:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در دریافت دیتا از Redis',
        error: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    }
  } else if (req.method === 'POST') {
    // دریافت دیتای یک کد ملی خاص
    const { nationalCode } = req.body;

    if (!nationalCode) {
      return res.status(400).json({
        success: false,
        message: 'کد ملی الزامی است'
      });
    }

    try {
      const data = await redis.get(nationalCode);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'کد ملی در Redis یافت نشد'
        });
      }

      const parsedData = JSON.parse(data);

      return res.status(200).json({
        success: true,
        message: 'دیتا با موفقیت دریافت شد',
        data: {
          nationalCode,
          ...parsedData
        }
      });

    } catch (error) {
      console.error('خطا در دریافت دیتا از Redis:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در دریافت دیتا از Redis',
        error: error instanceof Error ? error.message : 'خطای نامشخص'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }
}
