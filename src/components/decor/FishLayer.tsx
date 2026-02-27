import { useId, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type FishLayerProps = {
  className?: string;
};

type FishProps = {
  style: CSSProperties;
};

function Fish({ style }: FishProps) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 140 68" fill="none" style={style} className="aero-fish">
      <defs>
        <linearGradient id={gradientId} x1="14" x2="122" y1="18" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e5fbff" />
          <stop offset="0.37" stopColor="#9deeff" />
          <stop offset="1" stopColor="#2cb7f1" />
        </linearGradient>
      </defs>
      <path
        d="M18 34C18 21 33 12 55 12C79 12 101 22 120 34C101 46 79 56 55 56C33 56 18 47 18 34Z"
        fill={`url(#${gradientId})`}
      />
      <path d="M122 34L138 18V50L122 34Z" fill="#27aae4" />
      <circle cx="45" cy="31" r="3.6" fill="#0e5e8f" />
      <path d="M56 22C71 23 84 29 92 34C84 39 71 45 56 46" stroke="#effcff" strokeWidth="2" />
      <path d="M35 47C43 48 50 47 57 42" stroke="#d7f9ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FishLayer({ className }: FishLayerProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      <Fish
        style={{
          position: "absolute",
          width: "118px",
          left: "7%",
          top: "22%",
          opacity: 0.24,
          animation: reducedMotion ? undefined : "fish-drift 17s ease-in-out infinite",
          ["--fish-scale" as string]: "0.92",
        }}
      />
      <Fish
        style={{
          position: "absolute",
          width: "98px",
          right: "12%",
          top: "60%",
          opacity: 0.2,
          transform: "scaleX(-1)",
          animation: reducedMotion ? undefined : "fish-drift 20s ease-in-out -5s infinite",
          ["--fish-scale" as string]: "0.78",
        }}
      />
      <Fish
        style={{
          position: "absolute",
          width: "132px",
          right: "31%",
          top: "16%",
          opacity: 0.18,
          animation: reducedMotion ? undefined : "fish-drift 23s ease-in-out -9s infinite",
          ["--fish-scale" as string]: "1.02",
        }}
      />
      {reducedMotion ? null : (
        <Fish
          style={{
            position: "absolute",
            width: "86px",
            left: "42%",
            top: "72%",
            opacity: 0.16,
            animation: "fish-drift 21s ease-in-out -12s infinite",
            ["--fish-scale" as string]: "0.7",
          }}
        />
      )}
    </div>
  );
}
