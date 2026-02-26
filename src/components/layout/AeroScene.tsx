import type { PropsWithChildren } from "react";
import { BubbleLayer } from "../decor/BubbleLayer";
import { FishLayer } from "../decor/FishLayer";
import { ParticleCanvas } from "../decor/ParticleCanvas";

type AeroSceneProps = PropsWithChildren<{
  className?: string;
}>;

export function AeroScene({ className, children }: AeroSceneProps) {
  return (
    <main className={`aero-page ${className ?? ""}`}>
      <ParticleCanvas className="opacity-70" density={32} />
      <BubbleLayer className="opacity-90" count={20} />
      <FishLayer className="opacity-75" />
      <div className="aero-vignette" />
      <div className="relative z-10 mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>
    </main>
  );
}
