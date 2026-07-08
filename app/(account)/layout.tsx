import { ProtectedGuard } from "@/components/protected-guard";

export default function AccountGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
