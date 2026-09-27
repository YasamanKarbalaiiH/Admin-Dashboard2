import DashboardLayout from "../components/layout/DashboardLayout";
import CustomersClient from "../components/customers/CustomersClient";
import { readDb } from "../lib/db";

export default async function CustomersPage() {
  const db = await readDb();

  return (
    <DashboardLayout>
      <CustomersClient initialCustomers={db.customers} />
    </DashboardLayout>
  );
}
