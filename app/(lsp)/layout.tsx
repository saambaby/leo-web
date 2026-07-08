import { ProtectedGuard } from "@/components/protected-guard";

export default function LspGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
