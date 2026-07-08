import type { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`mb-1.5 block font-sans text-xs font-medium uppercase tracking-wide text-black-200 ${className ?? ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
