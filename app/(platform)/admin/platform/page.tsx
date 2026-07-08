export default function PlatformAdminPage() {
  return (
    <main className="min-h-full bg-[#0b0d12] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
          Platform admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Platform dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Catalog, tenants, and audit tools ship in a later phase. You are
          signed in as a platform operator.
        </p>
      </div>
    </main>
  );
}
