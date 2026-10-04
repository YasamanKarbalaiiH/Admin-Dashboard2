"use client";

import type { InvoiceFormData, InvoiceStatus } from "../../types/invoice";

type InvoiceFormProps = {
  form: InvoiceFormData;
  saving: boolean;
  mode: "add" | "edit";
  onTextChange: (
    field: "invoiceNumber" | "customer" | "date" | "dueDate",
    value: string,
  ) => void;
  onAmountChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function InvoiceForm({
  form,
  saving,
  mode,
  onTextChange,
  onAmountChange,
  onStatusChange,
  onSubmit,
  onClose,
}: InvoiceFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <Field
        label="Invoice Number"
        value={form.invoiceNumber}
        onChange={(value) => onTextChange("invoiceNumber", value)}
        required
      />

      <Field
        label="Customer"
        value={form.customer}
        onChange={(value) => onTextChange("customer", value)}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Invoice Date"
          type="date"
          value={form.date}
          onChange={(value) => onTextChange("date", value)}
          required
        />

        <Field
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(value) => onTextChange("dueDate", value)}
          required
        />
      </div>

      <NumberField
        label="Amount"
        value={form.amount}
        onChange={onAmountChange}
        required
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Status
        </label>

        <select
          value={form.status}
          onChange={(event) =>
            onStatusChange(event.target.value as InvoiceStatus)
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
          onClick={onClose}
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
            : mode === "edit"
              ? "Save Changes"
              : "Add Invoice"}
        </button>
      </div>
    </form>
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
