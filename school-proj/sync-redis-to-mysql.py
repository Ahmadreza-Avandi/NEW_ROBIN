#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
انتقال تصاویر چهره از Redis به MySQL
"""

import redis
import json
import mysql.connector
import os
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
load_dotenv()

# تنظیمات Redis
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")

# تنظیمات MySQL
MYSQL_HOST = os.environ.get("DB_HOST", "localhost")
MYSQL_USER = os.environ.get("DB_USER", "root")
MYSQL_PASSWORD = os.environ.get("DB_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("DB_NAME", "school_attendance")


def connect_to_redis():
    """اتصال به Redis"""
    try:
        redis_client = redis.StrictRedis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=0,
            password=REDIS_PASSWORD if REDIS_PASSWORD else None,
            decode_responses=True
        )
        redis_client.ping()
        print(f"✅ اتصال به Redis موفق")
        return redis_client
    except Exception as e:
        print(f"❌ خطا در اتصال به Redis: {e}")
        return None


def connect_to_mysql():
    """اتصال به MySQL"""
    try:
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        print(f"✅ اتصال به MySQL موفق")
        return connection
    except Exception as e:
        print(f"❌ خطا در اتصال به MySQL: {e}")
        return None


def sync_photos_to_user_table(redis_client, mysql_conn):
    """
    انتقال تصاویر به جدول User
    """
    cursor = mysql_conn.cursor()
    
    # دریافت تمام کلیدها از Redis
    keys = redis_client.keys('*')
    print(f"\n📊 تعداد رکوردها در Redis: {len(keys)}")
    
    success_count = 0
    error_count = 0
    not_found_count = 0
    
    for national_code in keys:
        try:
            # دریافت دیتا از Redis
            data = redis_client.get(national_code)
            if not data:
                continue
                
            user_data = json.loads(data)
            face_image = user_data.get('faceImage', '')
            
            if not face_image:
                print(f"⚠️  کد ملی {national_code}: تصویر ندارد")
                continue
            
            # بررسی وجود کاربر در MySQL
            check_query = "SELECT id FROM User WHERE nationalCode = %s"
            cursor.execute(check_query, (national_code,))
            result = cursor.fetchone()
            
            if result:
                # آپدیت تصویر
                update_query = """
                    UPDATE User 
                    SET profilePhoto = %s 
                    WHERE nationalCode = %s
                """
                cursor.execute(update_query, (face_image, national_code))
                mysql_conn.commit()
                
                print(f"✅ کد ملی {national_code}: تصویر به‌روز شد")
                success_count += 1
            else:
                print(f"⚠️  کد ملی {national_code}: کاربر در MySQL یافت نشد")
                not_found_count += 1
                
        except Exception as e:
            print(f"❌ خطا در پردازش کد ملی {national_code}: {e}")
            error_count += 1
    
    cursor.close()
    
    print(f"\n📊 خلاصه:")
    print(f"   ✅ موفق: {success_count}")
    print(f"   ⚠️  کاربر یافت نشد: {not_found_count}")
    print(f"   ❌ خطا: {error_count}")
    print(f"   📝 کل: {len(keys)}")
    
    return success_count > 0


def sync_photos_to_attendance_table(redis_client, mysql_conn):
    """
    انتقال تصاویر به جدول attendance
    (برای رکوردهای موجود)
    """
    cursor = mysql_conn.cursor()
    
    # دریافت تمام کلیدها از Redis
    keys = redis_client.keys('*')
    print(f"\n📊 تعداد رکوردها در Redis: {len(keys)}")
    
    success_count = 0
    error_count = 0
    
    for national_code in keys:
        try:
            # دریافت دیتا از Redis
            data = redis_client.get(national_code)
            if not data:
                continue
                
            user_data = json.loads(data)
            face_image = user_data.get('faceImage', '')
            
            if not face_image:
                continue
            
            # آپدیت تمام رکوردهای حضور این کاربر
            update_query = """
                UPDATE attendance 
                SET faceImage = %s 
                WHERE nationalCode = %s
            """
            cursor.execute(update_query, (face_image, national_code))
            affected_rows = cursor.rowcount
            mysql_conn.commit()
            
            if affected_rows > 0:
                print(f"✅ کد ملی {national_code}: {affected_rows} رکورد به‌روز شد")
                success_count += affected_rows
            
        except Exception as e:
            print(f"❌ خطا در پردازش کد ملی {national_code}: {e}")
            error_count += 1
    
    cursor.close()
    
    print(f"\n📊 خلاصه:")
    print(f"   ✅ رکوردهای به‌روز شده: {success_count}")
    print(f"   ❌ خطا: {error_count}")
    
    return success_count > 0


def main():
    """تابع اصلی"""
    print("🚀 شروع انتقال تصاویر از Redis به MySQL\n")
    
    # اتصال به Redis
    redis_client = connect_to_redis()
    if not redis_client:
        return
    
    # اتصال به MySQL
    mysql_conn = connect_to_mysql()
    if not mysql_conn:
        return
    
    print("\n" + "=" * 60)
    print("انتخاب کنید:")
    print("1. انتقال به جدول User (پروفایل کاربران)")
    print("2. انتقال به جدول attendance (رکوردهای حضور)")
    print("3. هر دو")
    print("=" * 60)
    
    choice = input("\nانتخاب (1-3): ").strip()
    
    if choice == '1':
        print("\n📥 انتقال به جدول User...")
        sync_photos_to_user_table(redis_client, mysql_conn)
    elif choice == '2':
        print("\n📥 انتقال به جدول attendance...")
        sync_photos_to_attendance_table(redis_client, mysql_conn)
    elif choice == '3':
        print("\n📥 انتقال به جدول User...")
        sync_photos_to_user_table(redis_client, mysql_conn)
        print("\n📥 انتقال به جدول attendance...")
        sync_photos_to_attendance_table(redis_client, mysql_conn)
    else:
        print("❌ انتخاب نامعتبر!")
    
    # بستن اتصالات
    mysql_conn.close()
    redis_client.close()
    
    print("\n✅ عملیات تمام شد!")


if __name__ == "__main__":
    main()
