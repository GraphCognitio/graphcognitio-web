import { useMemo } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type SparkleLayerProps = {
  className?: string;
  count?: number;
};

type Sparkle = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

export function SparkleLayer({ className, count = 14 }: SparkleLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const sparkleCount = reducedMotion ? Math.max(6, Math.floor(count / 2)) : count;

  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: sparkleCount }, (_, index) => {
      const seed = (index + 11) * 7919;
      const rand = (multiplier: number) => ((seed * multiplier) % 1000) / 1000;

      return {
        id: index,
        left: 4 + rand(7) * 92,
        top: 6 + rand(13) * 84,
        size: 10 + rand(19) * 18,
        opacity: 0.26 + rand(29) * 0.42,
        duration: 2.8 + rand(31) * 3.9,
        delay: rand(37) * -5.6,
      };
    });
  }, [sparkleCount]);

  return (
    <div className={`aero-sparkle-layer ${className ?? ""}`} aria-hidden="true">
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="aero-sparkle-cross"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            opacity: sparkle.opacity,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
            animationName: reducedMotion ? undefined : "sparkle-twinkle",
          }}
        />
      ))}
    </div>
  );
}
