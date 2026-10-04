import DashboardLayout from "./components/layout/DashboardLayout";
import RevenueChart from "./components/dashboard/RevenueChart";
import { getDashboardData } from "./lib/api";
import {
  Users,
  Package,
  FileText,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    key: "customers",
    icon: Users,
    change: "+12.5%",
  },
  {
    title: "Total Products",
    key: "products",
    icon: Package,
    change: "+8.2%",
  },
  {
    title: "Total Invoices",
    key: "invoices",
    icon: FileText,
    change: "+10.4%",
  },
  {
    title: "Revenue",
    key: "revenue",
    icon: DollarSign,
    change: "+15.8%",
  },
];

function getStatusClass(status: string) {
  if (status === "Paid" || status === "Active") {
    return "bg-success-light text-success";
  }

  if (status === "Pending") {
    return "bg-warning-light text-warning";
  }

  return "bg-danger-light text-danger";
}

export default async function Home() {
  const data = await getDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-text-secondary md:text-base">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            const value =
              item.key === "revenue"
                ? `$${data.statistics.revenue.toLocaleString()}`
                : data.statistics[item.key as keyof typeof data.statistics];

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon size={21} />
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-success-light px-2 py-1 text-xs font-medium text-success">
                    <ArrowUpRight size={13} />
                    {item.change}
                  </div>
                </div>

                <p className="mt-5 text-sm text-text-secondary">{item.title}</p>

                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Revenue Overview
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Monthly revenue performance
                </p>
              </div>

              <div className="rounded-lg bg-primary-light px-3 py-2 text-sm font-medium text-primary">
                2026
              </div>
            </div>

            <div className="mt-6">
              <RevenueChart data={data.revenue} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Recent Customers
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Latest registered customers
                </p>
              </div>

              <a
                href="/customers"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all
              </a>
            </div>

            <div className="mt-6 space-y-4">
              {data.recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                      {customer.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {customer.name}
                      </p>

                      <p className="truncate text-xs text-text-muted">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      customer.status,
                    )}`}
                  >
                    {customer.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between p-5 md:p-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Recent Invoices
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Latest invoice activity
              </p>
            </div>

            <a
              href="/invoices"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="border-y border-border bg-background text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Invoice
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {invoice.customer}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                      ${invoice.amount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          invoice.status,
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
