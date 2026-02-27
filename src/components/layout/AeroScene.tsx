import type { PropsWithChildren } from "react";
import { BubbleLayer } from "../decor/BubbleLayer";
import { FishLayer } from "../decor/FishLayer";
import { OrbLayer } from "../decor/OrbLayer";
import { ParticleCanvas } from "../decor/ParticleCanvas";
import { SparkleLayer } from "../decor/SparkleLayer";
import { useAeroPerformanceMode } from "../../hooks/useAeroPerformanceMode";

type AeroSceneProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
}>;

export function AeroScene({ className, contentClassName, children }: AeroSceneProps) {
  const { lowPowerMode, prefersReducedMotion } = useAeroPerformanceMode();

  return (
    <main className={`aero-page ${className ?? ""}`}>
      <div className="aero-wave-lines" />
      <div className="aero-lime-islands" />
      <OrbLayer className="opacity-100" />
      {prefersReducedMotion ? null : <ParticleCanvas className="opacity-85" density={lowPowerMode ? 14 : 34} />}
      <SparkleLayer className="opacity-95 mix-blend-screen" count={lowPowerMode ? 10 : 18} />
      <BubbleLayer className="opacity-100" count={lowPowerMode ? 14 : 28} />
      {prefersReducedMotion ? null : <BubbleLayer className="opacity-70 mix-blend-screen" count={lowPowerMode ? 8 : 14} />}
      {lowPowerMode ? null : <FishLayer className="opacity-90" />}
      <div className="aero-vignette" />
      <div className={`relative z-10 mx-auto w-full max-w-6xl p-4 md:p-8 ${contentClassName ?? ""}`}>{children}</div>
    </main>
  );
}
