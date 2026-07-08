"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function ProtectedGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken } = useAuth();

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

  return <>{children}</>;
}
