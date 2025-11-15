#!/usr/bin/env python3
"""
اسکریپت تست اتصالات به MySQL و Redis
"""

import os
import mysql.connector
import redis
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
load_dotenv()

def test_mysql():
    """تست اتصال به MySQL"""
    print("🔍 در حال تست اتصال به MySQL...")
    try:
        db = mysql.connector.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            database=os.environ.get('MYSQL_DATABASE', 'school'),
            user=os.environ.get('MYSQL_USER', 'crm_user'),
            password=os.environ.get('MYSQL_PASSWORD', '1234'),
            port=int(os.environ.get('MYSQL_PORT', '3306'))
        )
        
        cursor = db.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        
        print(f"✅ اتصال به MySQL موفق بود!")
        print(f"   نسخه: {version[0]}")
        print(f"   دیتابیس: {os.environ.get('MYSQL_DATABASE', 'school')}")
        
        # تست جداول
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"   تعداد جداول: {len(tables)}")
        
        cursor.close()
        db.close()
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ خطا در اتصال به MySQL: {err}")
        return False

def test_redis():
    """تست اتصال به Redis"""
    print("\n🔍 در حال تست اتصال به Redis...")
    try:
        redis_client = redis.StrictRedis(
            host=os.environ.get('REDIS_HOST', 'localhost'),
            port=int(os.environ.get('REDIS_PORT', 6379)),
            db=0,
            password=os.environ.get('REDIS_PASSWORD', '') or None,
            decode_responses=True
        )
        
        # تست ping
        redis_client.ping()
        
        # تست set/get
        redis_client.set('test_key', 'test_value')
        value = redis_client.get('test_key')
        redis_client.delete('test_key')
        
        # شمارش کلیدها
        keys_count = len(redis_client.keys('*'))
        
        print(f"✅ اتصال به Redis موفق بود!")
        print(f"   تعداد کلیدها: {keys_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ خطا در اتصال به Redis: {e}")
        return False

def main():
    print("=" * 50)
    print("تست اتصالات سیستم تشخیص چهره")
    print("=" * 50)
    
    mysql_ok = test_mysql()
    redis_ok = test_redis()
    
    print("\n" + "=" * 50)
    if mysql_ok and redis_ok:
        print("✅ همه اتصالات موفق بودند!")
        print("می‌توانید سرورها را اجرا کنید:")
        print("  1. python get-face-data.py")
        print("  2. python faceDetectionWithCamera.py")
    else:
        print("❌ برخی اتصالات ناموفق بودند.")
        print("لطفاً تنظیمات .env را بررسی کنید.")
    print("=" * 50)

if __name__ == '__main__':
    main()
