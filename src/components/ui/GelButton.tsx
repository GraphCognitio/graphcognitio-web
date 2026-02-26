import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type GelButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function GelButton({ className, children, type = "button", ...props }: GelButtonProps) {
  return (
    <button
      type={type}
      className={`aero-gel aero-focus-ring inline-flex items-center justify-center gap-2 px-4 py-2 text-sm transition ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
