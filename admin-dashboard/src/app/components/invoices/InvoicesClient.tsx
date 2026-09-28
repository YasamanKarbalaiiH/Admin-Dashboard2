"use client";

import { useMemo, useState } from "react";
import TableActions from "../TableActions";
import Modal from "../Modal";
import InfoField from "../InfoField";
import InvoiceForm from "./InvoiceForm";
import { Plus, Search, X } from "lucide-react";
import Table from "../Table";
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
const invoiceColumns = [
  { label: "Invoice" },
  { label: "Customer" },
  { label: "Date" },
  { label: "Due Date" },
  { label: "Amount" },
  { label: "Status" },
  { label: "Actions", align: "right" as const },
];
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
            <Table
              data={filteredInvoices}
              columns={invoiceColumns}
              getRowKey={(invoice) => invoice.id}
              renderDesktopCells={(invoice) => (
                <>
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
                    <TableActions
                      item={invoice}
                      onView={openViewModal}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  </td>
                </>
              )}
              renderMobileContent={(invoice) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <InvoiceName invoice={invoice} />
                    <StatusBadge status={invoice.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoField
                      label="Customer"
                      value={invoice.customer}
                      variant="mobile"
                    />

                    <InfoField
                      label="Amount"
                      value={`$${invoice.amount.toLocaleString()}`}
                      variant="mobile"
                    />

                    <InfoField
                      label="Date"
                      value={invoice.date}
                      variant="mobile"
                    />

                    <InfoField
                      label="Due Date"
                      value={invoice.dueDate}
                      variant="mobile"
                    />
                  </div>

                  <TableActions
                    item={invoice}
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

        {!loading && filteredInvoices.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        )}
      </div>

      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={
          modal === "add"
            ? "Add Invoice"
            : modal === "edit"
              ? "Edit Invoice"
              : "Invoice Details"
        }
      >
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
              <InfoField
                label="Invoice"
                value={selectedInvoice.invoiceNumber}
              />
              <InfoField label="Customer" value={selectedInvoice.customer} />
              <InfoField label="Date" value={selectedInvoice.date} />
              <InfoField label="Due Date" value={selectedInvoice.dueDate} />
              <InfoField
                label="Amount"
                value={`$${selectedInvoice.amount.toLocaleString()}`}
              />
            </div>
          </div>
        )}

        {modal !== "view" && (
          <InvoiceForm
            form={form}
            saving={saving}
            mode={modal === "edit" ? "edit" : "add"}
            onTextChange={handleTextChange}
            onAmountChange={handleAmountChange}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </Modal>
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
