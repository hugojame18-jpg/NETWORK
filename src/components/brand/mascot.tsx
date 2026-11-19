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
 * in one of its poses, `MascotPeek` the head and two paws looking over an
 * edge.
 */

/** What the fox is doing. Each pose has a job; see `MascotFull`. */
export type MascotPose = "sit" | "wave" | "coin" | "cheer" | "sleep";
type Eyes = "open" | "happy" | "sleepy" | "wink";
type Mouth = "smile" | "open";

const OUTLINE = {
  stroke: "#c9cbff",
  strokeWidth: 1.5,
  strokeLinejoin: "round" as const,
};

/** The head, on a 200 × 200 grid. Lit from the left: left facets are lighter. */
function HeadArt({
  eyes = "open",
  mouth = "smile",
}: {
  eyes?: Eyes;
  mouth?: Mouth;
}) {
  const leftOpen = eyes === "open" || eyes === "wink";
  const rightOpen = eyes === "open";
  // A closed eye is one stroke: arched up when pleased, down when asleep.
  const lid = eyes === "sleepy" ? "q14 13 40 3" : "q14-17 40-5";
  const lidMirror = eyes === "sleepy" ? "q-14 13-40 3" : "q-14-17-40-5";
  const lidY = eyes === "sleepy" ? 112 : 120;
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
      {/* Eyes: dark almond, violet iris, a glint — or a single closed lid */}
      {leftOpen ? (
        <>
          <path d="M45 111 75 100 91 117 63 128z" fill="#0b0c14" />
          <circle cx="70" cy="113" r="7.5" fill="#8a8dfb" />
          <circle cx="71" cy="113.5" r="4" fill="#0b0c14" />
          <circle cx="67" cy="109.5" r="2.6" fill="#ffffff" />
        </>
      ) : (
        <path
          d={`M48 ${lidY}${lid}`}
          fill="none"
          stroke="#0b0c14"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      )}
      {rightOpen ? (
        <>
          <path d="M155 111 125 100 109 117 137 128z" fill="#0b0c14" />
          <circle cx="130" cy="113" r="7.5" fill="#8a8dfb" />
          <circle cx="129" cy="113.5" r="4" fill="#0b0c14" />
          <circle cx="125.5" cy="109.5" r="2.6" fill="#ffffff" />
        </>
      ) : (
        <path
          d={`M152 ${lidY}${lidMirror}`}
          fill="none"
          stroke="#0b0c14"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      )}
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
      {mouth === "open" ? (
        <>
          <path
            d="M86 173q14 20 28 0z"
            fill="#0b0c14"
            stroke="#0b0c14"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M94 181q6 6 12 0q-6-4-12 0z" fill="#8a8dfb" />
        </>
      ) : (
        <path
          d="M100 169v5 M100 174q-8 8-18 3 M100 174q8 8 18 3"
          fill="none"
          stroke="#0b0c14"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** The fox's head. `wink` closes one eye, for the places it says hello. */
export function Mascot({
  className,
  wink = false,
}: {
  className?: string;
  wink?: boolean;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <HeadArt eyes={wink ? "wink" : "open"} />
    </svg>
  );
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * A front leg lifted off the ground: a straight limb from the shoulder to
 * where the paw should be, and the paw itself turned to point along it.
 */
function Arm({
  from,
  to,
  width = 26,
  fill,
}: {
  from: [number, number];
  to: [number, number];
  width?: number;
  fill: string;
}) {
  const [sx, sy] = from;
  const [hx, hy] = to;
  const dx = hx - sx;
  const dy = hy - sy;
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * (width / 2);
  const ny = (dx / length) * (width / 2);
  const limb = [
    [sx + nx, sy + ny],
    [hx + nx, hy + ny],
    [hx - nx, hy - ny],
    [sx - nx, sy - ny],
  ]
    .map(([x, y]) => `${round(x)} ${round(y)}`)
    .join(" ");
  const angle = round((Math.atan2(dx, -dy) * 180) / Math.PI);
  return (
    <>
      <path d={`M${limb}z`} fill={fill} />
      <g transform={`translate(${hx} ${hy}) rotate(${angle})`}>
        <path
          d="M-15 8V-6a15 15 0 0 1 30 0V8z"
          fill="#ffffff"
          stroke="#c9cbff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M-5-18v10 M5-18v10"
          stroke="#b9bbf5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </>
  );
}

const FACES: Record<MascotPose, { eyes: Eyes; mouth: Mouth; tilt: number }> = {
  sit: { eyes: "open", mouth: "smile", tilt: 0 },
  wave: { eyes: "wink", mouth: "open", tilt: -5 },
  coin: { eyes: "open", mouth: "smile", tilt: 0 },
  cheer: { eyes: "happy", mouth: "open", tilt: 0 },
  sleep: { eyes: "sleepy", mouth: "smile", tilt: 5 },
};

/**
 * The whole fox, tail to the right. Taller than wide: 320 × 380.
 *
 * - `sit`   the default: it is simply there.
 * - `wave`  a paw up and a wink: greetings, welcomes, "write to us".
 * - `coin`  holding a coin: anything about being paid.
 * - `cheer` both paws up, eyes shut tight: a win, a tier reached.
 * - `sleep` eyes closed: nothing here yet, or waiting on someone.
 */
export function MascotFull({
  className,
  pose = "sit",
}: {
  className?: string;
  pose?: MascotPose;
}) {
  const tail = useId();
  const face = FACES[pose];
  const frontLegs = pose === "sit" || pose === "sleep";
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

      {/* Front legs on the ground, or whichever of them is still down */}
      {frontLegs && <path d="M118 262h34v84h-38z" fill="#3a34bd" />}
      {(frontLegs || pose === "wave") && (
        <path d="M168 262h34l4 84h-38z" fill="#2f2aa6" />
      )}
      {/* Paws on the ground */}
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

      {/* Lifted paws go up behind the head */}
      {pose === "wave" && (
        <>
          <Arm from={[108, 214]} to={[36, 122]} fill="#3a34bd" />
          <path
            d="M12 96q-9 13-3 28 M26 82q-6 8-5 16"
            fill="none"
            stroke="#aeb1ff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {pose === "cheer" && (
        <>
          <Arm from={[108, 214]} to={[40, 112]} fill="#3a34bd" />
          <Arm from={[212, 214]} to={[280, 112]} fill="#2f2aa6" />
          {/* Confetti, in the brand's colours */}
          <path d="M18 60l12-6 4 12-12 6z" fill="#8a8dfb" />
          <path d="M56 26l10 4-8 9z" fill="#ffffff" />
          <path d="M8 150l10-2 2 10-10 2z" fill="#ffffff" />
          <path d="M290 44l12 4-6 12-12-4z" fill="#ffffff" />
          <path d="M258 22l9-3 2 10z" fill="#8a8dfb" />
          <path d="M304 132l8 6-8 6-6-6z" fill="#8a8dfb" />
          <circle cx="36" cy="22" r="4" fill="#5b5fe9" />
          <circle cx="302" cy="92" r="4" fill="#c4c6ff" />
        </>
      )}

      {/* The coin, held against the chest */}
      {pose === "coin" && (
        <>
          <circle cx="160" cy="276" r="44" fill="#ffffff" stroke="#c9cbff" strokeWidth="1.5" />
          <circle cx="160" cy="276" r="35" fill="#eceeff" stroke="#5b5fe9" strokeWidth="4" />
          <path
            d="M171 262q-4-7-12-7q-11 0-11 9q0 8 12 11q12 3 12 11q0 9-12 9q-9 0-13-8 M160 247v58"
            fill="none"
            stroke="#5b5fe9"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Arm from={[110, 226]} to={[120, 280]} width={24} fill="#3a34bd" />
          <Arm from={[210, 226]} to={[200, 280]} width={24} fill="#2f2aa6" />
        </>
      )}

      {/* Head */}
      <g transform={face.tilt ? `rotate(${face.tilt} 160 190)` : undefined}>
        <svg x="60" y="0" width="200" height="200" viewBox="0 0 200 200">
          <HeadArt eyes={face.eyes} mouth={face.mouth} />
        </svg>
      </g>

      {pose === "sleep" && (
        <path
          d="M262 70h18l-18 20h18 M286 38h13l-13 15h13 M302 14h9l-9 10h9"
          fill="none"
          stroke="#aeb1ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
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
