/**
 * Currency formatting utilities for Persian/Farsi locale
 */

export const formatCurrency = (amount: number | string, currency: string = 'IRR'): string => {
    // Ensure amount is a valid number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
        return '0 تومان';
    }

    if (currency === 'IRR') {
        if (numAmount >= 1000000000) {
            // میلیارد تومان
            const billions = numAmount / 1000000000;
            return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(billions)} میلیارد تومان`;
        } else if (numAmount >= 1000000) {
            // میلیون تومان
            const millions = numAmount / 1000000;
            return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(millions)} میلیون تومان`;
        } else if (numAmount >= 1000) {
            // هزار تومان
            const thousands = numAmount / 1000;
            return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(thousands)} هزار تومان`;
        } else {
            // تومان
            return `${new Intl.NumberFormat('fa-IR').format(numAmount)} تومان`;
        }
    }
    return `${new Intl.NumberFormat('fa-IR').format(numAmount)} ${currency}`;
};

export const formatPersianNumber = (num: number | string): string => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return new Intl.NumberFormat('fa-IR').format(numValue);
};

export const formatCompactCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
        return '0';
    }

    if (numAmount >= 1000000000) {
        return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(numAmount / 1000000000)}B`;
    } else if (numAmount >= 1000000) {
        return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(numAmount / 1000000)}M`;
    } else if (numAmount >= 1000) {
        return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(numAmount / 1000)}K`;
    } else {
        return new Intl.NumberFormat('fa-IR').format(numAmount);
    }
};