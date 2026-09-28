"use client";

import type { ProductFormData, ProductStatus } from "../../types/product";

type ProductFormProps = {
  form: ProductFormData;
  saving: boolean;
  mode: "add" | "edit";
  onTextChange: (field: "name" | "category", value: string) => void;
  onNumberChange: (field: "price" | "stock", value: string) => void;
  onStatusChange: (value: ProductStatus) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function ProductForm({
  form,
  saving,
  onTextChange,
  onNumberChange,
  onStatusChange,
  onSubmit,
  onClose,
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5">
      <Field
        label="Product Name"
        value={form.name}
        onChange={(value) => onTextChange("name", value)}
        required
      />

      <Field
        label="Category"
        value={form.category}
        onChange={(value) => onTextChange("category", value)}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Price"
          value={form.price}
          min={0}
          step="0.01"
          onChange={(value) => onNumberChange("price", value)}
          required
        />

        <NumberField
          label="Stock"
          value={form.stock}
          min={0}
          step="1"
          onChange={(value) => onNumberChange("stock", value)}
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
            onStatusChange(event.target.value as ProductStatus)
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
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
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
