"use client";

type InfoFieldProps = {
  label: string;
  value: string;
  variant?: "mobile" | "default";
};

export default function InfoField({
  label,
  value,
  variant = "default",
}: InfoFieldProps) {
  if (variant === "mobile") {
    return (
      <div className="rounded-xl bg-background p-3">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-text-primary">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-medium text-text-primary">
        {value}
      </p>
    </div>
  );
}
