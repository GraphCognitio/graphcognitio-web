import { CircleCheck, CircleX } from "lucide-react";
import { AeroIconBadge } from "./AeroIconBadge";

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
        <AeroIconBadge tone="lime">
          <CircleCheck aria-hidden="true" size={14} />
        </AeroIconBadge>
      ) : (
        <AeroIconBadge tone="rose">
          <CircleX aria-hidden="true" size={14} />
        </AeroIconBadge>
      )}
      <span>{message}</span>
    </div>
  );
}
