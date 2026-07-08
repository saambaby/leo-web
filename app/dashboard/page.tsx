"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, clearSession } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#0b0d12] text-sm text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-full bg-[#0b0d12] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
          Leo Connexio
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Signed in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Admin shell placeholder. LSP, customer, and platform admin surfaces
          ship in later phases.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void clearSession().then(() => router.push("/login"));
            }}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
