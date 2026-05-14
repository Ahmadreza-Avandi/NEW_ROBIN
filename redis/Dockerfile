# Dockerfile سفارشی برای Redis با میرور آروان کلود
FROM redis:alpine

# تنظیم میرور آروان کلود برای Alpine
RUN echo "https://mirror.arvancloud.ir/alpine/v3.20/main" > /etc/apk/repositories && \
    echo "https://mirror.arvancloud.ir/alpine/v3.20/community" >> /etc/apk/repositories

# به‌روزرسانی پکیج‌ها
RUN apk update && apk upgrade

# نصب ابزارهای اضافی در صورت نیاز
RUN apk add --no-cache \
    curl \
    bash

EXPOSE 6379

CMD ["redis-server"]