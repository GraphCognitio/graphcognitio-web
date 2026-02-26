import { useMemo } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function useAeroPerformanceMode() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    if (typeof navigator === "undefined") {
      return {
        prefersReducedMotion,
        lowPowerMode: prefersReducedMotion,
      };
    }

    const lowCpu = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
    return {
      prefersReducedMotion,
      lowPowerMode: prefersReducedMotion || lowCpu,
    };
  }, [prefersReducedMotion]);
}
