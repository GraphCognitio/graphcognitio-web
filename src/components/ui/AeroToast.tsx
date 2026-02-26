import { CircleCheck, CircleX } from "lucide-react";

type AeroToastProps = {
  message: string;
  variant?: "success" | "error";
};

export function AeroToast({ message, variant = "success" }: AeroToastProps) {
  const isSuccess = variant === "success";

  return (
    <div
      className="aero-glass flex items-center gap-3 border px-4 py-3 text-sm font-semibold"
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CircleCheck aria-hidden="true" className="text-emerald-500" size={18} />
      ) : (
        <CircleX aria-hidden="true" className="text-rose-500" size={18} />
      )}
      <span>{message}</span>
    </div>
  );
}
