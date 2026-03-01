import type { InputHTMLAttributes } from "react";

type AeroInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AeroInput({ id, label, className, ...props }: AeroInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={id}>
      <span className="font-semibold text-[#004e8c] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] ml-1">{label}</span>
      <input
        id={id}
        className={`w-full rounded-[14px] border-[2px] border-white/80 bg-white/70 px-4 py-2.5 text-[#1f2937] shadow-[inset_0_2px_6px_rgba(0,78,140,0.15),0_2px_4px_rgba(255,255,255,0.6)] backdrop-blur-md transition-all placeholder:text-[#374151]/60 focus:border-[#00f2fe] focus:bg-white/90 focus:outline-none focus:ring-[4px] focus:ring-[#4facfe]/30 ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
