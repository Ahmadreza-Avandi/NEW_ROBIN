# استفاده از image کوچک‌تر
FROM python:3.10-slim

WORKDIR /app

# نصب dependencies سیستمی با cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender1 libgomp1 libgl1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# کپی requirements اول (برای cache بهتر)
COPY requirements.txt .

# نصب Python packages
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

# ایجاد پوشه‌ها
RUN mkdir -p trainer labels assets/face_detection data

# کپی فایل‌ها
COPY get-face-data.py .
COPY assets/face_detection/ assets/face_detection/

# متغیرهای محیطی پیش‌فرض (docker-compose می‌تواند override کند)
ENV FLASK_APP=get-face-data.py \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
