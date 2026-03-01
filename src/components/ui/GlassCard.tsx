import type { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[24px] border border-white/95 border-t-[2px] border-t-white bg-white/45 p-5 shadow-[0_12px_32px_0_rgba(0,78,140,0.25),inset_0_2px_5px_rgba(255,255,255,0.5)] backdrop-blur-md aero-float ${className ?? ""}`}
    >
      {/* Glossy shine effect on top of glass panels */}
      <span className="absolute inset-x-0 top-0 h-[45%] rounded-[24px_24px_100%_100%/15px] bg-gradient-to-b from-white/60 to-white/5 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
