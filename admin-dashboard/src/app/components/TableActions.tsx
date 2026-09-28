"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

type TableActionsProps<T> = {
  item: T;
  onView: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  mobile?: boolean;
};

export default function TableActions<T>({
  item,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}: TableActionsProps<T>) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onView(item)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Eye size={16} />
          View
        </button>

        <button
          onClick={() => onEdit(item)}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-primary-light hover:text-primary"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          onClick={() => onDelete(item)}
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
        onClick={() => onView(item)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="View"
      >
        <Eye size={17} />
      </button>

      <button
        onClick={() => onEdit(item)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary"
        title="Edit"
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={() => onDelete(item)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-danger-light hover:text-danger"
        title="Delete"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
