export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-border" />

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="h-10 w-full max-w-sm animate-pulse rounded-xl bg-background" />

        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-xl bg-background"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
