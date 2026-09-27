import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <FileQuestion size={28} />
        </div>

        <p className="mt-6 text-5xl font-bold text-primary">404</p>

        <h1 className="mt-3 text-xl font-bold text-text-primary">
          Page not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
