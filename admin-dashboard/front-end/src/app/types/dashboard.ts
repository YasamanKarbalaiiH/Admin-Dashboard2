export type DashboardStatistics = {
  customers: number;
  products: number;
  invoices: number;
  revenue: number;
};

export type RevenueData = {
  month: string;
  value: number;
};

export type RecentInvoice = {
  id: number;
  invoiceNumber: string;
  customer: string;
  amount: number;
  status: string;
};

export type RecentCustomer = {
  id: number;
  name: string;
  email: string;
  status: string;
};

export type DashboardData = {
  statistics: DashboardStatistics;
  revenue: RevenueData[];
  recentInvoices: RecentInvoice[];
  recentCustomers: RecentCustomer[];
};
