import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-signal-live font-medium text-black-900 hover:bg-signal-live/90",
    secondary:
      "border border-black-500 bg-black-700 font-medium text-foreground hover:bg-black-600",
  };

  return (
    <button
      className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 font-display text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
