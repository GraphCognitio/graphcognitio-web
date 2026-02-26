import type { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassCard({ children, className }: GlassCardProps) {
  return <section className={`aero-glass aero-float p-5 ${className ?? ""}`}>{children}</section>;
}
