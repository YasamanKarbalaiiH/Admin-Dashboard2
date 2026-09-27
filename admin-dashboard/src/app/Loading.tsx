export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-light" />

            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          </div>

          <p className="mt-5 text-sm font-medium text-text-secondary">
            Loading dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}
