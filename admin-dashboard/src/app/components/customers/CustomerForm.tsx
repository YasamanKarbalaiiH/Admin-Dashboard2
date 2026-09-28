"use client";

import type { CustomerFormData, CustomerStatus } from "../../types/customer";

type CustomerFormProps = {
  form: CustomerFormData;
  saving: boolean;
  mode: "add" | "edit";
  onChange: (field: keyof CustomerFormData, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function CustomerForm({
  form,
  saving,
  mode,
  onChange,
  onSubmit,
  onClose,
}: CustomerFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <Field
        label="Full Name"
        value={form.name}
        onChange={(value) => onChange("name", value)}
        required
      />

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => onChange("email", value)}
        required
      />

      <Field
        label="Phone"
        value={form.phone}
        onChange={(value) => onChange("phone", value)}
        required
      />

      <Field
        label="Company"
        value={form.company}
        onChange={(value) => onChange("company", value)}
        required
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          Status
        </label>

        <select
          value={form.status}
          onChange={(event) =>
            onChange("status", event.target.value as CustomerStatus)
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
              : "Add Customer"}
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
