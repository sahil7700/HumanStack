/**
 * HumanStack — Framer Motion spring physics config
 * All animations across the site derive from these constants
 * for a consistent, high-quality feel.
 */

import { Variants, Transition } from "framer-motion";

/* ── Spring presets ─────────────────────────────────── */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

export const springBounce: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 10,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 22,
};

export const easeOut: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
};

/* ── Common variants ─────────────────────────────────── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springGentle },
};

/* ── Word-level stagger (Hero headline) ───────────────── */
export const wordReveal: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      ...springBounce,
      delay: i * 0.08,
    },
  }),
};

/* ── Container stagger ────────────────────────────────── */
export function staggerContainer(stagger = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
}

/* ── Dashboard 3-D entrance ───────────────────────────── */
export const dashboardEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 80,
    rotateX: 10,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      ...springGentle,
      duration: 0.9,
    },
  },
};

/* ── Calendar cell stagger ────────────────────────────── */
export const calendarCell: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { ...springSnappy, delay: i * 0.018 },
  }),
};
