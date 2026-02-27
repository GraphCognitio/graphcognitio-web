import type { PropsWithChildren } from "react";
import { BubbleLayer } from "../decor/BubbleLayer";
import { FishLayer } from "../decor/FishLayer";
import { OrbLayer } from "../decor/OrbLayer";
import { ParticleCanvas } from "../decor/ParticleCanvas";
import { useAeroPerformanceMode } from "../../hooks/useAeroPerformanceMode";

type AeroSceneProps = PropsWithChildren<{
  className?: string;
}>;

export function AeroScene({ className, children }: AeroSceneProps) {
  const { lowPowerMode, prefersReducedMotion } = useAeroPerformanceMode();

  return (
    <main className={`aero-page ${className ?? ""}`}>
      <div className="aero-wave-lines" />
      <OrbLayer className="opacity-95" />
      {prefersReducedMotion ? null : <ParticleCanvas className="opacity-75" density={lowPowerMode ? 10 : 28} />}
      <BubbleLayer className="opacity-95" count={lowPowerMode ? 12 : 22} />
      {lowPowerMode ? null : <FishLayer className="opacity-85" />}
      <div className="aero-vignette" />
      <div className="relative z-10 mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
    </main>
  );
}
