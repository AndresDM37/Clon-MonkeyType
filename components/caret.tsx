"use client";

import { motion } from "motion/react";

interface CaretProps {
  x: number;
  y: number;
  height: number;
  blink: boolean;
}

export function Caret({ x, y, height, blink }: CaretProps) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute left-0 top-0 w-[2px] rounded-full bg-tt-caret ${
        blink ? "caret-blink" : ""
      }`}
      initial={false}
      animate={{ x, y, height }}
      transition={{ type: "spring", stiffness: 1400, damping: 90, mass: 0.4 }}
    />
  );
}
