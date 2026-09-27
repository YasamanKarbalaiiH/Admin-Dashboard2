"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import type {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
} from "../../types/invoice";

const emptyForm: InvoiceFormData = {
  invoiceNumber: "",
  customer: "",
  date: "",
  dueDate: "",
  amount: 0,
  status: "Pending",
};

type InvoicesClientProps = {
  initialInvoices: Invoice[];
};

function getStatusClass(status: InvoiceStatus) {
  if (status === "Paid") {
    return "bg-success-light text-success";
  }

  if (status === "Pending") {
    return "bg-warning-light text-warning";
  }

  return "bg-danger-light text-danger";
}

export default function InvoicesClient({
  initialInvoices,
}: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [form, setForm] = useState<InvoiceFormData>(emptyForm);

  const [saving, setSaving] = useState(false);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchValue) ||
        invoice.customer.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  async function refreshInvoices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/invoices", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = (await response.json()) as Invoice[];

      setInvoices(data);
    } catch {
      setError("Failed to refresh invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm(emptyForm);
    setSelectedInvoice(null);
    setModal("add");
    setError("");
  }

  function openEditModal(invoice: Invoice) {
    setSelectedInvoice(invoice);

    setForm({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      date: invoice.date,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      status: invoice.status,
    });

    setModal("edit");
    setError("");
  }

  function openViewModal(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setModal("view");
    setError("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModal(null);
    setSelectedInvoice(null);
    setForm(emptyForm);
  }

  function handleTextChange(
    field: "invoiceNumber" | "customer" | "date" | "dueDate",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAmountChange(value: string) {
    setForm((current) => ({
      ...current,
      amount: Number(value),
    }));
  }

  function handleStatusChange(value: InvoiceStatus) {
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

      const isEdit = modal === "edit" && selectedInvoice !== null;

      const url = isEdit
        ? `/api/invoices/${selectedInvoice.id}`
        : "/api/invoices";

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

      await refreshInvoices();

      setModal(null);
      setSelectedInvoice(null);
      setForm(emptyForm);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(invoice: Invoice) {
    const confirmed = window.confirm(`Delete ${invoice.invoiceNumber}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      setInvoices((current) =>
        current.filter((item) => item.id !== invoice.id),
      );
    } catch {
      setError("Failed to delete invoice. Please try again.");
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
            Invoices
          </h1>

          <p className="mt-1.5 text-sm text-text-secondary md:mt-2">
            Manage invoices, payments and due dates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:w-auto"
        >
          <Plus size={18} />
          Add Invoice
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
              placeholder="Search invoices..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
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
        ) : filteredInvoices.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Search size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-text-primary">
              No invoices found
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
                      Invoice
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Due Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Amount
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
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-border last:border-0 hover:bg-background/60"
                    >
                      <td className="px-5 py-4">
                        <InvoiceName invoice={invoice} />
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {invoice.customer}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {invoice.date}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {invoice.dueDate}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-text-primary">
                        ${invoice.amount.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>

                      <td className="px-5 py-4">
                        <Actions
                          invoice={invoice}
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
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <InvoiceName invoice={invoice} />

                    <StatusBadge status={invoice.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MobileInfo label="Customer" value={invoice.customer} />

                    <MobileInfo
                      label="Amount"
                      value={`$${invoice.amount.toLocaleString()}`}
                    />

                    <MobileInfo label="Date" value={invoice.date} />

                    <MobileInfo label="Due Date" value={invoice.dueDate} />
                  </div>

                  <Actions
                    invoice={invoice}
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

        {!loading && filteredInvoices.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredInvoices.length} of {invoices.length} invoices
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
                    ? "Add Invoice"
                    : modal === "edit"
                      ? "Edit Invoice"
                      : "Invoice Details"}
                </h2>

                {modal !== "view" && (
                  <p className="mt-1 text-xs text-text-muted">
                    Fill in the invoice information.
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

            {modal === "view" && selectedInvoice && (
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light text-sm font-bold text-primary">
                    $
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text-primary">
                      {selectedInvoice.invoiceNumber}
                    </h3>

                    <p className="mt-1 text-sm text-text-secondary">
                      {selectedInvoice.customer}
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={selectedInvoice.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <Info
                    label="Invoice Number"
                    value={selectedInvoice.invoiceNumber}
                  />

                  <Info label="Customer" value={selectedInvoice.customer} />

                  <Info label="Date" value={selectedInvoice.date} />

                  <Info label="Due Date" value={selectedInvoice.dueDate} />

                  <Info
                    label="Amount"
                    value={`$${selectedInvoice.amount.toLocaleString()}`}
                  />

                  <Info label="Status" value={selectedInvoice.status} />
                </div>
              </div>
            )}

            {modal !== "view" && (
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <Field
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={(value) => handleTextChange("invoiceNumber", value)}
                  required
                />

                <Field
                  label="Customer"
                  value={form.customer}
                  onChange={(value) => handleTextChange("customer", value)}
                  required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Invoice Date"
                    type="date"
                    value={form.date}
                    onChange={(value) => handleTextChange("date", value)}
                    required
                  />

                  <Field
                    label="Due Date"
                    type="date"
                    value={form.dueDate}
                    onChange={(value) => handleTextChange("dueDate", value)}
                    required
                  />
                </div>

                <NumberField
                  label="Amount"
                  value={form.amount}
                  onChange={handleAmountChange}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleStatusChange(event.target.value as InvoiceStatus)
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="Paid">Paid</option>

                    <option value="Pending">Pending</option>

                    <option value="Overdue">Overdue</option>
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
                        : "Add Invoice"}
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

function InvoiceName({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-sm font-semibold text-primary">
        $
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          {invoice.invoiceNumber}
        </p>

        <p className="truncate text-xs text-text-muted">#{invoice.id}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
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
  invoice,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}: {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onView(invoice)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Eye size={16} />
          View
        </button>

        <button
          onClick={() => onEdit(invoice)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(invoice)}
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
        onClick={() => onView(invoice)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="View"
      >
        <Eye size={17} />
      </button>

      <button
        onClick={() => onEdit(invoice)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="Edit"
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={() => onDelete(invoice)}
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

function NumberField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
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
        min={0}
        step="0.01"
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
