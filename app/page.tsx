import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-[#0b0d12] px-6 py-16 text-center text-white">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
        Leo Connexio
      </p>
      <h1 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight">
        Web admin &amp; onboarding
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        P1 auth shell — signup, email verification, and sign in against{" "}
        <code className="text-zinc-300">leo-api</code>.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
