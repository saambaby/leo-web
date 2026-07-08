import type { InputHTMLAttributes, ReactNode } from "react";
import { Checkbox, Input, Label } from "@/components/design-system";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

export function FormField({ label, hint, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="block">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} className={className} {...props} />
      {hint ? (
        <span className="mt-1.5 block font-sans text-xs text-black-200">{hint}</span>
      ) : null}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div className="block">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black-600 bg-black-700 px-3 py-2.5 font-sans text-sm text-foreground outline-none focus:border-signal-live/60 focus:ring-2 focus:ring-signal-live/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 font-sans text-sm text-black-50">
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
