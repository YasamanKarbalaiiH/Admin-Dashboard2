"use client";

import { useMemo, useState } from "react";
import Modal from "../Modal";
import TableActions from "../TableActions";
import ProductForm from "./ProductForm";
import Table from "../Table";
import InfoField from "../InfoField";
import { Plus, Search, X } from "lucide-react";

import type {
  Product,
  ProductFormData,
  ProductStatus,
} from "../../types/product";

const emptyForm: ProductFormData = {
  name: "",
  category: "",
  price: 0,
  stock: 0,
  status: "In Stock",
};

type ProductsClientProps = {
  initialProducts: Product[];
};

function getStatusClass(status: ProductStatus) {
  if (status === "In Stock") {
    return "bg-success-light text-success";
  }

  if (status === "Low Stock") {
    return "bg-warning-light text-warning";
  }

  return "bg-danger-light text-danger";
}
const productColumns = [
  { label: "Product" },
  { label: "Category" },
  { label: "Price" },
  { label: "Stock" },
  { label: "Status" },
  { label: "Actions", align: "right" as const },
];
export default function ProductsClient({
  initialProducts,
}: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  async function refreshProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = (await response.json()) as Product[];

      setProducts(data);
    } catch {
      setError("Failed to refresh products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm(emptyForm);
    setSelectedProduct(null);
    setModal("add");
    setError("");
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);

    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
    });

    setModal("edit");
    setError("");
  }

  function openViewModal(product: Product) {
    setSelectedProduct(product);
    setModal("view");
    setError("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModal(null);
    setSelectedProduct(null);
    setForm(emptyForm);
  }

  function handleTextChange(field: "name" | "category", value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNumberChange(field: "price" | "stock", value: string) {
    setForm((current) => ({
      ...current,
      [field]: Number(value),
    }));
  }

  function handleStatusChange(value: ProductStatus) {
    setForm((current) => ({
      ...current,
      status: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEdit = modal === "edit" && selectedProduct !== null;

      const url = isEdit
        ? `/api/products/${selectedProduct.id}`
        : "/api/products";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error();
      }

      await refreshProducts();

      setModal(null);
      setSelectedProduct(null);
      setForm(emptyForm);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    } catch {
      setError("Failed to delete product. Please try again.");
    }
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Products
          </h1>

          <p className="mt-1.5 text-sm text-text-secondary md:mt-2">
            Manage your products, prices and inventory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:w-auto"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-danger/10"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3 md:p-5">
          <div className="relative md:col-span-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 md:p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-background"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Search size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-text-primary">
              No products found
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Try changing your search or filters.
            </p>

            {(search || categoryFilter !== "All" || statusFilter !== "All") && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <Table
              data={filteredProducts}
              columns={productColumns}
              getRowKey={(product) => product.id}
              renderDesktopCells={(product) => (
                <>
                  <td className="px-5 py-4">
                    <ProductName product={product} />
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    ${product.price.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {product.stock}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>

                  <td className="px-5 py-4">
                    <TableActions
                      item={product}
                      onView={openViewModal}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  </td>
                </>
              )}
              renderMobileContent={(product) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <ProductName product={product} />
                    <StatusBadge status={product.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoField
                      label="Category"
                      value={product.category}
                      variant="mobile"
                    />

                    <InfoField
                      label="Stock"
                      value={String(product.stock)}
                      variant="mobile"
                    />

                    <InfoField
                      label="Price"
                      value={`$${product.price.toLocaleString()}`}
                      variant="mobile"
                    />

                    <InfoField
                      label="Product ID"
                      value={`#${product.id}`}
                      variant="mobile"
                    />
                  </div>

                  <TableActions
                    item={product}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    mobile
                  />
                </>
              )}
            />
          </>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>

      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={
          modal === "add"
            ? "Add Product"
            : modal === "edit"
              ? "Edit Product"
              : "Product Details"
        }
      >
        {modal === "view" && selectedProduct && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light text-lg font-bold text-primary">
                {selectedProduct.name.charAt(0)}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-semibold text-text-primary">
                  {selectedProduct.name}
                </h3>

                <div className="mt-1">
                  <StatusBadge status={selectedProduct.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <InfoField label="Category" value={selectedProduct.category} />
              <InfoField
                label="Price"
                value={`$${selectedProduct.price.toLocaleString()}`}
              />
              <InfoField label="Stock" value={String(selectedProduct.stock)} />
            </div>
          </div>
        )}

        {modal !== "view" && (
          <ProductForm
            form={form}
            saving={saving}
            mode={modal === "edit" ? "edit" : "add"}
            onTextChange={handleTextChange}
            onNumberChange={handleNumberChange}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}

function ProductName({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-sm font-semibold text-primary">
        {product.name.charAt(0)}
      </div>

      <p className="truncate text-sm font-semibold text-text-primary">
        {product.name}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}
