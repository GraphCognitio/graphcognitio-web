import type { InputHTMLAttributes } from "react";

type AeroInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AeroInput({ id, label, className, ...props }: AeroInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={id}>
      <span className="aero-input-label">{label}</span>
      <input id={id} className={`aero-input ${className ?? ""}`} {...props} />
    </label>
  );
}
