# استفاده از image کوچک‌تر
FROM node:18-alpine

# تنظیم محیط کار
WORKDIR /usr/src/app

# کپی فایل‌های package
COPY package*.json ./

# نصب dependencies با cache و بدون dev dependencies
RUN npm ci --only=production --silent --no-audit --no-fund

# نصب tsx برای اجرای TypeScript
RUN npm install tsx --silent

# کپی فایل‌های ضروری
COPY next.config.js* ./
COPY public ./public
COPY pages ./pages
COPY components ./components
COPY styles ./styles
COPY server.ts ./

# ساخت Next.js
RUN npm run build

# پورت 3000
EXPOSE 3000

# اجرای برنامه
CMD ["npx", "tsx", "server.ts"]
