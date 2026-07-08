import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-black-600 bg-black-700 px-3 py-2.5 font-sans text-sm text-foreground outline-none transition placeholder:text-black-300 focus:border-signal-live/60 focus:ring-2 focus:ring-signal-live/20 ${className ?? ""}`}
        {...props}
      />
    );
  },
);
