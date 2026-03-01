import { useEffect } from "react";
import "./aero-fx.css";

export function MouseGlowLayer() {
  useEffect(() => {
    let lastSparkleTime = 0;

    const createSparkle = (x: number, y: number) => {
      const sparkle = document.createElement("div");
      sparkle.className = "cursor-sparkle";

      // Add randomness to position
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;

      sparkle.style.left = `${x + offsetX}px`;
      sparkle.style.top = `${y + offsetY}px`;

      // Random scale and animation duration
      const scale = Math.random() * 1.2 + 0.8;
      const duration = Math.random() * 0.5 + 0.4;

      sparkle.style.animationDuration = `${duration}s`;
      sparkle.style.transform = `translate(-50%, -50%) scale(${scale})`;

      document.body.appendChild(sparkle);

      // Remove element after animation finishes
      setTimeout(() => {
        sparkle.remove();
      }, duration * 1000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle sparkle creation (one every 40ms)
      if (now - lastSparkleTime > 40) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleTime = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
}
