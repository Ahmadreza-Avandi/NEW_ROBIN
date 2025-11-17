#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اسکریپت برای استخراج دیتاها از فایل dump.rdb و وارد کردن به Redis
"""

import redis
import json
import os
import sys

# تنظیمات Redis
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")

# مسیر فایل dump.rdb
DUMP_FILE = "dump.rdb"


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


def import_from_dump_file(redis_client, dump_file_path):
    """
    وارد کردن دیتاها از فایل dump.rdb
    
    توجه: این روش نیاز به کپی کردن فایل dump.rdb به دایرکتوری Redis دارد
    """
    if not os.path.exists(dump_file_path):
        print(f"❌ فایل {dump_file_path} یافت نشد!")
        return False
    
    print(f"\n📂 فایل dump.rdb پیدا شد: {dump_file_path}")
    print(f"📏 حجم فایل: {os.path.getsize(dump_file_path)} بایت")
    
    # راهنمای استفاده
    print("\n📖 راهنمای وارد کردن دیتا از dump.rdb:")
    print("=" * 60)
    print("روش 1: استفاده از redis-cli")
    print("   1. Redis را متوقف کنید")
    print("   2. فایل dump.rdb را به دایرکتوری Redis کپی کنید")
    print("   3. Redis را مجدداً راه‌اندازی کنید")
    print("\nروش 2: استفاده از دستور RESTORE")
    print("   از redis-cli برای بازیابی کلیدها استفاده کنید")
    print("\nروش 3: استفاده از ابزار rdb")
    print("   pip install rdbtools")
    print("   rdb --command json dump.rdb > data.json")
    print("=" * 60)
    
    return True


def list_all_keys(redis_client):
    """لیست کردن تمام کلیدهای موجود در Redis"""
    if not redis_client:
        return []
    
    try:
        keys = redis_client.keys('*')
        print(f"\n📋 تعداد کلیدهای موجود در Redis: {len(keys)}")
        
        if keys:
            print("\n🔑 لیست کلیدها:")
            for key in keys:
                try:
                    data = redis_client.get(key)
                    if data:
                        user_data = json.loads(data)
                        print(f"   - {key}: {user_data.get('detectionTime', 'N/A')}")
                except:
                    print(f"   - {key}: (خطا در خواندن)")
        
        return keys
    except Exception as e:
        print(f"❌ خطا در خواندن کلیدها: {e}")
        return []


def export_redis_data(redis_client, output_file="redis_export.json"):
    """خروجی گرفتن از دیتاهای Redis به فایل JSON"""
    if not redis_client:
        return False
    
    try:
        keys = redis_client.keys('*')
        export_data = {}
        
        for key in keys:
            data = redis_client.get(key)
            if data:
                try:
                    export_data[key] = json.loads(data)
                except:
                    export_data[key] = data
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ دیتاها با موفقیت به فایل {output_file} ذخیره شدند.")
        print(f"📊 تعداد رکوردها: {len(export_data)}")
        return True
        
    except Exception as e:
        print(f"❌ خطا در خروجی گرفتن: {e}")
        return False


def clear_redis_data(redis_client):
    """پاک کردن تمام دیتاهای Redis (با احتیاط!)"""
    if not redis_client:
        return False
    
    confirm = input("\n⚠️  آیا مطمئن هستید که می‌خواهید تمام دیتاها را پاک کنید؟ (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ عملیات لغو شد.")
        return False
    
    try:
        redis_client.flushdb()
        print("✅ تمام دیتاها پاک شدند.")
        return True
    except Exception as e:
        print(f"❌ خطا در پاک کردن دیتاها: {e}")
        return False


def main():
    """تابع اصلی"""
    print("🚀 ابزار مدیریت دیتاهای Redis")
    print("=" * 60)
    print(f"📍 آدرس Redis: {REDIS_HOST}:{REDIS_PORT}")
    print(f"📂 فایل dump: {DUMP_FILE}\n")
    
    # اتصال به Redis
    redis_client = connect_to_redis()
    
    if not redis_client:
        print("\n❌ امکان اتصال به Redis وجود ندارد.")
        return
    
    while True:
        print("\n" + "=" * 60)
        print("منوی اصلی:")
        print("1. نمایش کلیدهای موجود در Redis")
        print("2. خروجی گرفتن از Redis به فایل JSON")
        print("3. راهنمای وارد کردن از dump.rdb")
        print("4. پاک کردن تمام دیتاها (احتیاط!)")
        print("5. خروج")
        print("=" * 60)
        
        choice = input("\nانتخاب کنید (1-5): ").strip()
        
        if choice == '1':
            list_all_keys(redis_client)
        elif choice == '2':
            export_redis_data(redis_client)
        elif choice == '3':
            import_from_dump_file(redis_client, DUMP_FILE)
        elif choice == '4':
            clear_redis_data(redis_client)
        elif choice == '5':
            print("\n👋 خداحافظ!")
            break
        else:
            print("\n❌ انتخاب نامعتبر!")


if __name__ == "__main__":
    main()
