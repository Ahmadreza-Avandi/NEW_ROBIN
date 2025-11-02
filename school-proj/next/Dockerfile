# Multi-stage build برای کاهش حجم نهایی
FROM node:18-alpine AS builder

# تنظیم محیط کار
WORKDIR /app

# کپی فایل‌های package
COPY package*.json ./

# نصب تمام dependencies (شامل devDependencies برای build)
RUN npm ci --silent --no-audit --no-fund

# کپی تمام فایل‌های پروژه
COPY . .

# ساخت Next.js
RUN npm run build

# مرحله دوم: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# کپی package files
COPY package*.json ./

# نصب فقط production dependencies
RUN npm ci --only=production --silent --no-audit --no-fund && \
    npm install tsx --silent

# کپی فایل‌های build شده از مرحله قبل
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js* ./
COPY --from=builder /app/server.ts ./

# تنظیم environment
ENV NODE_ENV=production
ENV PORT=3000

# پورت 3000
EXPOSE 3000

# اجرای برنامه
CMD ["npx", "tsx", "server.ts"]
