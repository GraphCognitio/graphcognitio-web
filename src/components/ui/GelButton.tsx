import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type GelButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function GelButton({ className, children, type = "button", ...props }: GelButtonProps) {
  return (
    <button
      type={type}
      className={`relative overflow-hidden rounded-full border border-white/90 bg-gradient-to-b from-[#4facfe] to-[#00f2fe] px-5 py-2.5 text-sm font-bold text-[#003761] shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_16px_rgba(0,153,255,0.4),0_0_15px_rgba(0,242,254,0.5),inset_0_2px_0_rgba(255,255,255,1)] aero-focus-ring inline-flex items-center justify-center gap-2 ${className ?? ""}`}
      {...props}
    >
      {/* Glossy specular highlight overlay */}
      <span className="absolute inset-x-0.5 top-0.5 h-[45%] rounded-[999px_999px_200px_200px/999px] bg-gradient-to-b from-white/95 to-white/10 pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
        {children}
      </span>
    </button>
  );
}
