import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

type UseFisheyeDockOptions = {
  amplitude?: number;
  sigma?: number;
};

export function useFisheyeDock({ amplitude = 0.55, sigma = 96 }: UseFisheyeDockOptions = {}) {
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const mouseYRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const applyTransforms = useCallback(() => {
    rafRef.current = null;

    itemRefs.current.forEach((element) => {
      const mouseY = mouseYRef.current;
      let scale = 1;
      let lift = 0;

      if (mouseY !== null) {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distance = mouseY - centerY;
        const influence = Math.exp(-(distance * distance) / (2 * sigma * sigma));
        scale = 1 + amplitude * influence;
        lift = -10 * influence;

        const orbScale = 1 + amplitude * 0.72 * influence;
        const orbLift = -7 * influence;
        const orbGlow = 20 + influence * 28;
        element.style.setProperty("--dock-orb-scale", orbScale.toFixed(3));
        element.style.setProperty("--dock-orb-lift", `${orbLift.toFixed(2)}px`);
        element.style.setProperty("--dock-orb-glow", `${orbGlow.toFixed(2)}px`);
      } else {
        element.style.setProperty("--dock-orb-scale", "1");
        element.style.setProperty("--dock-orb-lift", "0px");
        element.style.setProperty("--dock-orb-glow", "20px");
      }

      element.style.setProperty("--dock-scale", scale.toFixed(3));
      element.style.setProperty("--dock-lift", `${lift.toFixed(2)}px`);
      element.style.zIndex = `${100 + Math.round(scale * 100)}`;
    });
  }, [amplitude, sigma]);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(applyTransforms);
  }, [applyTransforms]);

  const registerItem = useCallback(
    (itemId: string) => (element: HTMLElement | null) => {
      if (element) {
        itemRefs.current.set(itemId, element);
      } else {
        itemRefs.current.delete(itemId);
      }

      scheduleUpdate();
    },
    [scheduleUpdate],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      mouseYRef.current = event.clientY;
      scheduleUpdate();
    },
    [scheduleUpdate],
  );

  const handlePointerLeave = useCallback(() => {
    mouseYRef.current = null;
    scheduleUpdate();
  }, [scheduleUpdate]);

  useEffect(() => {
    const handleResize = () => scheduleUpdate();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scheduleUpdate]);

  return {
    registerItem,
    handlePointerMove,
    handlePointerLeave,
  };
}
