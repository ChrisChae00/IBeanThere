'use client';

/*
  Scopes the landing page and draws the reading-progress rule at the top of the
  viewport.

  It takes `children` so a server component can pass the whole page through it
  without any of the sections themselves becoming client components.
*/

import { motion, useScroll, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';

export default function LandingMotionRoot({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  /*
    Sprung rather than raw: the raw value tracks the wheel exactly, which on a
    2px rule reads as jitter. The spring costs one frame of lag and buys a line
    that glides.
  */
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div className="landing relative">
      {/*
        Sits above the fixed header because it is a readout, not chrome to be
        navigated -- `--z-nav-progress` is the slot directly over `--z-nav` in the
        nav stack declared in tokens.css. `transformOrigin` left, so it grows from
        the corner.
      */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress, transformOrigin: '0% 50%' }}
        className="fixed inset-x-0 top-0 z-(--z-nav-progress) h-[2px] bg-brand"
      />
      {children}
    </div>
  );
}
