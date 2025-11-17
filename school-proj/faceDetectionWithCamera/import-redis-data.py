#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اسکریپت برای وارد کردن دیتاهای چهره از فایل dump.rdb به Redis
"""

import redis
import json
import os
from persiantools.jdatetime import JalaliDateTime

# تنظیمات Redis
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")

# دیتاهای نمونه برای وارد کردن
sample_data = {
    "23": {
        "nationalCode": "23",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-16 21:54:54"
    },
    "3381695444": {
        "nationalCode": "3381695444",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-24 15:26:18"
    },
    "3381792441": {
        "nationalCode": "3381792441",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-24 14:33:53"
    },
    "3": {
        "nationalCode": "3",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-16 22:10:13"
    },
    "2": {
        "nationalCode": "2",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-24 06:46:33"
    },
    "3381924990": {
        "nationalCode": "3381924990",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-17 07:42:15"
    },
    "3381867301": {
        "nationalCode": "3381867301",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-17 07:45:41"
    },
    "3381837109": {
        "nationalCode": "3381837109",
        "fullName": "",
        "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/wAALCADIAMgBAREA...",
        "detectionTime": "1404-08-17 07:45:41"
    }
}


def connect_to_redis():
    """اتصال به Redis"""
    try:
        redis_client = redis.StrictRedis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=0,
            password=REDIS_PASSWORD if REDIS_PASSWORD else None,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        redis_client.ping()
        print(f"✅ اتصال به Redis در {REDIS_HOST}:{REDIS_PORT} با موفقیت برقرار شد.")
        return redis_client
    except Exception as e:
        print(f"❌ خطا در اتصال به Redis: {e}")
        return None


def import_data_to_redis(redis_client, data):
    """وارد کردن دیتاها به Redis"""
    if not redis_client:
        print("❌ اتصال به Redis برقرار نیست!")
        return False
    
    success_count = 0
    error_count = 0
    
    for national_code, user_data in data.items():
        try:
            # تبدیل دیتا به JSON
            json_data = json.dumps(user_data, ensure_ascii=False)
            
            # ذخیره در Redis با کلید کد ملی
            redis_client.set(national_code, json_data)
            
            print(f"✅ دیتای کد ملی {national_code} با موفقیت وارد شد.")
            success_count += 1
            
        except Exception as e:
            print(f"❌ خطا در وارد کردن دیتای کد ملی {national_code}: {e}")
            error_count += 1
    
    print(f"\n📊 خلاصه:")
    print(f"   ✅ موفق: {success_count}")
    print(f"   ❌ ناموفق: {error_count}")
    print(f"   📝 کل: {len(data)}")
    
    return success_count > 0


def verify_data(redis_client, national_codes):
    """بررسی دیتاهای وارد شده"""
    if not redis_client:
        return
    
    print("\n🔍 بررسی دیتاهای وارد شده:")
    for national_code in national_codes:
        try:
            data = redis_client.get(national_code)
            if data:
                user_data = json.loads(data)
                print(f"✅ کد ملی {national_code}: {user_data.get('detectionTime', 'N/A')}")
            else:
                print(f"❌ کد ملی {national_code}: یافت نشد")
        except Exception as e:
            print(f"❌ خطا در خواندن کد ملی {national_code}: {e}")


def main():
    """تابع اصلی"""
    print("🚀 شروع وارد کردن دیتاها به Redis...")
    print(f"📍 آدرس Redis: {REDIS_HOST}:{REDIS_PORT}\n")
    
    # اتصال به Redis
    redis_client = connect_to_redis()
    
    if not redis_client:
        print("\n❌ امکان اتصال به Redis وجود ندارد. لطفاً تنظیمات را بررسی کنید.")
        return
    
    # وارد کردن دیتاها
    print("\n📥 در حال وارد کردن دیتاها...\n")
    success = import_data_to_redis(redis_client, sample_data)
    
    if success:
        # بررسی دیتاهای وارد شده
        verify_data(redis_client, list(sample_data.keys()))
        
        print("\n✅ عملیات با موفقیت انجام شد!")
    else:
        print("\n❌ عملیات با خطا مواجه شد!")


if __name__ == "__main__":
    main()
