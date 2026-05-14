# Dockerfile سفارشی برای nginx با میرور آروان کلود
FROM nginx:alpine

# تنظیم میرور آروان کلود برای Alpine
RUN echo "https://mirror.arvancloud.ir/alpine/v3.20/main" > /etc/apk/repositories && \
    echo "https://mirror.arvancloud.ir/alpine/v3.20/community" >> /etc/apk/repositories

# به‌روزرسانی پکیج‌ها
RUN apk update && apk upgrade

# نصب ابزارهای اضافی در صورت نیاز
RUN apk add --no-cache \
    curl \
    bash

# کپی کانفیگ پیش‌فرض
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]