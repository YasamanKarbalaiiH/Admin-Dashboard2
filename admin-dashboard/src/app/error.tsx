"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-light text-danger">
          <AlertCircle size={28} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-text-primary">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          We couldn&apos;t load this page. Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          <RefreshCw size={17} />
          Try again
        </button>
      </div>
    </div>
  );
}
