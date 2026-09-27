import DashboardLayout from "../components/layout/DashboardLayout";
import InvoicesClient from "../components/invoices/InvoicesClient";
import { readDb } from "../lib/db";

export default async function InvoicesPage() {
  const db = await readDb();

  return (
    <DashboardLayout>
      <InvoicesClient initialInvoices={db.invoices} />
    </DashboardLayout>
  );
}
