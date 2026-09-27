import { NextResponse } from "next/server";
import db from "../../data/db.json";

export async function GET() {
  const data = {
    statistics: db.dashboard.statistics,
    revenue: db.dashboard.revenue,

    recentCustomers: db.customers.slice(0, 4).map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      status: customer.status,
    })),

    recentInvoices: db.invoices.slice(0, 4).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      amount: invoice.amount,
      status: invoice.status,
    })),
  };

  return NextResponse.json(data);
}
