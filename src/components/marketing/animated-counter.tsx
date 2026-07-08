"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  /**
   * Dashboard stat cards should count up as soon as they mount — a card sitting
   * below the fold on a KPI dashboard isn't a "reveal on scroll" moment, it's
   * just a number the user came to check, so making them scroll first to see
   * it stop reading "0" is a bug, not a feature. The landing page's scroll-in
   * stats section is the one place `false` (the default) still makes sense.
   */
  immediate?: boolean;
}

export function AnimatedCounter({ value, suffix = "", prefix = "", decimals = 0, immediate = false }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Inset only the bottom edge: the counter starts once it clears the bottom
  // of the viewport. A four-sided inset would prevent small spans near the
  // left edge (narrow viewports) from ever intersecting.
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 25 });

  useEffect(() => {
    if (immediate || isInView) motionValue.set(value);
  }, [immediate, isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString("fr-FR", {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        })}${suffix}`;
      }
    });
  }, [spring, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
