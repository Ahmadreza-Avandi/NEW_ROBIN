import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    "host": "181.41.194.136",       # IP سرور
    "database": "crm_system",       # اسم دیتابیس
    "user": "crm_app_user",         # یوزر
    "password": "Ahmad.1386"        # پسورد
}

def get_tables_and_columns():
    try:
        # اتصال به دیتابیس
        connection = mysql.connector.connect(**DB_CONFIG)

        if connection.is_connected():
            print(f"✅ اتصال برقرار شد به دیتابیس {DB_CONFIG['database']} روی {DB_CONFIG['host']}")

            cursor = connection.cursor()
            # لیست جداول
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()

            print("\n📋 لیست جداول:")
            for table in tables:
                table_name = table[0]
                print(f"\n--- {table_name} ---")

                # گرفتن ستون‌های جدول
                cursor.execute(f"DESCRIBE {table_name};")
                columns = cursor.fetchall()
                for col in columns:
                    print(f"  ستون: {col[0]} | نوع: {col[1]} | NULL: {col[2]} | کلید: {col[3]} | پیش‌فرض: {col[4]} | Extra: {col[5]}")

    except Error as e:
        print("❌ خطا در اتصال یا کوئری:", e)

    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("\n🔌 اتصال بسته شد.")

if __name__ == "__main__":
    get_tables_and_columns()
