import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function formatDateForDb(date: string | Date): string {
    const d = dayjs(date).utc();
    const year = d.year();
    if (year < 1900 || year > 2100) {
        throw new Error(`Invalid year ${year} in date ${date}`);
    }
    return d.format('YYYY-MM-DD HH:mm:ss');
}

export function parseAndValidateDate(date: string | Date): string {
    const parsed = dayjs(date);
    if (!parsed.isValid()) {
        throw new Error(`Invalid date: ${date}`);
    }
    return formatDateForDb(parsed.toDate());
}

export function validateDateRange(start: string | Date, end?: string | Date): void {
    const startYear = dayjs(start).year();
    const endYear = end ? dayjs(end).year() : startYear;

    if (startYear < 1900 || startYear > 2100) {
        throw new Error(`Start date year out of range: ${startYear}`);
    }
    if (end && (endYear < 1900 || endYear > 2100)) {
        throw new Error(`End date year out of range: ${endYear}`);
    }
    if (end && dayjs(end).isBefore(start)) {
        throw new Error('End date must be after start date');
    }
}
