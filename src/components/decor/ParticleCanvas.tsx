import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type ParticleCanvasProps = {
  className?: string;
  density?: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  kind: "dot" | "spark";
};

export function ParticleCanvas({ className, density = 34 }: ParticleCanvasProps) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    let frameId = 0;
    let lastTimestamp = 0;
    const particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles.length = 0;
      const count = reducedMotion ? Math.floor(density / 3) : density;
      for (let index = 0; index < count; index += 1) {
        const spark = index % 7 === 0;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (spark ? 0.08 : 0.14),
          vy: (Math.random() - 0.5) * (spark ? 0.07 : 0.12),
          radius: spark ? 2.2 + Math.random() * 1.4 : 0.9 + Math.random() * 2.2,
          alpha: spark ? 0.22 + Math.random() * 0.22 : 0.08 + Math.random() * 0.22,
          kind: spark ? "spark" : "dot",
        });
      }
    };

    const draw = (timestamp: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      const delta = lastTimestamp ? timestamp - lastTimestamp : 16;
      lastTimestamp = timestamp;
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
        }

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        if (particle.kind === "spark") {
          context.strokeStyle = `rgba(238, 252, 255, ${particle.alpha})`;
          context.lineWidth = 1.1;
          context.beginPath();
          context.moveTo(particle.x - particle.radius, particle.y);
          context.lineTo(particle.x + particle.radius, particle.y);
          context.moveTo(particle.x, particle.y - particle.radius);
          context.lineTo(particle.x, particle.y + particle.radius);
          context.stroke();
          continue;
        }

        context.beginPath();
        context.fillStyle = `rgba(255,255,255,${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [density, reducedMotion]);

  return <canvas className={`pointer-events-none absolute inset-0 ${className ?? ""}`} ref={canvasRef} aria-hidden="true" />;
}
