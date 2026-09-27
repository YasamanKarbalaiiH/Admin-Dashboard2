export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type Invoice = {
  id: number;
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
};

export type InvoiceFormData = {
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
};
