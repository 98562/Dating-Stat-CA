export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="max-w-md rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
          Loading
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink-900">Getting the calculator ready</h1>
        <p className="mt-3 text-sm text-ink-500">
          Loading the latest population snapshot and the active filter set.
        </p>
      </div>
    </div>
  );
}
