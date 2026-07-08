import { WorkstationCta } from "@/components/workstation-cta";

export default function PortalCallPage() {
  return (
    <main className="min-h-full bg-[#0b0d12] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
          Customer portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Call portal</h1>
        <p className="mt-2 text-sm text-zinc-400">
          The in-browser call request experience ships in P3. Until then, place
          and manage calls from Leo Workstation.
        </p>
        <WorkstationCta />
      </div>
    </main>
  );
}
