"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The RevNetwork mascot: a fox, cut in the same flat facets as the logo's R
 * and painted in the brand's three colours — blue-violet, white, black.
 *
 * A fox because that is what a good affiliate is: quick, and hard to fool.
 * Drawn as polygons on a 200 × 200 grid so it stays sharp at any size and
 * can be recoloured or cropped without an image file. The pale outline on the
 * white facets is invisible on the dark landing and is what keeps the muzzle
 * from dissolving into a light dashboard.
 */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      {/* Ears */}
      <path d="M34 12 86 62 28 94z" fill="#5b5fe9" />
      <path d="M166 12 114 62 172 94z" fill="#4a46d6" />
      <path d="M42 32 72 62 40 80z" fill="#2a2493" />
      <path d="M158 32 128 62 160 80z" fill="#231e80" />
      {/* Cheek fur */}
      <path
        d="M20 122 4 136 26 142 12 158 56 162z"
        fill="#ffffff"
        stroke="#c9cbff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M180 122 196 136 174 142 188 158 144 162z"
        fill="#e2e3ff"
        stroke="#c9cbff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Head, lit from the left */}
      <path
        d="M28 94 86 62 100 56 114 62 172 94 180 124 146 162 100 194 54 162 20 124z"
        fill="#5b5fe9"
      />
      <path d="M28 94 86 62 100 56 100 110 58 102z" fill="#7b7ff7" />
      <path d="M172 94 114 62 100 56 100 110 142 102z" fill="#4f4fe0" />
      <path d="M100 56 88 100 100 146 112 100z" fill="#aeb1ff" />
      {/* Muzzle */}
      <path
        d="M20 124 52 114 86 132 100 152 100 194 54 162z"
        fill="#ffffff"
        stroke="#c9cbff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M180 124 148 114 114 132 100 152 100 194 146 162z"
        fill="#e2e3ff"
        stroke="#c9cbff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <path d="M44 109 76 97 92 118 62 129z" fill="#0b0c14" />
      <path d="M156 109 124 97 108 118 138 129z" fill="#0b0c14" />
      <path d="M65 104 78 100 82 111 70 115z" fill="#ffffff" />
      <path d="M121 104 134 100 138 111 126 115z" fill="#ffffff" />
      {/* Nose and mouth */}
      <path
        d="M90 158h20l-10 12z"
        fill="#0b0c14"
        stroke="#0b0c14"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M100 170v6 M100 176q-7 7-16 2 M100 176q7 7 16 2"
        fill="none"
        stroke="#0b0c14"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 30" className={className} aria-hidden>
      <path
        d="M4 30V14a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v16z"
        fill="#ffffff"
        stroke="#c9cbff"
        strokeWidth="1.5"
      />
      <path
        d="M16 6v11 M28 6v11"
        stroke="#b9bbf5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The fox looking over the top edge of whatever it is placed on: the head
 * down to just under the eyes, and two paws holding the edge.
 *
 * Position it so its bottom sits on the edge (`absolute bottom-full …`); the
 * paws hang over by half their height. It rises from behind the edge once,
 * when the page loads.
 */
export function MascotPeek({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div className={cn("pointer-events-none relative", className)} aria-hidden>
      <div className="overflow-hidden" style={{ aspectRatio: "200 / 147" }}>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          <Mascot className="block w-full" />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: delay + 0.55 }}
      >
        <Paw className="absolute bottom-0 -left-[3%] w-[23%] translate-y-[62%]" />
        <Paw className="absolute bottom-0 left-[80%] w-[23%] translate-y-[62%]" />
      </motion.div>
    </div>
  );
}
