import type { PropsWithChildren } from "react";

type AeroIconBadgeProps = PropsWithChildren<{
  className?: string;
  tone?: "cyan" | "lime" | "rose" | "violet";
}>;

export function AeroIconBadge({ className, tone = "cyan", children }: AeroIconBadgeProps) {
  return (
    <span className={`aero-icon-badge aero-icon-badge--${tone} ${className ?? ""}`} aria-hidden="true">
      {children}
    </span>
  );
}
