# Multi-stage build برای Nest.js
FROM node:18-alpine AS builder

# تنظیم محیط کار
WORKDIR /app

# نصب dependencies سیستمی
RUN apk add --no-cache openssl python3 make g++

# کپی فایل‌های package
COPY package*.json ./

# نصب تمام dependencies (با npm install)
RUN npm install --silent --no-audit --no-fund

# کپی Prisma schema
COPY prisma ./prisma

# تولید Prisma client
RUN npx prisma generate

# کپی تمام فایل‌های پروژه
COPY . .

# Build پروژه
RUN npm run build

# مرحله دوم: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# نصب dependencies سیستمی
RUN apk add --no-cache openssl

# کپی package files
COPY package*.json ./

# نصب production dependencies (با npm install)
RUN npm install --production --silent --no-audit --no-fund

# کپی Prisma schema و generate
COPY prisma ./prisma
RUN npx prisma generate

# کپی فایل‌های build شده
COPY --from=builder /app/dist ./dist

# تنظیم environment
ENV NODE_ENV=production

# پورت 3001
EXPOSE 3001

# اجرای برنامه
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]