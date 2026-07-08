"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight animated particle field (canvas) with faint links between nearby
 * points — a subtle "network" backdrop for the hero. Tuned for mobile: fewer
 * particles and a lower pixel ratio on small screens, and it pauses when the
 * tab is hidden or the user prefers reduced motion.
 */
export function Particles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const linkDist = isMobile ? 96 : 135;
    let width = 0;
    let height = 0;
    let raf = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let particles: P[] = [];

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      // Far fewer points on phones — the O(n²) link pass stays cheap.
      const cap = isMobile ? 34 : 90;
      const floor = isMobile ? 16 : 36;
      const density = isMobile ? 17000 : 11000;
      const count = Math.min(cap, Math.max(floor, Math.floor((width * height) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.8 + 0.7,
        a: Math.random() * 0.5 + 0.4,
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }

      // Faint links between nearby particles (skip the sqrt with a squared test).
      const maxSq = linkDist * linkDist;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxSq) {
            const alpha = (1 - Math.sqrt(distSq) / linkDist) * 0.3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };
    const stop = () => cancelAnimationFrame(raf);

    resize();
    seed();
    if (reduceMotion) {
      render();
      cancelAnimationFrame(raf);
    } else {
      play();
    }

    // Pause the animation loop while the tab is hidden (saves battery/CPU).
    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) stop();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      resize();
      seed();
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
