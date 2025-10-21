// تبدیل تاریخ میلادی به شمسی
export function convertToJalali(date: Date): string {
    const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    // استفاده از کتابخانه moment-jalaali یا محاسبه دستی
    // برای سادگی، از تاریخ میلادی استفاده می‌کنیم
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // تبدیل ساده (باید از کتابخانه مناسب استفاده شود)
    const jalaliYear = year - 621;
    const jalaliMonth = month;
    const jalaliDay = day;

    return `${jalaliYear}/${jalaliMonth.toString().padStart(2, '0')}/${jalaliDay.toString().padStart(2, '0')}`;
}

// تبدیل تاریخ شمسی به میلادی
export function convertToGregorian(jalaliDate: string): Date {
    // پیاده‌سازی ساده - باید از کتابخانه مناسب استفاده شود
    const [year, month, day] = jalaliDate.split('/').map(Number);
    const gregorianYear = year + 621;

    return new Date(gregorianYear, month - 1, day);
}

// فرمت کردن تاریخ فارسی
export function formatPersianDate(date: Date, includeTime: boolean = false): string {
    const persianDate = convertToJalali(date);

    if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${persianDate} - ${hours}:${minutes}`;
    }

    return persianDate;
}

// دریافت تاریخ امروز به شمسی
export function getTodayPersian(): string {
    return convertToJalali(new Date());
}

// محاسبه اختلاف روزها
export function getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// بررسی اینکه آیا تاریخ امروز است یا نه
export function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// بررسی اینکه آیا تاریخ دیروز است یا نه
export function isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}

// فرمت نسبی تاریخ (مثل "2 روز پیش")
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
        return 'همین الان';
    } else if (diffMins < 60) {
        return `${diffMins} دقیقه پیش`;
    } else if (diffHours < 24) {
        return `${diffHours} ساعت پیش`;
    } else if (diffDays < 7) {
        return `${diffDays} روز پیش`;
    } else {
        return formatPersianDate(date);
    }
}