import { CircleCheck, CircleX } from "lucide-react";

type AeroToastProps = {
  message: string;
  variant?: "success" | "error";
};

export function AeroToast({ message, variant = "success" }: AeroToastProps) {
  const isSuccess = variant === "success";

  return (
    <div
      className={`aero-toast aero-panel flex items-center gap-3 border px-4 py-3 text-sm font-semibold ${
        isSuccess ? "text-emerald-900" : "text-rose-900"
      }`}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CircleCheck aria-hidden="true" className="text-emerald-600" size={18} />
      ) : (
        <CircleX aria-hidden="true" className="text-rose-600" size={18} />
      )}
      <span>{message}</span>
    </div>
  );
}
