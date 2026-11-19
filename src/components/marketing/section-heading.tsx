"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * How every section of the landing opens: the signal dot and a short label,
 * then the title in the display face. The same three marks in the same order
 * each time, so the page reads as one voice from top to bottom.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-foreground/70 uppercase",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className="display text-4xl sm:text-5xl">{title}</h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </motion.div>
  );
}
