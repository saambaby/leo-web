import { ProtectedGuard } from "@/components/protected-guard";

export default function PlatformGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
