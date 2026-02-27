import { useMemo } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type BubbleLayerProps = {
  count?: number;
  className?: string;
};

type Bubble = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

export function BubbleLayer({ count = 18, className }: BubbleLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const bubbleCount = reducedMotion ? Math.max(7, Math.floor(count / 2)) : count;

  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: bubbleCount }, (_, index) => {
      const seed = (index + 1) * 9301;
      const rand = (multiplier: number) => ((seed * multiplier) % 1000) / 1000;

      return {
        id: index,
        left: 2 + rand(17) * 96,
        size: 12 + rand(19) * 66,
        duration: 16 + rand(31) * 24,
        delay: rand(37) * -28,
        drift: -30 + rand(23) * 60,
        opacity: 0.16 + rand(29) * 0.3,
      };
    });
  }, [bubbleCount]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="aero-bubble absolute bottom-[-180px] rounded-full"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            animationName: reducedMotion ? undefined : "bubble-float",
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            ["--drift" as string]: `${bubble.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
