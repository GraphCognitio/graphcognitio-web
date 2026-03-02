import type { ButtonHTMLAttributes } from "react";

type GelButtonVariant = 'cyan' | 'violet' | 'green' | 'orange';

interface GelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GelButtonVariant;
}const variantStyles: Record<GelButtonVariant, string> = {
  cyan: "bg-gradient-to-b from-[#4facfe] to-[#00f2fe] shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,153,255,0.4),0_0_15px_rgba(0,242,254,0.5),inset_0_2px_0_rgba(255,255,255,1)]",
  violet: "bg-gradient-to-b from-violet-500 to-purple-700 shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(167,139,250,0.6),0_0_15px_rgba(142,197,252,0.6),inset_0_2px_0_rgba(255,255,255,1)]",
  green: "bg-gradient-to-b from-lime-400 to-green-500 shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(132,204,22,0.6),0_0_15px_rgba(74,222,128,0.6),inset_0_2px_0_rgba(255,255,255,1)]",
  orange: "bg-gradient-to-b from-yellow-400 to-orange-500 shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(250,204,21,0.6),0_0_15px_rgba(251,146,60,0.6),inset_0_2px_0_rgba(255,255,255,1)]",
};

export function GelButton({ className, children, type = "button", variant = 'cyan', ...props }: GelButtonProps) {
  return (
    <button
      type={type}
      className={`relative overflow-hidden rounded-full border border-white/90 px-5 py-2.5 text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all hover:-translate-y-0.5 hover:scale-[1.05] aero-focus-ring inline-flex items-center justify-center gap-2 ${variantStyles[variant]} ${className ?? ""}`}
      {...props}
    >
      {/* Glossy specular highlight overlay */}
      <span className="absolute inset-x-0.5 top-0.5 h-[45%] rounded-[999px_999px_200px_200px/999px] bg-gradient-to-b from-white/95 to-white/10 pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(255,255,255,1)] tracking-wide">
        {children}
      </span>
    </button>
  );
}
