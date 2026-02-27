import { useMemo } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type OrbLayerProps = {
  className?: string;
};

type Orb = {
  id: string;
  size: number;
  left: string;
  top: string;
  opacity: number;
  driftX: string;
  driftY: string;
  duration: string;
};

type Flare = {
  id: string;
  left: string;
  top: string;
  size: string;
  duration: string;
};

const ORBS: Orb[] = [
  { id: "orb-main", size: 340, left: "8%", top: "13%", opacity: 0.5, driftX: "14px", driftY: "-14px", duration: "34s" },
  { id: "orb-lime", size: 220, left: "74%", top: "15%", opacity: 0.44, driftX: "-10px", driftY: "-8px", duration: "28s" },
  { id: "orb-cyan", size: 200, left: "65%", top: "62%", opacity: 0.4, driftX: "-12px", driftY: "12px", duration: "30s" },
  { id: "orb-soft", size: 160, left: "20%", top: "72%", opacity: 0.34, driftX: "8px", driftY: "-6px", duration: "26s" },
];

const FLARES: Flare[] = [
  { id: "flare-top", left: "76%", top: "11%", size: "118px", duration: "6.4s" },
  { id: "flare-mid", left: "42%", top: "24%", size: "88px", duration: "5.8s" },
  { id: "flare-low", left: "16%", top: "66%", size: "96px", duration: "7.3s" },
];

export function OrbLayer({ className }: OrbLayerProps) {
  const reducedMotion = usePrefersReducedMotion();

  const visibleOrbs = useMemo(() => {
    return reducedMotion ? ORBS.slice(0, 2) : ORBS;
  }, [reducedMotion]);

  const visibleFlares = useMemo(() => {
    return reducedMotion ? FLARES.slice(0, 1) : FLARES;
  }, [reducedMotion]);

  return (
    <div className={`aero-orb-layer ${className ?? ""}`} aria-hidden="true">
      {visibleOrbs.map((orb) => (
        <span
          key={orb.id}
          className="aero-orb"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: orb.left,
            top: orb.top,
            ["--orb-opacity" as string]: orb.opacity,
            ["--orb-drift-x" as string]: orb.driftX,
            ["--orb-drift-y" as string]: orb.driftY,
            ["--orb-duration" as string]: orb.duration,
          }}
        />
      ))}

      {visibleFlares.map((flare) => (
        <span
          key={flare.id}
          className="aero-flare"
          style={{
            left: flare.left,
            top: flare.top,
            ["--flare-size" as string]: flare.size,
            ["--flare-duration" as string]: flare.duration,
          }}
        />
      ))}
    </div>
  );
}
