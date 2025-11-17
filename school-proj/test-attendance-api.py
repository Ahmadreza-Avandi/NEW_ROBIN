#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تست API اتندنس - بررسی دیتاهای Redis
"""

import requests
import json

# آدرس APIها
ATTENDANCE_API_URL = "http://localhost:3000/api/attendance"
REDIS_FACES_API_URL = "http://localhost:3000/api/redis-faces"

def test_redis_faces_api():
    """تست کردن API چهره‌های Redis"""
    print("🧪 تست API چهره‌های Redis...")
    print(f"📍 URL: {REDIS_FACES_API_URL}\n")
    
    try:
        # ارسال درخواست GET
        response = requests.get(REDIS_FACES_API_URL)
        
        print(f"📊 وضعیت: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                faces = data.get('data', [])
                print(f"✅ تعداد چهره‌ها: {data.get('count', 0)}\n")
                
                if faces:
                    print("📋 لیست چهره‌های ثبت شده:")
                    print("=" * 80)
                    for idx, record in enumerate(faces, 1):
                        print(f"\n{idx}. کد ملی: {record.get('nationalCode')}")
                        print(f"   نام: {record.get('fullName', 'ندارد')}")
                        print(f"   زمان ثبت: {record.get('detectionTime')}")
                        print(f"   تصویر: {'✅ دارد' if record.get('hasImage') else '❌ ندارد'}")
                else:
                    print("⚠️  هیچ چهره‌ای یافت نشد!")
            else:
                print(f"❌ خطا: {data.get('message')}")
        else:
            print(f"❌ خطای سرور: {response.status_code}")
            print(f"پاسخ: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ خطا: نمی‌تونم به سرور Next.js متصل بشم!")
        print("💡 مطمئن شو که سرور Next.js در حال اجراست:")
        print("   npm run dev")
    except Exception as e:
        print(f"❌ خطای غیرمنتظره: {e}")


def test_attendance_api():
    """تست کردن API اتندنس"""
    print("🧪 تست API اتندنس...")
    print(f"📍 URL: {ATTENDANCE_API_URL}\n")
    
    try:
        # ارسال درخواست GET
        response = requests.get(ATTENDANCE_API_URL)
        
        print(f"📊 وضعیت: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                attendances = data.get('data', [])
                print(f"✅ تعداد رکوردها: {len(attendances)}\n")
                
                if attendances:
                    print("📋 لیست حضور و غیاب:")
                    print("=" * 80)
                    for idx, record in enumerate(attendances, 1):
                        print(f"\n{idx}. کد ملی: {record.get('nationalCode')}")
                        print(f"   نام: {record.get('fullName', 'ندارد')}")
                        print(f"   زمان: {record.get('detectionTime')}")
                        print(f"   تصویر: {'دارد' if record.get('faceImage') else 'ندارد'}")
                else:
                    print("⚠️  هیچ رکوردی یافت نشد!")
            else:
                print(f"❌ خطا: {data.get('message')}")
        else:
            print(f"❌ خطای سرور: {response.status_code}")
            print(f"پاسخ: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ خطا: نمی‌تونم به سرور Next.js متصل بشم!")
        print("💡 مطمئن شو که سرور Next.js در حال اجراست:")
        print("   npm run dev")
    except Exception as e:
        print(f"❌ خطای غیرمنتظره: {e}")


def test_redis_directly():
    """تست مستقیم Redis"""
    print("\n" + "=" * 80)
    print("🔍 تست مستقیم Redis...")
    
    try:
        import redis
        
        redis_client = redis.StrictRedis(
            host='localhost',
            port=6379,
            decode_responses=True
        )
        
        # بررسی اتصال
        redis_client.ping()
        print("✅ اتصال به Redis موفق")
        
        # دریافت تمام کلیدها
        keys = redis_client.keys('*')
        print(f"📊 تعداد کلیدها در Redis: {len(keys)}")
        
        if keys:
            print("\n📋 نمونه دیتا:")
            sample_key = keys[0]
            data = redis_client.get(sample_key)
            user_data = json.loads(data)
            print(f"   کد ملی: {user_data.get('nationalCode')}")
            print(f"   زمان: {user_data.get('detectionTime')}")
            print(f"   تصویر: {'دارد' if user_data.get('faceImage') else 'ندارد'}")
        
    except ImportError:
        print("⚠️  ماژول redis نصب نیست")
        print("   pip install redis")
    except Exception as e:
        print(f"❌ خطا در اتصال به Redis: {e}")


if __name__ == "__main__":
    print("🚀 شروع تست سیستم حضور و غیاب\n")
    
    # تست Redis مستقیم
    test_redis_directly()
    
    # تست API چهره‌های Redis
    print("\n" + "=" * 80)
    test_redis_faces_api()
    
    # تست API اتندنس
    print("\n" + "=" * 80)
    test_attendance_api()
    
    print("\n" + "=" * 80)
    print("✅ تست تمام شد!")
