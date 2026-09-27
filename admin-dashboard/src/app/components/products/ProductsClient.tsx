"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";

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
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-212.5">
                <thead>
                  <tr className="border-b border-border bg-background text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Product
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Price
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-background/60"
                    >
                      <td className="px-5 py-4">
                        <ProductName product={product} />
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-text-primary">
                        ${product.price.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {product.stock}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>

                      <td className="px-5 py-4">
                        <Actions
                          product={product}
                          onView={openViewModal}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <ProductName product={product} />

                    <StatusBadge status={product.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MobileInfo label="Category" value={product.category} />

                    <MobileInfo label="Stock" value={String(product.stock)} />

                    <MobileInfo
                      label="Price"
                      value={`$${product.price.toLocaleString()}`}
                    />

                    <MobileInfo label="Product ID" value={`#${product.id}`} />
                  </div>

                  <Actions
                    product={product}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    mobile
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-text-primary">
                  {modal === "add"
                    ? "Add Product"
                    : modal === "edit"
                      ? "Edit Product"
                      : "Product Details"}
                </h2>

                {modal !== "view" && (
                  <p className="mt-1 text-xs text-text-muted">
                    Fill in the product information.
                  </p>
                )}
              </div>

              <button
                onClick={closeModal}
                className="ml-3 shrink-0 rounded-lg p-2 text-text-secondary hover:bg-background"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

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
                  <Info label="Category" value={selectedProduct.category} />

                  <Info
                    label="Price"
                    value={`$${selectedProduct.price.toLocaleString()}`}
                  />

                  <Info label="Stock" value={String(selectedProduct.stock)} />

                  <Info label="Status" value={selectedProduct.status} />
                </div>
              </div>
            )}

            {modal !== "view" && (
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <Field
                  label="Product Name"
                  value={form.name}
                  onChange={(value) => handleTextChange("name", value)}
                  required
                />

                <Field
                  label="Category"
                  value={form.category}
                  onChange={(value) => handleTextChange("category", value)}
                  required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NumberField
                    label="Price"
                    value={form.price}
                    min={0}
                    step="0.01"
                    onChange={(value) => handleNumberChange("price", value)}
                    required
                  />

                  <NumberField
                    label="Stock"
                    value={form.stock}
                    min={0}
                    step="1"
                    onChange={(value) => handleNumberChange("stock", value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleStatusChange(event.target.value as ProductStatus)
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="In Stock">In Stock</option>

                    <option value="Low Stock">Low Stock</option>

                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end sm:border-0 sm:pt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="min-h-11 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-background disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : modal === "edit"
                        ? "Save Changes"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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

function Actions({
  product,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}: {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onView(product)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Eye size={16} />
          View
        </button>

        <button
          onClick={() => onEdit(product)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(product)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-danger-light hover:text-danger"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={() => onView(product)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="View"
      >
        <Eye size={17} />
      </button>

      <button
        onClick={() => onEdit(product)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="Edit"
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={() => onDelete(product)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-danger-light hover:text-danger"
        title="Delete"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function MobileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <p className="text-[11px] text-text-muted">{label}</p>

      <p className="mt-1 truncate text-sm font-medium text-text-primary">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <input
        type="text"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  required = false,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  min: number;
  step: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <input
        type="number"
        value={value}
        min={min}
        step={step}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-xs text-text-muted">{label}</p>

      <p className="mt-1 wrap-break-word text-sm font-medium text-text-primary">
        {value}
      </p>
    </div>
  );
}
