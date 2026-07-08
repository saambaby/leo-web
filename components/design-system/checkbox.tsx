import { forwardRef, type InputHTMLAttributes } from "react";

export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(function Checkbox({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={`mt-0.5 rounded border-black-500 bg-black-700 text-signal-live focus:ring-signal-live/30 ${className ?? ""}`}
      {...props}
    />
  );
});
