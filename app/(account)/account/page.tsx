import { WorkstationCta } from "@/components/workstation-cta";

export default function AccountPage() {
  return (
    <main className="min-h-full bg-[#0b0d12] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Awaiting affiliation</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Your interpreter account is active but not yet linked to an
          organization. Security settings and MFA management ship in a later
          phase.
        </p>
        <WorkstationCta />
      </div>
    </main>
  );
}
