import DashboardLayout from "../components/layout/DashboardLayout";
import ProductsClient from "../components/products/ProductsClient";
import { readDb } from "../lib/db";

export default async function ProductsPage() {
  const db = await readDb();

  return (
    <DashboardLayout>
      <ProductsClient initialProducts={db.products} />
    </DashboardLayout>
  );
}
