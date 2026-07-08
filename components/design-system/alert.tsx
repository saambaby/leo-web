import type { ReactNode } from "react";

interface AlertProps {
  variant: "error" | "success" | "info";
  children: ReactNode;
}

export function Alert({ variant, children }: AlertProps) {
  const styles = {
    error: "border-signal-error/30 bg-signal-error/10 text-signal-error",
    success: "border-signal-live/30 bg-signal-live/10 text-signal-live",
    info: "border-signal-info/30 bg-signal-info/10 text-signal-info",
  }[variant];

  return (
    <div className={`rounded-lg border px-3 py-2.5 font-sans text-sm ${styles}`}>
      {children}
    </div>
  );
}
