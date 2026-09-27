"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import type { Customer, CustomerFormData } from "../../types/customer";

const emptyForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Active",
};

type CustomersClientProps = {
  initialCustomers: Customer[];
};

function getStatusClass(status: string) {
  if (status === "Active") {
    return "bg-success-light text-success";
  }

  return "bg-danger-light text-danger";
}

export default function CustomersClient({
  initialCustomers,
}: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [form, setForm] = useState<CustomerFormData>(emptyForm);

  const [saving, setSaving] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.company.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  async function refreshCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customers", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = (await response.json()) as Customer[];

      setCustomers(data);
    } catch {
      setError("Failed to refresh customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm(emptyForm);
    setSelectedCustomer(null);
    setModal("add");
    setError("");
  }

  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      status: customer.status,
    });

    setModal("edit");
    setError("");
  }

  function openViewModal(customer: Customer) {
    setSelectedCustomer(customer);
    setModal("view");
    setError("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModal(null);
    setSelectedCustomer(null);
    setForm(emptyForm);
  }

  function handleChange(field: keyof CustomerFormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
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

      const isEdit = modal === "edit" && selectedCustomer !== null;

      const url = isEdit
        ? `/api/customers/${selectedCustomer.id}`
        : "/api/customers";

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

      await refreshCustomers();

      setModal(null);
      setSelectedCustomer(null);
      setForm(emptyForm);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id),
      );
    } catch {
      setError("Failed to delete customer. Please try again.");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Customers
          </h1>

          <p className="mt-1.5 text-sm text-text-secondary md:mt-2">
            Manage your customers and their information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:w-auto"
        >
          <Plus size={18} />
          Add Customer
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
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 md:p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Search size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-text-primary">
              No customers found
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Try changing your search or filter.
            </p>

            {(search || statusFilter !== "All") && (
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
              <table className="w-full min-w-225">
                <thead>
                  <tr className="border-b border-border bg-background text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Company
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border last:border-0 hover:bg-background/60"
                    >
                      <td className="px-5 py-4">
                        <CustomerName customer={customer} />
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {customer.company}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {customer.phone}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={customer.status} />
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {customer.createdAt}
                      </td>

                      <td className="px-5 py-4">
                        <Actions
                          customer={customer}
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
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <CustomerName customer={customer} />

                    <StatusBadge status={customer.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MobileInfo label="Company" value={customer.company} />

                    <MobileInfo label="Phone" value={customer.phone} />

                    <MobileInfo label="Joined" value={customer.createdAt} />

                    <MobileInfo label="Customer ID" value={`#${customer.id}`} />
                  </div>

                  <Actions
                    customer={customer}
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

        {!loading && filteredCustomers.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredCustomers.length} of {customers.length} customers
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
                    ? "Add Customer"
                    : modal === "edit"
                      ? "Edit Customer"
                      : "Customer Details"}
                </h2>

                {modal !== "view" && (
                  <p className="mt-1 text-xs text-text-muted">
                    Fill in the customer information.
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

            {modal === "view" && selectedCustomer && (
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-lg font-bold text-primary">
                    {selectedCustomer.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text-primary">
                      {selectedCustomer.name}
                    </h3>

                    <div className="mt-1">
                      <StatusBadge status={selectedCustomer.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <Info label="Email" value={selectedCustomer.email} />

                  <Info label="Phone" value={selectedCustomer.phone} />

                  <Info label="Company" value={selectedCustomer.company} />

                  <Info label="Joined" value={selectedCustomer.createdAt} />
                </div>
              </div>
            )}

            {modal !== "view" && (
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(value) => handleChange("name", value)}
                  required
                />

                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) => handleChange("email", value)}
                  required
                />

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => handleChange("phone", value)}
                  required
                />

                <Field
                  label="Company"
                  value={form.company}
                  onChange={(value) => handleChange("company", value)}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange("status", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>
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
                        : "Add Customer"}
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

function CustomerName({ customer }: { customer: Customer }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
        {customer.name.charAt(0)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          {customer.name}
        </p>

        <p className="truncate text-xs text-text-muted">{customer.email}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
  customer,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}: {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onView(customer)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Eye size={16} />
          View
        </button>

        <button
          onClick={() => onEdit(customer)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(customer)}
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
        onClick={() => onView(customer)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="View"
      >
        <Eye size={17} />
      </button>

      <button
        onClick={() => onEdit(customer)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="Edit"
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={() => onDelete(customer)}
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
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <input
        type={type}
        value={value}
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
