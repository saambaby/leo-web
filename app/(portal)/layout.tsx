import { ProtectedGuard } from "@/components/protected-guard";

export default function PortalGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
