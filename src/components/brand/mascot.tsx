"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The RevNetwork mascot: a fox, cut in the same flat facets as the logo's R
 * and painted in the brand's three colours — blue-violet, white, black.
 *
 * A fox because that is what a good affiliate is: quick, and hard to fool.
 * Drawn as polygons so it stays sharp at any size and can be cropped or posed
 * without an image file. The pale outline on the white facets is invisible on
 * the dark landing and is what keeps the muzzle from dissolving into a light
 * dashboard.
 *
 * Three ways to use it: `Mascot` is the head, `MascotFull` the whole animal
 * sitting, `MascotPeek` the head and two paws looking over an edge.
 */

const OUTLINE = {
  stroke: "#c9cbff",
  strokeWidth: 1.5,
  strokeLinejoin: "round" as const,
};

/** The head, on a 200 × 200 grid. Lit from the left: left facets are lighter. */
function HeadArt() {
  return (
    <>
      {/* Ears */}
      <path d="M32 10 88 60 26 96z" fill="#5b5fe9" />
      <path d="M32 10 41 31 31 90 26 96z" fill="#8f93fb" />
      <path d="M168 10 112 60 174 96z" fill="#4543d4" />
      <path d="M43 34 73 62 40 81z" fill="#2a2493" />
      <path d="M157 34 127 62 160 81z" fill="#211c7a" />
      <path d="M50 56 66 63 46 75z" fill="#4038cc" />
      <path d="M150 56 134 63 154 75z" fill="#352fb0" />
      {/* Cheek fur */}
      <path d="M20 122 3 135 26 142 10 158 56 162z" fill="#ffffff" {...OUTLINE} />
      <path
        d="M180 122 197 135 174 142 190 158 144 162z"
        fill="#dfe0ff"
        {...OUTLINE}
      />
      {/* Skull */}
      <path
        d="M26 96 88 60 100 55 112 60 174 96 180 124 146 162 100 194 54 162 20 124z"
        fill="#5b5fe9"
      />
      <path d="M26 96 88 60 100 55 100 108 58 102z" fill="#7d81f8" />
      <path d="M174 96 112 60 100 55 100 108 142 102z" fill="#4f4fe0" />
      <path d="M26 96 58 102 52 114 20 124z" fill="#686cf0" />
      <path d="M174 96 142 102 148 114 180 124z" fill="#4240cf" />
      <path d="M100 55 89 98 100 142 111 98z" fill="#bcbeff" />
      <path d="M100 55 89 98 100 142z" fill="#d3d4ff" />
      {/* Muzzle */}
      <path
        d="M20 124 52 114 86 132 100 152 100 194 54 162z"
        fill="#ffffff"
        {...OUTLINE}
      />
      <path
        d="M180 124 148 114 114 132 100 152 100 194 146 162z"
        fill="#dfe0ff"
        {...OUTLINE}
      />
      <path d="M54 162 100 176 146 162 100 194z" fill="#cfd1fb" />
      <path d="M54 162 100 176 100 194z" fill="#e6e7ff" />
      {/* Brows */}
      <path d="M42 101 76 89 81 95 45 107z" fill="#c4c6ff" />
      <path d="M158 101 124 89 119 95 155 107z" fill="#9093f5" />
      {/* Eyes: dark almond, violet iris, a glint */}
      <path d="M45 111 75 100 91 117 63 128z" fill="#0b0c14" />
      <path d="M155 111 125 100 109 117 137 128z" fill="#0b0c14" />
      <circle cx="70" cy="113" r="7.5" fill="#8a8dfb" />
      <circle cx="130" cy="113" r="7.5" fill="#8a8dfb" />
      <circle cx="71" cy="113.5" r="4" fill="#0b0c14" />
      <circle cx="129" cy="113.5" r="4" fill="#0b0c14" />
      <circle cx="67" cy="109.5" r="2.6" fill="#ffffff" />
      <circle cx="125.5" cy="109.5" r="2.6" fill="#ffffff" />
      {/* Whisker dots */}
      <g fill="#b9bbf5">
        <circle cx="62" cy="150" r="1.8" />
        <circle cx="72" cy="156" r="1.8" />
        <circle cx="74" cy="146" r="1.8" />
        <circle cx="138" cy="150" r="1.8" />
        <circle cx="128" cy="156" r="1.8" />
        <circle cx="126" cy="146" r="1.8" />
      </g>
      {/* Nose and mouth */}
      <path
        d="M88 155h24l-12 14z"
        fill="#0b0c14"
        stroke="#0b0c14"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M92 157h8l-4 4z" fill="#3b3d5c" />
      <path
        d="M100 169v5 M100 174q-8 8-18 3 M100 174q8 8 18 3"
        fill="none"
        stroke="#0b0c14"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

/** The fox's head. */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <HeadArt />
    </svg>
  );
}

/** The whole fox, sitting, tail to the right. Taller than wide: 320 × 380. */
export function MascotFull({ className }: { className?: string }) {
  const tail = useId();
  return (
    <svg viewBox="0 0 320 380" className={className} aria-hidden>
      <defs>
        <linearGradient id={tail} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4a46d6" />
          <stop offset="1" stopColor="#7b7ff7" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="356" rx="118" ry="13" fill="#000000" opacity="0.35" />
      {/* Tail */}
      <path
        d="M214 344 262 336 298 300 306 250 292 206 270 184 272 232 252 276 214 304z"
        fill={`url(#${tail})`}
      />
      <path d="M214 344 262 336 298 300 252 276 214 304z" fill="#4543d4" />
      <path
        d="M306 250 292 206 270 184 272 232 288 240z"
        fill="#ffffff"
        {...OUTLINE}
      />
      <path d="M270 184 272 232 288 240z" fill="#dfe0ff" />
      {/* Haunches */}
      <path d="M92 248 62 286 66 344 120 344 122 270z" fill="#6a6df0" />
      <path d="M228 248 258 286 254 344 200 344 198 270z" fill="#4240cf" />
      {/* Torso */}
      <path d="M104 170h112l18 84-8 90H94l-8-90z" fill="#5b5fe9" />
      <path d="M104 170h56v174H94l-8-90z" fill="#7377f5" />
      {/* Chest */}
      <path
        d="M118 176h84l-8 44 10 6-16 14 4 10-18 6-14 24-14-24-18-6 4-10-16-14 10-6z"
        fill="#ffffff"
        {...OUTLINE}
      />
      <path
        d="M160 176h42l-8 44 10 6-16 14 4 10-18 6-14 24z"
        fill="#dfe0ff"
      />
      {/* Front legs and paws */}
      <path d="M118 262h34v84h-38z" fill="#3a34bd" />
      <path d="M168 262h34l4 84h-38z" fill="#2f2aa6" />
      <path
        d="M108 344a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v8h-48z"
        fill="#ffffff"
        stroke="#c9cbff"
        strokeWidth="1.5"
      />
      <path
        d="M164 344a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v8h-48z"
        fill="#ffffff"
        stroke="#c9cbff"
        strokeWidth="1.5"
      />
      <path
        d="M124 338v10 M140 338v10 M180 338v10 M196 338v10"
        stroke="#b9bbf5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Head */}
      <svg x="60" y="0" width="200" height="200" viewBox="0 0 200 200">
        <HeadArt />
      </svg>
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
 * paws hang over by a little more than half their height. It rises from
 * behind the edge once, when the page loads.
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
