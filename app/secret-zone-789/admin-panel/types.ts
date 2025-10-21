export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    subscriptionStatus: 'active' | 'expired' | 'suspended';
    subscriptionEnd: string;
    subscriptionStart?: string;
    plan?: string;
    subscriptionHistory?: Array<{
        id: string;
        plan: string;
        start: string;
        end: string;
        amount: number;
    }>;
}

export interface Subscription {
    id: string;
    name: string;
    price: number;
    duration: 'monthly' | 'yearly' | 'premium';
    description: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    amount: number;
    currency?: string;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
    dueDate?: string;
    paidDate?: string;
}

export interface DashboardStats {
    totalCustomers: number;
    activeCustomers: number;
    expiredCustomers: number;
    suspendedCustomers: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    recentInvoices?: Invoice[];
    recentCustomers?: Customer[];
}

export interface BillingMetrics {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
}