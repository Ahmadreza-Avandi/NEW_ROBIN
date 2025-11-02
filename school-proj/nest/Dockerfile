# استفاده از image کوچک‌تر
FROM node:18-alpine

# تنظیم محیط کار
WORKDIR /usr/src/app

# نصب dependencies سیستمی
RUN apk add --no-cache openssl

# کپی فایل‌های package
COPY package*.json ./

# نصب dependencies با cache
RUN npm ci --only=production --silent --no-audit --no-fund

# کپی Prisma schema
COPY prisma ./prisma

# تولید Prisma client
RUN npx prisma generate

# کپی کدهای build شده (باید قبلاً build شده باشه)
COPY dist ./dist
COPY .env* ./

# پورت 3001
EXPOSE 3001

# اجرای برنامه
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]