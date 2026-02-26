import type { PropsWithChildren } from "react";
import { BubbleLayer } from "../decor/BubbleLayer";
import { FishLayer } from "../decor/FishLayer";
import { ParticleCanvas } from "../decor/ParticleCanvas";
import { useAeroPerformanceMode } from "../../hooks/useAeroPerformanceMode";

type AeroSceneProps = PropsWithChildren<{
  className?: string;
}>;

export function AeroScene({ className, children }: AeroSceneProps) {
  const { lowPowerMode, prefersReducedMotion } = useAeroPerformanceMode();

  return (
    <main className={`aero-page ${className ?? ""}`}>
      {prefersReducedMotion ? null : <ParticleCanvas className="opacity-70" density={lowPowerMode ? 12 : 32} />}
      <BubbleLayer className="opacity-90" count={lowPowerMode ? 12 : 20} />
      {lowPowerMode ? null : <FishLayer className="opacity-75" />}
      <div className="aero-vignette" />
      <div className="relative z-10 mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
    </main>
  );
}
