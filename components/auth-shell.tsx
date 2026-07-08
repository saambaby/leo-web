import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-[#0b0d12] px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
            Leo Connexio
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          {children}
        </div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>
        ) : null}
        <p className="mt-8 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">
            leo-web
          </Link>
        </p>
      </div>
    </main>
  );
}
