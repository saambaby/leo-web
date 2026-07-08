import { AdminShell } from "@/components/admin-shell";
import { ProtectedGuard } from "@/components/protected-guard";

export default function PlatformGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedGuard>
      <AdminShell>{children}</AdminShell>
    </ProtectedGuard>
  );
}
