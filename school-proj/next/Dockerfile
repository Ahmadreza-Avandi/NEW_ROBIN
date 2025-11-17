# Multi-stage build برای کاهش حجم نهایی
FROM node:18-alpine AS builder

# تنظیم محیط کار
WORKDIR /app

# نصب dependencies سیستمی
RUN apk add --no-cache libc6-compat python3 make g++

# کپی فایل‌های package
COPY package*.json ./

# پاک کردن cache و نصب dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# کپی تمام فایل‌های پروژه
COPY . .

# ساخت Next.js
RUN npm run build

# مرحله دوم: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# نصب dependencies سیستمی
RUN apk add --no-cache libc6-compat

# کپی package files
COPY package*.json ./

# نصب production dependencies
RUN npm cache clean --force && \
    npm install --production --legacy-peer-deps && \
    npm install tsx

# کپی فایل‌های build شده از مرحله قبل
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js* ./
COPY --from=builder /app/server.ts* ./
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/pages ./pages

# تنظیم environment
ENV NODE_ENV=production
ENV PORT=3000

# پورت 3000
EXPOSE 3000

# اجرای برنامه
CMD ["npm", "start"]
