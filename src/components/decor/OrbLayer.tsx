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
  { id: "orb-main", size: 360, left: "7%", top: "9%", opacity: 0.56, driftX: "16px", driftY: "-14px", duration: "34s" },
  { id: "orb-lime", size: 240, left: "74%", top: "15%", opacity: 0.46, driftX: "-10px", driftY: "-8px", duration: "28s" },
  { id: "orb-cyan", size: 210, left: "66%", top: "62%", opacity: 0.42, driftX: "-12px", driftY: "12px", duration: "30s" },
  { id: "orb-soft", size: 170, left: "20%", top: "72%", opacity: 0.34, driftX: "8px", driftY: "-6px", duration: "26s" },
  { id: "orb-deep", size: 270, left: "37%", top: "24%", opacity: 0.3, driftX: "9px", driftY: "10px", duration: "32s" },
  { id: "orb-corner", size: 190, left: "83%", top: "70%", opacity: 0.28, driftX: "-8px", driftY: "7px", duration: "24s" },
];

const FLARES: Flare[] = [
  { id: "flare-top", left: "77%", top: "10%", size: "128px", duration: "6.3s" },
  { id: "flare-mid", left: "42%", top: "24%", size: "96px", duration: "5.9s" },
  { id: "flare-low", left: "16%", top: "66%", size: "104px", duration: "7.2s" },
  { id: "flare-right", left: "89%", top: "44%", size: "74px", duration: "5.3s" },
];

export function OrbLayer({ className }: OrbLayerProps) {
  const reducedMotion = usePrefersReducedMotion();

  const visibleOrbs = useMemo(() => {
    return reducedMotion ? ORBS.slice(0, 3) : ORBS;
  }, [reducedMotion]);

  const visibleFlares = useMemo(() => {
    return reducedMotion ? FLARES.slice(0, 2) : FLARES;
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
