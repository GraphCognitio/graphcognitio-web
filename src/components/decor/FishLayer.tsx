import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type FishLayerProps = {
  className?: string;
};

type FishProps = {
  style: React.CSSProperties;
};

function Fish({ style }: FishProps) {
  return (
    <svg viewBox="0 0 140 68" fill="none" style={style} className="drop-shadow-[0_6px_14px_rgba(13,112,181,0.22)]">
      <defs>
        <linearGradient id="fishBodyGradient" x1="14" x2="122" y1="18" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e5fbff" />
          <stop offset="0.38" stopColor="#8de8ff" />
          <stop offset="1" stopColor="#32bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M18 34C18 21 33 12 55 12C79 12 101 22 120 34C101 46 79 56 55 56C33 56 18 47 18 34Z"
        fill="url(#fishBodyGradient)"
      />
      <path d="M122 34L138 18V50L122 34Z" fill="#2caee8" />
      <circle cx="45" cy="31" r="3.6" fill="#0e5e8f" />
      <path d="M56 22C71 23 84 29 92 34C84 39 71 45 56 46" stroke="#dff9ff" strokeWidth="2" />
      <path d="M35 47C43 48 50 47 57 42" stroke="#cbf6ff" strokeWidth="2" strokeLinecap="round" />
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
          width: "110px",
          left: "8%",
          top: "24%",
          opacity: 0.25,
          animation: reducedMotion ? undefined : "fish-drift 16s ease-in-out infinite",
          ["--fish-scale" as string]: "0.9",
        }}
      />
      <Fish
        style={{
          position: "absolute",
          width: "92px",
          right: "13%",
          top: "62%",
          opacity: 0.22,
          transform: "scaleX(-1)",
          animation: reducedMotion ? undefined : "fish-drift 19s ease-in-out -4s infinite",
          ["--fish-scale" as string]: "0.75",
        }}
      />
      <Fish
        style={{
          position: "absolute",
          width: "128px",
          right: "30%",
          top: "18%",
          opacity: 0.2,
          animation: reducedMotion ? undefined : "fish-drift 22s ease-in-out -8s infinite",
          ["--fish-scale" as string]: "1",
        }}
      />
    </div>
  );
}
